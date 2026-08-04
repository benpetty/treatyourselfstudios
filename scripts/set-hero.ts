import { uploadImage } from "./seed-data/helpers";
import { createWriteClient } from "./sanity-client";

const heroPath = process.argv[ 2 ];
const heroAlt = process.argv[ 3 ];
if( !heroPath || !heroAlt ) {
  throw new Error( 'Usage: yarn tsx scripts/set-hero.ts <path-to-hero-image> "<alt text>"' );
}

const client = createWriteClient();

async function setHero(): Promise<void> {
  // uploadImage dedups by originalFilename: re-running with a regenerated file
  // of the same name silently reuses the previously uploaded asset.
  const heroImage = await uploadImage( client, heroPath, heroAlt );
  await client.patch( "homePage" ).set( { heroImage } ).commit();
  console.log( `homePage.heroImage now points at ${heroPath}` );
}

setHero().catch( ( error ) => {
  console.error( error );
  process.exit( 1 );
} );
