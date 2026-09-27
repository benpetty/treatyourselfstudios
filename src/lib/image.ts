import { getImageDimensions } from "@sanity/asset-utils";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityClient, type SanityImage } from "./sanity";

const builder = createImageUrlBuilder( sanityClient );

export function urlFor( source: SanityImageSource ) {
  return builder.image( source );
}

interface ImageCrop {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

function isImageCrop( value: unknown ): value is ImageCrop {
  return typeof value === "object" && value !== null
    && [ "top", "bottom", "left", "right" ].every( ( side ) => typeof Reflect.get( value, side ) === "number" );
}

// Width that preserves the image's aspect ratio (after any Studio crop, which urlFor
// applies) at the given rendered height. An <img> needs both attributes to reserve
// its box before it loads; without one it lays out at zero and shifts the page.
export function widthAtHeight( image: SanityImage, height: number ): number {
  const assetId = image.asset._id ?? image.asset._ref;
  if( !assetId ) throw new Error( `Sanity image "${image.alt}" has no asset id; dereference or reference the asset.` );
  const source = getImageDimensions( assetId );
  const crop = isImageCrop( image.crop ) ? image.crop : { top: 0, bottom: 0, left: 0, right: 0 };
  const croppedWidth = source.width * ( 1 - crop.left - crop.right );
  const croppedHeight = source.height * ( 1 - crop.top - crop.bottom );
  return Math.round( height * croppedWidth / croppedHeight );
}
