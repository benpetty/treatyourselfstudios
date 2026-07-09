import { createClient, type IdentifiedSanityDocumentStub } from "@sanity/client";
import { buildDeals } from "./seed-data/deals";
import { buildFaqs } from "./seed-data/faqs";
import { buildHomePage } from "./seed-data/homePage";
import { buildServiceContent } from "./seed-data/services";
import { buildSiteSettings } from "./seed-data/siteSettings";
import { buildTeamMembers } from "./seed-data/teamMembers";
import { buildTestimonials } from "./seed-data/testimonials";

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_DATASET;
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN;

if( !SANITY_PROJECT_ID ) throw new Error( "Missing SANITY_PROJECT_ID env var" );
if( !SANITY_DATASET ) throw new Error( "Missing SANITY_DATASET env var" );
if( !SANITY_API_TOKEN ) throw new Error( "Missing SANITY_API_TOKEN env var (needs write access for seeding)" );

const client = createClient( {
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2026-07-09",
  useCdn: false,
  token: SANITY_API_TOKEN,
} );

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
  console.log( `Seeded ${documents.length} documents into ${SANITY_DATASET}` );
}

seed().catch( ( error ) => {
  console.error( error );
  process.exit( 1 );
} );
