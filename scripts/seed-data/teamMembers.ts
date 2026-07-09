import type { SanityClient } from "@sanity/client";
import { richText, uploadImage } from "./helpers";

export async function buildTeamMembers( client: SanityClient ) {
  return [
    {
      _id: "team-nichele",
      _type: "teamMember",
      name: "Nichele",
      role: "Owner & Esthetician",
      bio: richText( [
        "A Seattle native and licensed esthetician, Nichele makes it her top priority to balance and enhance your skin's natural radiance. Working with today's top tools, techniques, and product lines, she can help reduce — or completely eliminate — problem skin.",
        "Hair removal needs? Brow, bikini, or back, there's no surface too big or too small. With a \"no hair left behind\" mindset, Nichele prides herself on quick, intuitive, and accurate service. Custom facials, hair removal, body treatments, and more — Nichele is the esthetician to see.",
      ] ),
      photo: await uploadImage( client, "docs/content-audit/images/FF0554C5-E643-49EE-9520-12A4283B4E26.jpg", "Nichele, owner and esthetician at Treat YourSelf Studios" ),
      order: 1,
    },
    {
      _id: "team-saphiyah",
      _type: "teamMember",
      name: "Saphiyah",
      role: "Esthetician & Lash Specialist",
      bio: richText( [
        "Hi, I'm Saphiyah! I'm a licensed esthetician who loves helping people look and feel their best. My goal is to provide relaxing, results-driven treatments tailored to each client's unique skincare needs — leaving you refreshed, confident, and glowing.",
      ] ),
      photo: await uploadImage( client, "docs/content-audit/images/49AF74D4-DC29-4BDD-9DD7-03D105311934.png", "Saphiyah, esthetician and lash specialist at Treat YourSelf Studios" ),
      order: 2,
    },
  ];
}
