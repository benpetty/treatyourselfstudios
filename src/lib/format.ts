import type { PriceVariant } from "./sanity";

export function formatPrice( variants: PriceVariant[] ): string {
  if( !variants.length ) throw new Error( "formatPrice called with no price variants" );
  return variants.map( ( variant ) => `$${variant.amount}` ).join( " / " );
}

export function formatPriceLabels( variants: PriceVariant[] ): string | undefined {
  const labels = variants.map( ( variant ) => variant.label ).filter( ( label ): label is string => Boolean( label ) );
  return labels.length ? labels.join( " / " ) : undefined;
}

export function formatDuration( minutes: number ): string {
  return `${minutes} min`;
}
