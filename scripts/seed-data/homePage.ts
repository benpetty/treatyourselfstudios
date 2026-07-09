import type { SanityClient } from "@sanity/client";
import { richText, uploadImage } from "./helpers";

export async function buildHomePage( client: SanityClient ) {
  return {
    _id: "homePage",
    _type: "homePage",
    heroHeading: "Take a well-deserved break — treat yourself.",
    heroSubheading:
      "Custom facials, expert waxing, and restorative body treatments in a calm, one-on-one studio in Seattle. By appointment only.",
    heroImage: await uploadImage( client, "docs/content-audit/images/E998EFC5-BF68-45F2-8B0E-56BC3026C222.png", "Smiling client with a fresh facial masque at Treat YourSelf Studios" ),
    welcomeHeading: "The best journey in life is the journey back to yourself",
    welcomeBody: richText( [
      "Step away from the stress of your busy day and focus on you. At Treat YourSelf Studios, every visit is one-on-one: your esthetician's full attention, a full range of professional treatments, and products that are all-natural, cruelty-free, and free of parabens, synthetic dyes, and fragrances.",
      "Whether you're here for a custom facial, silky-smooth waxing, or a head-to-toe body treatment, you'll leave rejuvenated, glowing, and already planning your next visit.",
    ] ),
    seoTitle: "Facials, Waxing & Spa Treatments in Seattle",
    seoDescription:
      "Treat YourSelf Studios is an appointment-only esthetics studio in Seattle. Custom facials, Brazilian waxing, lash & brow services, and body treatments. Book online.",
  };
}
