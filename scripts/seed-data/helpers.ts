import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import type { SanityClient } from "@sanity/client";

interface SeedTextBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3";
  markDefs: never[];
  children: Array<{ _type: "span"; _key: string; text: string; marks: never[] }>;
}

function stableKey( text: string, index: number ): string {
  return createHash( "sha1" ).update( `${index}:${text}` ).digest( "hex" ).slice( 0, 12 );
}

/** Convert plain paragraphs into Portable Text blocks with stable keys. */
export function richText( paragraphs: string[] ): SeedTextBlock[] {
  return paragraphs.map( ( paragraph, index ) => ( {
    _type: "block",
    _key: stableKey( paragraph, index ),
    style: "normal",
    markDefs: [],
    children: [ { _type: "span", _key: stableKey( paragraph, index + 1000 ), text: paragraph, marks: [] } ],
  } ) );
}

/** Upload an image once; reuse by deterministic filename check. Returns an image field value. */
export async function uploadImage( client: SanityClient, filePath: string, altText: string ) {
  const fileName = basename( filePath );
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $fileName][0]{ _id }`,
    { fileName },
  );
  const assetId = existing
    ? existing._id
    : ( await client.assets.upload( "image", readFileSync( filePath ), { filename: fileName } ) )._id;
  return { _type: "image", asset: { _type: "reference", _ref: assetId }, alt: altText };
}
