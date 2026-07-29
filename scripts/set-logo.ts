import { uploadImage } from "./seed-data/helpers";
import { createWriteClient } from "./sanity-client";

const logoPath = process.argv[ 2 ];
if( !logoPath ) throw new Error( "Usage: yarn tsx scripts/set-logo.ts <path-to-logo-image>" );

const client = createWriteClient();

async function setLogo(): Promise<void> {
  const logo = await uploadImage(
    client,
    logoPath,
    "Treat YourSelf Studios logo — a green succulent inside a brush-stroke circle",
  );
  await client.patch( "siteSettings" ).set( { logo } ).commit();
  console.log( `siteSettings.logo now points at ${logoPath}` );
}

setLogo().catch( ( error ) => {
  console.error( error );
  process.exit( 1 );
} );
