import { createClient } from "@sanity/client";

const SANITY_PROJECT_ID = import.meta.env.SANITY_PROJECT_ID;
const SANITY_DATASET = import.meta.env.SANITY_DATASET;
const SANITY_API_TOKEN = import.meta.env.SANITY_API_TOKEN;

if( !SANITY_PROJECT_ID ) throw new Error( "Missing SANITY_PROJECT_ID env var" );
if( !SANITY_DATASET ) throw new Error( "Missing SANITY_DATASET env var" );
if( !SANITY_API_TOKEN ) throw new Error( "Missing SANITY_API_TOKEN env var" );

export const sanityClient = createClient( {
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2026-07-09",
  useCdn: false,
  token: SANITY_API_TOKEN,
} );

// --- Shared types ---

export interface SanitySlug {
  current: string;
}

export interface SanityImage {
  asset: {
    _id?: string;
    _ref?: string;
    url?: string;
    metadata?: unknown;
  };
  alt: string;
  crop?: unknown;
  hotspot?: unknown;
}

export interface PortableTextBlock {
  _type: string;
  _key?: string;
  [key: string]: unknown;
}

export type PortableText = PortableTextBlock[];

export interface PriceVariant {
  label?: string;
  amount: number;
}

// --- Build-time validation ---

export function assertPresent<Value>( value: Value | null | undefined, label: string ): Value {
  if( value === null || value === undefined ) {
    throw new Error( `Sanity data missing: ${label}. Fix the document in Studio, then rebuild.` );
  }
  return value;
}

function assertServiceComplete( service: Service ): Service {
  if( !service.prices?.length ) {
    throw new Error( `Sanity data missing: service "${service.name}" has no prices. Fix it in Studio.` );
  }
  return service;
}

// --- Documents ---

export interface SiteSettings {
  siteTitle: string;
  tagline?: string;
  siteDescription: string;
  logo?: SanityImage;
  phone: string;
  phoneE164: string;
  email?: string;
  address: { street: string; city: string; state: string; zip: string };
  geo: { lat: number; lng: number };
  hoursNote: string;
  priceRange: string;
  bookingUrl: string;
  giftCardUrl: string;
  shopUrl?: string;
  firstVisitOffer?: string;
  socialLinks?: { instagram?: string; facebook?: string; twitter?: string; yelp?: string };
}

export interface HomePage {
  heroHeading: string;
  heroSubheading: string;
  heroImage?: SanityImage;
  welcomeHeading: string;
  welcomeBody: PortableText;
  seoTitle: string;
  seoDescription: string;
}

export interface EducationBlock {
  heading: string;
  body: PortableText;
}

export interface ServiceCategory {
  _id: string;
  title: string;
  slug: SanitySlug;
  menuLabel?: string;
  order: number;
  isAddOnCategory?: boolean;
  seoTitle: string;
  seoDescription: string;
  intro: PortableText;
  educationBlocks?: EducationBlock[];
  preCare?: PortableText;
  postCare?: PortableText;
  heroImage?: SanityImage;
}

export interface Service {
  _id: string;
  name: string;
  slug: SanitySlug;
  categorySlug: string;
  order: number;
  prices: PriceVariant[];
  priceNote?: string;
  durationMinutes?: number;
  benefit: string;
  description?: PortableText;
  featured?: boolean;
  seasonal?: boolean;
}

export interface ServicePackage {
  _id: string;
  name: string;
  slug: SanitySlug;
  order: number;
  prices: PriceVariant[];
  durationMinutes?: number;
  benefit: string;
  description: PortableText;
}

export interface Deal {
  _id: string;
  title: string;
  details: string;
  finePrint?: string;
  order: number;
}

export interface Faq {
  _id: string;
  question: string;
  answer: PortableText;
  order: number;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: PortableText;
  photo?: SanityImage;
  order: number;
}

export interface Testimonial {
  _id: string;
  quote: string;
  attribution: string;
  location?: string;
  order: number;
}

// --- Queries ---

const SERVICE_PROJECTION = `{
  _id, name, slug, "categorySlug": category->slug.current, order,
  prices[]{ label, amount }, priceNote, durationMinutes,
  benefit, description, featured, seasonal
}`;

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await sanityClient.fetch<SiteSettings | null>(
    `*[_type == "siteSettings"][0]{
      siteTitle, tagline, siteDescription,
      logo{ asset->, alt, crop, hotspot },
      phone, phoneE164, email, address, geo, hoursNote, priceRange,
      bookingUrl, giftCardUrl, shopUrl, firstVisitOffer, socialLinks
    }`,
  );
  return assertPresent( settings, "siteSettings singleton" );
}

export async function getHomePage(): Promise<HomePage> {
  const homePage = await sanityClient.fetch<HomePage | null>(
    `*[_type == "homePage"][0]{
      heroHeading, heroSubheading,
      heroImage{ asset->, alt, crop, hotspot },
      welcomeHeading, welcomeBody, seoTitle, seoDescription
    }`,
  );
  return assertPresent( homePage, "homePage singleton" );
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  return sanityClient.fetch<ServiceCategory[]>(
    `*[_type == "serviceCategory"] | order(order asc){
      _id, title, slug, menuLabel, order, isAddOnCategory,
      seoTitle, seoDescription, intro, educationBlocks[]{ heading, body },
      preCare, postCare,
      heroImage{ asset->, alt, crop, hotspot }
    }`,
  );
}

export async function getAllServices(): Promise<Service[]> {
  const services = await sanityClient.fetch<Service[]>(
    `*[_type == "service"] | order(order asc) ${SERVICE_PROJECTION}`,
  );
  return services.map( assertServiceComplete );
}

export async function getServicesByCategory( categorySlug: string ): Promise<Service[]> {
  const services = await sanityClient.fetch<Service[]>(
    `*[_type == "service" && category->slug.current == $categorySlug] | order(order asc) ${SERVICE_PROJECTION}`,
    { categorySlug },
  );
  return services.map( assertServiceComplete );
}

export async function getServicePackages(): Promise<ServicePackage[]> {
  return sanityClient.fetch<ServicePackage[]>(
    `*[_type == "servicePackage"] | order(order asc){
      _id, name, slug, order, prices[]{ label, amount },
      durationMinutes, benefit, description
    }`,
  );
}

export async function getDeals(): Promise<Deal[]> {
  return sanityClient.fetch<Deal[]>(
    `*[_type == "deal"] | order(order asc){ _id, title, details, finePrint, order }`,
  );
}

export async function getFaqs(): Promise<Faq[]> {
  return sanityClient.fetch<Faq[]>(
    `*[_type == "faq"] | order(order asc){ _id, question, answer, order }`,
  );
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return sanityClient.fetch<TeamMember[]>(
    `*[_type == "teamMember"] | order(order asc){
      _id, name, role, bio, photo{ asset->, alt, crop, hotspot }, order
    }`,
  );
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return sanityClient.fetch<Testimonial[]>(
    `*[_type == "testimonial"] | order(order asc){ _id, quote, attribution, location, order }`,
  );
}
