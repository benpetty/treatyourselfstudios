import { uploadImage } from "./seed-data/helpers";
import { SITE_LOGO_ALT } from "./seed-data/siteSettings";
import { createWriteClient } from "./sanity-client";

const logoPath = process.argv[ 2 ];
if( !logoPath ) throw new Error( "Usage: yarn tsx scripts/set-logo.ts <path-to-logo-image>" );

const client = createWriteClient();

async function setLogo(): Promise<void> {
  // uploadImage dedups by originalFilename: re-running with a regenerated file
  // of the same name silently reuses the previously uploaded asset.
  const logo = await uploadImage(
    client,
    logoPath,
    SITE_LOGO_ALT,
  );
  await client.patch( "siteSettings" ).set( { logo } ).commit();
  console.log( `siteSettings.logo now points at ${logoPath}` );
}

setLogo().catch( ( error ) => {
  console.error( error );
  process.exit( 1 );
} );
