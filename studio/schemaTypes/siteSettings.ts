import { defineField, defineType } from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', title: 'Site Title', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', description: 'Short brand line used in the footer and default page titles' }),
    defineField({ name: 'siteDescription', title: 'Default SEO Description', type: 'text', rows: 3, validation: ( rule ) => rule.required().max( 160 ) }),
    defineField({
      name: 'logo', title: 'Logo', type: 'image', options: { hotspot: true },
      fields: [ defineField({ name: 'alt', title: 'Alternative Text', type: 'string', validation: ( rule ) => rule.required() }) ],
    }),
    defineField({ name: 'phone', title: 'Phone (display)', type: 'string', description: 'e.g. (206) 717-4843', validation: ( rule ) => rule.required() }),
    defineField({ name: 'phoneE164', title: 'Phone (tel: link)', type: 'string', description: 'e.g. +12067174843', validation: ( rule ) => rule.required().regex( /^\+1\d{10}$/ ) }),
    defineField({ name: 'email', title: 'Contact Email', type: 'string', validation: ( rule ) => rule.email() }),
    defineField({
      name: 'address', title: 'Address', type: 'object',
      fields: [
        defineField({ name: 'street', title: 'Street', type: 'string', validation: ( rule ) => rule.required() }),
        defineField({ name: 'city', title: 'City', type: 'string', validation: ( rule ) => rule.required() }),
        defineField({ name: 'state', title: 'State', type: 'string', validation: ( rule ) => rule.required() }),
        defineField({ name: 'zip', title: 'ZIP', type: 'string', validation: ( rule ) => rule.required() }),
      ],
    }),
    defineField({
      name: 'geo', title: 'Map Coordinates', type: 'geopoint',
      description: 'Must match the Google Business Profile pin',
      validation: ( rule ) => rule.required(),
    }),
    defineField({ name: 'hoursNote', title: 'Hours Note', type: 'string', description: 'e.g. "By appointment only"', validation: ( rule ) => rule.required() }),
    defineField({ name: 'priceRange', title: 'Price Range', type: 'string', description: 'For LocalBusiness JSON-LD, e.g. "$15-$140"', validation: ( rule ) => rule.required() }),
    defineField({ name: 'bookingUrl', title: 'Square Booking URL', type: 'url', validation: ( rule ) => rule.required().uri({ scheme: [ 'https' ] }) }),
    defineField({ name: 'giftCardUrl', title: 'Square Gift Card URL', type: 'url', validation: ( rule ) => rule.required().uri({ scheme: [ 'https' ] }) }),
    defineField({ name: 'shopUrl', title: 'Square Online Shop URL', type: 'url', validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }) }),
    defineField({ name: 'firstVisitOffer', title: 'First-Visit Offer Banner', type: 'string', description: 'Shown in the site-wide announcement bar; empty hides the bar' }),
    defineField({
      name: 'googleRating', title: 'Google Rating', type: 'number',
      description: 'Aggregate rating shown in the testimonial band; leave empty to hide the number',
      validation: ( rule ) => rule.min( 0 ).max( 5 ).precision( 1 ),
    }),
    defineField({
      name: 'googleReviewUrl', title: 'Google Reviews URL', type: 'url',
      description: 'Link to the Google Business reviews',
      validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }),
    }),
    defineField({
      name: 'socialLinks', title: 'Social Links', type: 'object',
      fields: [
        defineField({ name: 'instagram', title: 'Instagram URL', type: 'url', validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }) }),
        defineField({ name: 'facebook', title: 'Facebook URL', type: 'url', validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }) }),
        defineField({ name: 'twitter', title: 'X / Twitter URL', type: 'url', validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }) }),
        defineField({ name: 'yelp', title: 'Yelp URL', type: 'url', validation: ( rule ) => rule.uri({ scheme: [ 'https' ] }) }),
      ],
    }),
  ],
})
