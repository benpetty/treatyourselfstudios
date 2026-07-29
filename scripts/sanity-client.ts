import { createClient, type SanityClient } from "@sanity/client";

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_DATASET;
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN;

if( !SANITY_PROJECT_ID ) throw new Error( "Missing SANITY_PROJECT_ID env var" );
if( !SANITY_DATASET ) throw new Error( "Missing SANITY_DATASET env var" );
if( !SANITY_API_TOKEN ) throw new Error( "Missing SANITY_API_TOKEN env var (needs write access)" );

/** Client for write-capable content scripts (seed, set-logo). */
export function createWriteClient(): SanityClient {
  return createClient( {
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: "2026-07-09",
    useCdn: false,
    token: SANITY_API_TOKEN,
  } );
}
