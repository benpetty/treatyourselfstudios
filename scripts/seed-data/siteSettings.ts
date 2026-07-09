import type { SanityClient } from "@sanity/client";

export async function buildSiteSettings( _client: SanityClient ) {
  return {
    _id: "siteSettings",
    _type: "siteSettings",
    siteTitle: "Treat YourSelf Studios",
    tagline: "The best journey in life is the journey back to yourself.",
    siteDescription:
      "Appointment-only esthetics studio in Seattle offering custom facials, waxing, lash & brow services, and body treatments. Treat yourself — book online today.",
    phone: "(206) 717-4843",
    phoneE164: "+12067174843",
    address: { street: "3902 S Ferdinand St Unit 101", city: "Seattle", state: "WA", zip: "98118" },
    geo: { _type: "geopoint", lat: 47.559, lng: -122.2855 },
    hoursNote: "By appointment only",
    priceRange: "$15-$140",
    bookingUrl: "https://squareup.com/appointments/book/E92Q1CBDSF7V8/treat-yourself-studios-seattle-wa",
    giftCardUrl: "https://squareup.com/gift/1R0F1BKX04VN4/order",
    firstVisitOffer: "First-time clients: mention this offer when booking for 15% off your first service",
    socialLinks: {
      instagram: "https://www.instagram.com/treatyourselfstudios",
      facebook: "https://www.facebook.com/239257876595827",
      twitter: "https://www.x.com/studios_treat",
      yelp: "https://www.yelp.com/biz/treat-yourself-studios-seattle",
    },
  };
}
