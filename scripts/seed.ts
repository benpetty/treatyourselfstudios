import { type IdentifiedSanityDocumentStub } from "@sanity/client";
import { buildDeals } from "./seed-data/deals";
import { buildFaqs } from "./seed-data/faqs";
import { buildHomePage } from "./seed-data/homePage";
import { buildServiceContent } from "./seed-data/services";
import { buildSiteSettings } from "./seed-data/siteSettings";
import { buildTeamMembers } from "./seed-data/teamMembers";
import { buildTestimonials } from "./seed-data/testimonials";
import { createWriteClient } from "./sanity-client";

const client = createWriteClient();

async function seed() {
  // Explicit element type: without it, TS unifies the heterogeneous document
  // shapes into a union that createOrReplace's generic can't instantiate.
  const documents: IdentifiedSanityDocumentStub[] = [
    await buildSiteSettings( client ),
    await buildHomePage( client ),
    ...buildDeals(),
    ...buildFaqs(),
    ...buildTestimonials(),
    ...( await buildTeamMembers( client ) ),
    ...( await buildServiceContent( client ) ),
  ];

  let transaction = client.transaction();
  for( const document of documents ) {
    transaction = transaction.createOrReplace( document );
  }
  await transaction.commit();
  console.log( `Seeded ${documents.length} documents into ${client.config().dataset}` );
}

seed().catch( ( error ) => {
  console.error( error );
  process.exit( 1 );
} );
