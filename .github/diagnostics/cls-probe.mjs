// TEMPORARY CI diagnostic for PR #26 — remove before merge.
// Loads the homepage in the runner's Chrome with Lighthouse's mobile emulation
// and prints every layout shift with its sources' before/after rects.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import puppeteer from "puppeteer-core";

const DIST_DIRECTORY = process.argv[ 2 ];
const RUN_COUNT = 3;
const CONTENT_TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png" };

const server = createServer( ( request, response ) => {
  const requestPath = decodeURIComponent( new URL( request.url, "http://localhost" ).pathname );
  const candidatePath = join( DIST_DIRECTORY, requestPath );
  const filePath = existsSync( candidatePath ) && statSync( candidatePath ).isDirectory() ? join( candidatePath, "index.html" ) : candidatePath;
  if( !existsSync( filePath ) ) {
    response.writeHead( 404 ).end();
    return;
  }
  response.writeHead( 200, { "content-type": CONTENT_TYPES[ extname( filePath ) ] ?? "application/octet-stream" } );
  createReadStream( filePath ).pipe( response );
} );
await new Promise( ( resolve ) => server.listen( 0, "127.0.0.1", resolve ) );
const { port } = server.address();

const browser = await puppeteer.launch( { executablePath: "/usr/bin/google-chrome", args: [ "--no-sandbox" ] } );
for( let runIndex = 1; runIndex <= RUN_COUNT; runIndex++ ) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.emulate( {
    viewport: { width: 412, height: 823, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true },
    userAgent: "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  } );
  await page.evaluateOnNewDocument( () => {
    const describe = ( node ) => node?.nodeType === 1 ? `${node.tagName.toLowerCase()}.${[ ...node.classList ].join( "." )}` : String( node?.nodeName );
    const rect = ( domRect ) => `y${Math.round( domRect.y )} h${Math.round( domRect.height )} w${Math.round( domRect.width )}`;
    window.shiftLog = [];
    new PerformanceObserver( ( list ) => {
      for( const entry of list.getEntries() ) {
        window.shiftLog.push( {
          at: Math.round( entry.startTime ),
          value: entry.value.toFixed( 4 ),
          fontsStatus: document.fonts.status,
          sources: entry.sources.map( ( source ) => `${describe( source.node )} ${rect( source.previousRect )} -> ${rect( source.currentRect )}` ),
        } );
      }
    } ).observe( { type: "layout-shift", buffered: true } );
  } );
  await page.goto( `http://127.0.0.1:${port}/`, { waitUntil: "networkidle0" } );
  await new Promise( ( resolve ) => setTimeout( resolve, 1500 ) );
  const result = await page.evaluate( () => ( {
    shifts: window.shiftLog,
    announcementHeight: document.querySelector( ".announcement" )?.getBoundingClientRect().height,
    sprigBox: ( () => {
      const box = document.querySelector( ".sprig" )?.getBoundingClientRect();
      return box && `w${box.width.toFixed( 1 )} h${box.height.toFixed( 1 )}`;
    } )(),
  } ) );
  console.log( `--- run ${runIndex} ---` );
  console.log( JSON.stringify( result, null, 1 ) );
  await context.close();
}
await browser.close();
server.close();
