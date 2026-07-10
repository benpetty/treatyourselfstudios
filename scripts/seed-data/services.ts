import type { SanityClient } from "@sanity/client";
import { richText, uploadImage } from "./helpers";

interface PriceInput {
  label?: string;
  amount: number;
}

interface ServiceInput {
  slug: string;
  name: string;
  category: "hair-removal" | "facials" | "lash-and-brow" | "body-treatments" | "add-ons";
  order: number;
  prices: PriceInput[];
  priceNote?: string;
  durationMinutes?: number;
  benefit: string;
  description?: string[];
  featured?: boolean;
  seasonal?: boolean;
}

interface PackageInput {
  slug: string;
  name: string;
  order: number;
  prices: PriceInput[];
  durationMinutes: number;
  benefit: string;
  description: string[];
}

function kebab( label: string ): string {
  return label.toLowerCase().replace( /[^a-z0-9]+/g, "-" ).replace( /^-|-$/g, "" );
}

function priceVariants( prices: PriceInput[] ) {
  return prices.map( ( priceInput ) => ( {
    _type: "priceVariant",
    _key: priceInput.label ? kebab( priceInput.label ) : "base",
    ...( priceInput.label ? { label: priceInput.label } : {} ),
    amount: priceInput.amount,
  } ) );
}

function serviceDoc( input: ServiceInput ) {
  return {
    _id: `service-${input.slug}`,
    _type: "service",
    name: input.name,
    slug: { _type: "slug", current: input.slug },
    category: { _type: "reference", _ref: `category-${input.category}` },
    order: input.order,
    prices: priceVariants( input.prices ),
    ...( input.priceNote ? { priceNote: input.priceNote } : {} ),
    ...( input.durationMinutes ? { durationMinutes: input.durationMinutes } : {} ),
    benefit: input.benefit,
    ...( input.description ? { description: richText( input.description ) } : {} ),
    featured: input.featured ?? false,
    seasonal: input.seasonal ?? false,
  };
}

function packageDoc( input: PackageInput ) {
  return {
    _id: `package-${input.slug}`,
    _type: "servicePackage",
    name: input.name,
    slug: { _type: "slug", current: input.slug },
    order: input.order,
    prices: priceVariants( input.prices ),
    durationMinutes: input.durationMinutes,
    benefit: input.benefit,
    description: richText( input.description ),
  };
}

function educationBlock( key: string, heading: string, paragraphs: string[] ) {
  return { _type: "educationBlock", _key: key, heading, body: richText( paragraphs ) };
}

export async function buildServiceContent( client: SanityClient ) {
  const categories = [
    {
      _id: "category-hair-removal",
      _type: "serviceCategory",
      title: "Hair Removal & Waxing",
      slug: { _type: "slug", current: "hair-removal" },
      menuLabel: "Hair Removal",
      order: 1,
      isAddOnCategory: false,
      seoTitle: "Waxing & Hair Removal in Seattle",
      seoDescription:
        "Expert waxing in Seattle — brows to Brazilians, with a \"no hair left behind\" touch. See prices and book your appointment online.",
      intro: richText( [
        "From a quick brow cleanup to a full Brazilian, every wax here is quick, thorough, and as comfortable as we can make it. Prices below — pick your service and book in minutes.",
      ] ),
      educationBlocks: [],
      preCare: richText( [
        "Taking an anti-inflammatory (like ibuprofen) twenty minutes before your service helps reduce discomfort.",
        "Skip self-tanners, body sprays, deodorant, and other topical creams before your appointment.",
        "If you've been shaving, allow 2–3 weeks of growth — about a quarter inch — for a clean removal.",
        "Exfoliate the area gently 24 hours beforehand to clear dead skin cells, and wear loose, comfortable clothing to prevent irritation afterward.",
      ] ),
      postCare: richText( [
        "For 48 hours after hair removal: no tanning, sunbathing, hot tubs, or saunas — a fresh layer of skin burns easily. No hot baths or exercise for 2 hours after your treatment.",
        "If your skin feels sensitive, a cold compress or hydrocortisone cream calms redness and irritation. Resume gentle daily exfoliation 48 hours after your treatment.",
        "Plan to come back every 3–5 weeks. Regular maintenance lets your skin acclimate, slows regrowth, and makes each visit more comfortable than the last.",
        "Please note: epilation during your period may heighten discomfort, and sensitive skin can experience minor breakouts. If you notice signs of infection, have it evaluated by a doctor promptly.",
      ] ),
      heroImage: await uploadImage( client, "docs/content-audit/images/9833A5C9-9F7E-47CB-980A-219960F3B827_1_105_c.jpeg", "Esthetician applying a wax strip during a leg waxing service" ),
    },
    {
      _id: "category-facials",
      _type: "serviceCategory",
      title: "Facials",
      slug: { _type: "slug", current: "facials" },
      menuLabel: "Facials",
      order: 2,
      isAddOnCategory: false,
      seoTitle: "Custom Facials in Seattle",
      seoDescription:
        "Custom facials in Seattle with all-natural, cruelty-free products — express to extended sessions, peels, and seasonal treatments. Book online.",
      intro: richText( [
        "Every facial begins with a thorough cleansing and skin analysis, followed by exfoliation with extractions (if needed), a custom treatment masque, and a collagen-stimulating facial massage — purifying, oxygenating, and balancing your skin so you leave nourished and refreshed.",
        "Every product we use is all natural and cruelty free — formulated without parabens, petrochemicals, synthetic dyes, fragrances, or GMOs.",
      ] ),
      educationBlocks: [],
      postCare: richText( [
        "If your skin goes through a \"purging\" phase after your facial and you break out a little — don't worry. Facials are designed to clear toxins deep in the skin, and some of those toxins can surface as whiteheads or pimples on their way out. It's completely normal, it doesn't last long, and your skin will be clear again within a few days.",
      ] ),
      heroImage: await uploadImage( client, "docs/content-audit/images/blob-0009.png", "Facial masque being applied with a soft brush during a custom facial" ),
    },
    {
      _id: "category-lash-and-brow",
      _type: "serviceCategory",
      title: "Lash & Brow",
      slug: { _type: "slug", current: "lash-and-brow" },
      menuLabel: "Lash & Brow",
      order: 3,
      isAddOnCategory: false,
      seoTitle: "Lash Lifts & Brow Services in Seattle",
      seoDescription:
        "Lash lifts, henna brows, tinting, and brow lamination in Seattle — toxin-free, vegan-based color. See prices and book online.",
      intro: richText( [
        "From lifted lashes to laminated brows, every service here makes the most of what you already have — no extensions required. Curious how a treatment works? The explainers below have you covered.",
      ] ),
      educationBlocks: [
        educationBlock( "lash-lift", "What is a lash lift?", [
          "If the eyes are the window to the soul, then the eyelashes are the curtains! A lash lift gives your natural lashes the look of a gentle curl without permanently changing their shape — and it's not an extension treatment. Our lash lift system is specially designed to cause no damage to your eyelashes, and you'll walk out with lashes that catch anyone's attention in less than an hour.",
        ] ),
        educationBlock( "henna", "What is henna?", [
          "Henna brow tint uses natural dye from the henna plant to stain the skin beneath your brow hairs, creating an illusion of depth and fullness that visually fills any sparseness. It coats each brow hair with color rather than changing the natural hair color from within like regular tints do. That gentle process makes henna brows well suited to sensitive skin, and the easy-to-control dye can match almost any skin tone and brow shape.",
        ] ),
        educationBlock( "tinting", "What is tinting?", [
          "With a hint of tint, you can flaunt natural, full-looking brows and lashes for an always polished, put-together look. Custom-blended color brings more oomph to your arches and lashes, lasts three to four weeks, and is completely pain free. All our tints are toxin free and vegan based.",
        ] ),
        educationBlock( "brow-lamination", "What is brow lamination?", [
          "Brow lamination gives you a uniform, full eyebrow shape — solving the messy-brow issue and creating volume and fullness with a sleek, well-kept shape that lasts up to two months. Its protein composition, based on liquid keratin and silicone, even encourages brow growth by forming a protective film around each hair.",
        ] ),
      ],
      heroImage: await uploadImage( client, "docs/content-audit/images/B9C316FC-FE9B-4962-9C14-7F007B3808A1_1_105_c.jpeg", "Close-up of lifted lashes and a defined brow" ),
    },
    {
      _id: "category-body-treatments",
      _type: "serviceCategory",
      title: "Body Treatments",
      slug: { _type: "slug", current: "body-treatments" },
      menuLabel: "Body Treatments",
      order: 4,
      isAddOnCategory: false,
      seoTitle: "Body Treatments & Wraps in Seattle",
      seoDescription:
        "Body wraps, dry brush exfoliation, back facials, and more in Seattle. Smooth, glowing skin from head to toe — book your treatment online.",
      intro: richText( [
        "Head-to-toe treatments that exfoliate, hydrate, and restore — from full-body wraps to targeted care for the spots that need it most.",
      ] ),
      educationBlocks: [],
      heroImage: await uploadImage( client, "docs/content-audit/images/06B33C38-189E-4B53-9F68-14709D30E3E8_1_105_c.jpeg", "Clarifying masque applied during a back facial treatment" ),
    },
    {
      _id: "category-add-ons",
      _type: "serviceCategory",
      title: "Service Add-Ons",
      slug: { _type: "slug", current: "add-ons" },
      menuLabel: "Add-Ons",
      order: 5,
      isAddOnCategory: true,
      seoTitle: "Service Add-Ons",
      seoDescription:
        "Peels, microcurrent, LED therapy, scalp, hand, and foot treatments — finishing touches to layer onto any facial or body treatment.",
      intro: richText( [
        "Add-ons aren't offered as standalone services — they're the finishing touches you layer onto a facial or body treatment. Some add-ons add time to your service.",
      ] ),
      educationBlocks: [],
      heroImage: await uploadImage( client, "docs/content-audit/images/IMG_6988.jpg", "Two bowls of fresh masque product arranged with flowers" ),
    },
  ];

  const hairRemovalServices = [
    serviceDoc( {
      slug: "brows", name: "Brows", category: "hair-removal", order: 1,
      prices: [ { label: "Brows", amount: 25 }, { label: "Uni-brow only", amount: 15 } ],
      benefit: "A clean, precise brow shape — or just the middle tidied up.",
    } ),
    serviceDoc( {
      slug: "nose", name: "Nose", category: "hair-removal", order: 2,
      prices: [ { amount: 20 } ],
      benefit: "Quick, thorough removal of visible nose hair.",
    } ),
    serviceDoc( {
      slug: "sideburns-cheeks", name: "Sideburns & Cheeks", category: "hair-removal", order: 3,
      prices: [ { label: "Sideburns", amount: 20 }, { label: "Cheeks", amount: 25 } ],
      benefit: "Smooth, even sides for a clean-lined face.",
    } ),
    serviceDoc( {
      slug: "lip", name: "Lip", category: "hair-removal", order: 4,
      prices: [ { amount: 20 } ],
      benefit: "A smooth upper lip in just a few minutes.",
    } ),
    serviceDoc( {
      slug: "chin", name: "Chin", category: "hair-removal", order: 5,
      prices: [ { amount: 20 } ],
      benefit: "Stray chin hairs gone, with a smooth finish.",
    } ),
    serviceDoc( {
      slug: "full-face", name: "Full Face", category: "hair-removal", order: 6,
      prices: [ { amount: 35 } ],
      priceNote: "Brows not included",
      benefit: "Your whole face smooth and glowing — lip, chin, cheeks, and sideburns.",
    } ),
    serviceDoc( {
      slug: "neck", name: "Neck", category: "hair-removal", order: 7,
      prices: [ { amount: 20 } ],
      benefit: "A clean neckline that keeps your look sharp between cuts.",
    } ),
    serviceDoc( {
      slug: "neck-and-back", name: "Neck & Back", category: "hair-removal", order: 8,
      prices: [ { amount: 60 } ],
      benefit: "Neck and back completely smooth in one visit.",
    } ),
    serviceDoc( {
      slug: "back", name: "Back", category: "hair-removal", order: 9,
      prices: [ { amount: 50 } ],
      benefit: "Full back hair removal for smooth, confident skin.",
    } ),
    serviceDoc( {
      slug: "chest", name: "Chest", category: "hair-removal", order: 10,
      prices: [ { amount: 40 } ],
      priceNote: "Stomach hair removal not included",
      benefit: "A smooth chest without the razor stubble.",
    } ),
    serviceDoc( {
      slug: "underarm", name: "Underarm", category: "hair-removal", order: 11,
      prices: [ { amount: 30 } ],
      benefit: "Smooth underarms that outlast any razor.",
    } ),
    serviceDoc( {
      slug: "half-arm", name: "Half Arm", category: "hair-removal", order: 12,
      prices: [ { amount: 40 } ],
      benefit: "Elbow-down smoothness that lasts for weeks.",
    } ),
    serviceDoc( {
      slug: "half-arm-and-underarm", name: "Half Arm & Underarm", category: "hair-removal", order: 13,
      prices: [ { amount: 50 } ],
      benefit: "Half arm and underarms done together in one go.",
    } ),
    serviceDoc( {
      slug: "full-arm", name: "Full Arm", category: "hair-removal", order: 14,
      prices: [ { amount: 50 } ],
      benefit: "Shoulder-to-wrist smoothness, stubble-free.",
    } ),
    serviceDoc( {
      slug: "half-leg", name: "Half Leg", category: "hair-removal", order: 15,
      prices: [ { amount: 55 } ],
      benefit: "Knee-down smoothness that lasts for weeks.",
    } ),
    serviceDoc( {
      slug: "full-leg", name: "Full Leg", category: "hair-removal", order: 16,
      prices: [ { amount: 75 } ],
      priceNote: "Toe hair removal is an additional $5",
      benefit: "Smooth from the ankle all the way to the upper thigh.",
    } ),
    serviceDoc( {
      slug: "bikini", name: "Bikini", category: "hair-removal", order: 17,
      prices: [ { amount: 50 } ],
      benefit: "A tidy panty line with nothing peeking out.",
      description: [
        "A basic tidying: hair removal along the sides (your panty line) and across the top — so if you're wearing a bikini, nothing peeks out.",
      ],
    } ),
    serviceDoc( {
      slug: "extended-bikini", name: "Extended Bikini", category: "hair-removal", order: 18,
      prices: [ { amount: 55 } ],
      benefit: "The Bikini, extended — happy trail and tail feathers included.",
    } ),
    serviceDoc( {
      slug: "half-leg-and-bikini", name: "Half Leg & Bikini", category: "hair-removal", order: 19,
      prices: [ { amount: 80 } ],
      benefit: "Knee-down legs and bikini line, smooth in one appointment.",
    } ),
    serviceDoc( {
      slug: "full-leg-and-bikini", name: "Full Leg & Bikini", category: "hair-removal", order: 20,
      prices: [ { amount: 105 } ],
      benefit: "Full legs and bikini line handled in a single session.",
    } ),
    serviceDoc( {
      slug: "brazilian", name: "Brazilian", category: "hair-removal", order: 21,
      prices: [ { amount: 65 } ],
      benefit: "Completely smooth or styled your way — happy trail and tail feathers included.",
      description: [
        "Go completely bare, or keep a neat triangle, strip, or square — the style is up to you. Happy trail and tail feathers are always included.",
        "Rebook a Maintenance Brazilian within 3–5 weeks: regular maintenance keeps discomfort down and results smooth.",
      ],
      featured: true,
    } ),
    serviceDoc( {
      slug: "manzilian", name: "Manzilian", category: "hair-removal", order: 22,
      prices: [ { amount: 75 } ],
      benefit: "The Brazilian, for him — completely smooth or styled your way.",
      description: [
        "Rebook a Maintenance Manzilian within 3–5 weeks: regular maintenance keeps discomfort down and results smooth.",
      ],
    } ),
  ];

  const facialServices = [
    serviceDoc( {
      slug: "express-facial", name: "Express Facial", category: "facials", order: 1,
      prices: [ { amount: 70 } ],
      priceNote: "Extractions not included",
      durationMinutes: 30,
      benefit: "A complete custom facial in half an hour — neck and décolleté included.",
    } ),
    serviceDoc( {
      slug: "power-hour", name: "Power Hour", category: "facials", order: 2,
      prices: [ { amount: 90 } ],
      durationMinutes: 60,
      benefit: "A full hour of custom facial care — neck and décolleté included.",
      featured: true,
    } ),
    serviceDoc( {
      slug: "extended-facial", name: "Extended Facial", category: "facials", order: 3,
      prices: [ { amount: 100 } ],
      durationMinutes: 75,
      benefit: "A 75-minute custom facial with an added arm-and-shoulder massage — neck and décolleté included.",
    } ),
    serviceDoc( {
      slug: "up-grade-hour", name: "Up Grade Hour", category: "facials", order: 4,
      prices: [ { amount: 110 } ],
      durationMinutes: 60,
      benefit: "The Power Hour, elevated with eye rejuvenation and an almond scalp treatment.",
      description: [
        "Our classic Power Hour facial paired with an Eye Rejuvenation and an Organic Almond Scalp Treatment — the perfect combination of beauty and spa relaxation.",
      ],
    } ),
    serviceDoc( {
      slug: "anti-acne", name: "Anti-Acne", category: "facials", order: 5,
      prices: [ { amount: 95 } ],
      durationMinutes: 60,
      benefit: "Targeted care for troubled skin — especially effective on teenage and adult acne.",
      description: [
        "Made for troubled skin. After cleansing, your treatment begins with an enzyme or glycolic acid exfoliation and a warm vapor mist, followed by electric dis-encrustation, extensive manual deep-pore extractions, high-frequency application, and a skin-calming, anti-bacterial masque.",
        "Highly recommended as a series.",
      ],
    } ),
    serviceDoc( {
      slug: "glycolic-peel-treatment", name: "Glycolic Peel Treatment", category: "facials", order: 6,
      prices: [ { amount: 75 } ],
      benefit: "Brightens, refines, and smooths — collagen-boosting exfoliation for fresher skin.",
      description: [
        "Glycolic acid stimulates natural collagen production and diminishes the appearance of fine lines and wrinkles over time — and it's much more than an anti-aging treatment. It lightens discolorations like sun and age spots, and helps skin prone to blackheads, whiteheads, and acne by keeping pores clear of the old skin that tends to clog them.",
        "Penetrating deeply to reform texture and dullness, glycolic leaves your skin looking refreshed, bright, and refined.",
      ],
    } ),
    serviceDoc( {
      slug: "lactic-peel-treatment", name: "Lactic Peel Treatment", category: "facials", order: 7,
      prices: [ { amount: 75 } ],
      benefit: "A gentler AHA peel that evens tone and brightens a dull complexion.",
      description: [
        "Lactic acid targets hyperpigmentation, age spots, and the other culprits behind a dull, uneven complexion, while improving skin tone and reducing the appearance of pores.",
        "Like glycolic, lactic acid is an AHA — just a bit milder, making it a gentle introduction to peel treatments.",
      ],
    } ),
    serviceDoc( {
      slug: "berry-calming-facial", name: "Berry Calming Facial", category: "facials", order: 8,
      prices: [ { amount: 80 } ],
      durationMinutes: 45,
      benefit: "Acid-free exfoliation and calendula calm for redness-prone skin.",
      description: [
        "Enzymatic exfoliation from a Raspberry Peach Enzyme delivers deeply nourishing botanicals, while the Calendula Calming Mask leaves skin feeling calm, hydrated, and visibly refreshed.",
        "The perfect choice if you're seeking acid-free exfoliation, calming care for redness-prone skin, and barrier-supporting care with a radiant finish.",
      ],
      seasonal: true,
    } ),
    serviceDoc( {
      slug: "vineyard-grape-facial", name: "Vineyard Grape Facial", category: "facials", order: 9,
      prices: [ { amount: 80 } ],
      durationMinutes: 45,
      benefit: "Resveratrol-rich anti-aging nourishment — and it's pregnancy safe.",
      description: [
        "A blend of grape and marble berry designed for anti-aging and nourishment. The Grape Enzyme features resveratrol-rich Viniderm® from grape juice extract, which helps protect against oxidative stress while stimulating the production of collagen, elastin, and hyaluronic acid — promoting skin renewal and enhancing hydration.",
        "The Marble Berry Nourishing Mask features the marble berry plant's fruit, whose vibrant colors recall a peacock's feather or a butterfly's wing. Enriched with potent antioxidants including Thiotaine® and Spin Trap, it leaves skin feeling revitalized and balanced. Pregnancy safe.",
      ],
      seasonal: true,
    } ),
  ];

  const lashAndBrowServices = [
    serviceDoc( {
      slug: "lash-lift", name: "Lash Lift", category: "lash-and-brow", order: 1,
      prices: [ { amount: 75 } ],
      benefit: "A gentle, damage-free curl for your natural lashes — no extensions needed.",
    } ),
    serviceDoc( {
      slug: "lash-lift-and-tint", name: "Lash Lift & Tint", category: "lash-and-brow", order: 2,
      prices: [ { amount: 90 } ],
      benefit: "Lifted and tinted in one visit for maximum lash impact.",
    } ),
    serviceDoc( {
      slug: "brow-henna", name: "Brow Henna", category: "lash-and-brow", order: 3,
      prices: [ { amount: 50 } ],
      benefit: "Natural henna color that fills sparse brows with depth and fullness.",
    } ),
    serviceDoc( {
      slug: "brow-shape-with-henna", name: "Brow Shape with Henna", category: "lash-and-brow", order: 4,
      prices: [ { amount: 60 } ],
      benefit: "A precise brow shape plus henna depth and fullness.",
    } ),
    serviceDoc( {
      slug: "brow-tint", name: "Brow Tint", category: "lash-and-brow", order: 5,
      prices: [ { amount: 25 } ],
      benefit: "Custom-blended, vegan-based color for fuller-looking brows in minutes.",
    } ),
    serviceDoc( {
      slug: "brow-shape-and-tint", name: "Brow Shape & Tint", category: "lash-and-brow", order: 6,
      prices: [ { amount: 35 } ],
      benefit: "Shaped and tinted brows for a polished, put-together look.",
    } ),
    serviceDoc( {
      slug: "lash-tint", name: "Lash Tint", category: "lash-and-brow", order: 7,
      prices: [ { amount: 30 } ],
      benefit: "Darker, fuller-looking lashes with zero mascara required.",
    } ),
    serviceDoc( {
      slug: "brow-and-lash-tint", name: "Brow & Lash Tint", category: "lash-and-brow", order: 8,
      prices: [ { amount: 45 } ],
      benefit: "Brows and lashes tinted together for a complete, polished frame.",
    } ),
    serviceDoc( {
      slug: "brow-shape-with-brow-and-lash-tint", name: "Brow Shape with Brow & Lash Tint", category: "lash-and-brow", order: 9,
      prices: [ { amount: 60 } ],
      benefit: "The full frame-up: shaped brows plus brow and lash color.",
    } ),
    serviceDoc( {
      slug: "brow-lamination", name: "Brow Lamination", category: "lash-and-brow", order: 10,
      prices: [ { amount: 55 } ],
      benefit: "Volume, fullness, and a sleek brow shape that lasts up to two months.",
    } ),
    serviceDoc( {
      slug: "brow-lamination-with-brow-shaping", name: "Brow Lamination with Brow Shaping", category: "lash-and-brow", order: 11,
      prices: [ { amount: 75 } ],
      benefit: "Laminated and shaped — the studio's favorite brow transformation.",
      featured: true,
    } ),
    serviceDoc( {
      slug: "brow-lamination-with-brow-shaping-and-tint", name: "Brow Lamination with Brow Shaping & Tint", category: "lash-and-brow", order: 12,
      prices: [ { amount: 90 } ],
      benefit: "Lamination, shaping, and tint — the complete brow overhaul.",
    } ),
  ];

  const bodyTreatmentServices = [
    serviceDoc( {
      slug: "grapefruit-glow-bodywrap", name: "Grapefruit Glow BodyWrap", category: "body-treatments", order: 1,
      prices: [ { amount: 95 } ],
      durationMinutes: 50,
      benefit: "A full-body glow: dry brushing, grapefruit scrub, wrap, and body butter.",
      description: [
        "This full-body treatment leaves your skin smooth, hydrated, and glowing. It starts with a dry brush exfoliation, followed by an invigorating Grapefruit Scrub designed to eliminate dead skin cells — grapefruit extract is rich in antioxidants and vitamins, with anti-aging benefits like evening skin tone and fighting off free radicals.",
        "Once wrapped, you'll enjoy a relaxing dry scalp aroma massage, concluded with rich body butter massaged into the skin.",
      ],
    } ),
    serviceDoc( {
      slug: "beyond-bodywrap", name: "Beyond BodyWrap", category: "body-treatments", order: 2,
      prices: [ { amount: 120 } ],
      durationMinutes: 50,
      benefit: "The Grapefruit Glow, elevated — almond scalp treatment under therapeutic LED light.",
      description: [
        "A twist on the classic Grapefruit Glow wrap, this treatment is taken to a new level: once wrapped, you'll receive an Organic Almond Scalp Treatment while basking under therapeutic LED light.",
      ],
    } ),
    serviceDoc( {
      slug: "dry-brush-treatment", name: "Dry Brush Treatment", category: "body-treatments", order: 3,
      prices: [ { amount: 65 } ],
      durationMinutes: 25,
      benefit: "Full-body dry-brush exfoliation finished with rich body butter.",
    } ),
    serviceDoc( {
      slug: "back-facial", name: "Back Facial", category: "body-treatments", order: 4,
      prices: [ { amount: 75 } ],
      durationMinutes: 40,
      benefit: "Deep cleansing and extractions for the skin you can't reach.",
      description: [
        "Smooth away imperfections with this amazing back treatment: a dry brush exfoliation followed by deep cleansing, exfoliation with steam, and extractions — finished with a soothing, clarifying cream masque.",
      ],
    } ),
    serviceDoc( {
      slug: "bikini-brazilian-facial", name: "Bikini/Brazilian Facial", category: "body-treatments", order: 5,
      prices: [ { label: "Bikini", amount: 70 }, { label: "Brazilian", amount: 85 } ],
      benefit: "Clears ingrown hairs and brightens hyperpigmentation where waxing happens.",
      description: [
        "Targeting ingrown hairs and hyperpigmentation in the bikini or Brazilian area, this treatment includes cleansing, exfoliation, extractions (if needed), and a brightening French Peel-Off Masque.",
        "Strongly recommended if you wax or sugar — but anyone with ingrown hairs or discoloration can benefit. Sessions run 25–45 minutes.",
      ],
      featured: true,
    } ),
    serviceDoc( {
      slug: "five-star-treatment", name: "Five Star Treatment", category: "body-treatments", order: 6,
      prices: [ { amount: 60 } ],
      durationMinutes: 20,
      benefit: "Scalp, hands, and feet — the hardest-working parts of you, revived.",
      description: [
        "A combination of the Scalp, Hand, and Foot treatments, focused on the parts of your body most exposed to the changing elements. The hands, feet, and scalp are rich in nerve endings and acupressure points, yet they're so often neglected. Revive and align your points with this five-star beauty and spa treatment!",
      ],
    } ),
  ];

  const addOnServices = [
    serviceDoc( {
      slug: "facial-peel", name: "Facial Peel", category: "add-ons", order: 1,
      prices: [ { amount: 40 } ],
      benefit: "Reveal fresher skin beneath — your choice of glycolic, lactic, or cranberry peel.",
      description: [
        "A facial peel uses a natural chemical solution to remove layers of skin, revealing the more youthful skin underneath. Peels can reduce or improve fine lines and wrinkles, acne, scars, uneven coloring, and other imperfections — the chemical determines the depth of the peel and the type of condition treated.",
        "Choose between Glycolic (30%), Lactic (20%), or Cranberry Turnover (20% salicylic).",
      ],
    } ),
    serviceDoc( {
      slug: "microcurrent-therapy", name: "Microcurrent Therapy", category: "add-ons", order: 2,
      prices: [ { amount: 30 } ],
      benefit: "Contours, tones, and firms with a current so gentle you won't feel it.",
      description: [
        "Used for facial contouring, toning, and firming, microcurrent is a low-level current that mimics the body's natural current and can provide both instant and cumulative results. It stimulates ATP production, which drives the creation of key structural proteins like collagen and elastin.",
        "Because microcurrent works sub-sensory, the treatment is soothing — most clients feel nothing at all.",
      ],
    } ),
    serviceDoc( {
      slug: "led-therapy-treatment", name: "LED Therapy Treatment", category: "add-ons", order: 3,
      prices: [ { amount: 30 } ],
      benefit: "Therapeutic light your skin uses as energy — collagen, clarity, and calm.",
      description: [
        "Just as plants absorb and convert sunlight into cellular building blocks, your skin absorbs therapeutic light and uses it as a source of energy — stimulating cellular regeneration to produce collagen and elastin, kill acne bacteria, brighten hyperpigmentation, reduce inflammation, and speed healing.",
        "For maximum results, a series of six treatments is recommended, followed by a maintenance treatment every 60–90 days.",
      ],
    } ),
    serviceDoc( {
      slug: "organic-almond-scalp-treatment", name: "Organic Almond Scalp Treatment", category: "add-ons", order: 4,
      prices: [ { amount: 20 } ],
      benefit: "Acupressure and warm almond oil to melt scalp tension away.",
      description: [
        "An acupressure massage releases the tension and stress our scalp muscles hold so tightly, enhanced with organic almond oil — soothing to the scalp and conditioning to the hair. Removed with an aroma steam towel, you'll definitely leave relaxed. A perfect addition to any facial or body treatment.",
      ],
    } ),
    serviceDoc( {
      slug: "high-frequency-scalp-treatment", name: "High-Frequency Scalp Treatment", category: "add-ons", order: 5,
      prices: [ { amount: 15 } ],
      benefit: "Pain-free stimulation that revitalizes your scalp and encourages hair growth.",
      description: [
        "This pain-free treatment uses low-current, high-frequency stimulation to revitalize your scalp — stimulating blood circulation, encouraging a faster rate of hair growth, helping generate new cells, and keeping your hair dandruff-free.",
      ],
    } ),
    serviceDoc( {
      slug: "eye-rejuvenation-treatment", name: "Eye Rejuvenation Treatment", category: "add-ons", order: 6,
      prices: [ { amount: 20 } ],
      benefit: "Cooling jade and marine collagen to de-puff and smooth tired eyes.",
      description: [
        "This treatment starts with a cooling jade massage followed by a peel-off masque. Pure marine collagen smooths lines and wrinkles while reducing puffiness by tightening the skin around the eyes.",
      ],
    } ),
    serviceDoc( {
      slug: "warm-paraffin-hand-treatment", name: "Warm Paraffin Hand Treatment", category: "add-ons", order: 7,
      prices: [ { amount: 25 } ],
      benefit: "Warm wax that locks in moisture and lifts away dead skin.",
      description: [
        "Paraffin's natural emollient softens skin as the heat opens pores, allowing for maximum moisture retention. When the cooled wax is pulled away from the skin, it removes dead skin cells with it — leaving your hands noticeably smoother. A great addition to any facial or spa experience.",
      ],
      featured: true,
    } ),
    serviceDoc( {
      slug: "fruit-foot-treatment", name: "Fruit Foot Treatment", category: "add-ons", order: 8,
      prices: [ { amount: 25 } ],
      benefit: "A fruit-sugar scrub, steam towels, and rich cream for renewed feet.",
      description: [
        "Feet are renewed with an invigorating fruit sugar scrub, then wrapped in warm steam towels to melt away dead skin — finished with a massage of rich foot cream.",
      ],
    } ),
  ];

  const packages = [
    packageDoc( {
      slug: "beach-body", name: "Beach Body", order: 1,
      prices: [ { label: "Brazilian", amount: 120 }, { label: "Manzilian", amount: 130 } ],
      durationMinutes: 60,
      benefit: "Beach-ready from wax to glow: your choice of Brazilian or Manzilian plus a full-body exfoliation.",
      description: [
        "Stay beach ready. Start with your choice of a Brazilian or Manzilian wax, then unwind with a full-body dry-brush exfoliation finished with rich body butter massaged into the skin.",
      ],
    } ),
    packageDoc( {
      slug: "beyond-bodywrap", name: "Beyond BodyWrap", order: 2,
      prices: [ { amount: 120 } ],
      durationMinutes: 50,
      benefit: "The Grapefruit Glow, elevated — almond scalp treatment under therapeutic LED light.",
      description: [
        "A twist on the classic Grapefruit Glow wrap, this treatment is taken to a new level: once wrapped, you'll receive an Organic Almond Scalp Treatment while basking under therapeutic LED light.",
      ],
    } ),
    packageDoc( {
      slug: "modern-man", name: "Modern Man", order: 3,
      prices: [ { amount: 140 } ],
      durationMinutes: 75,
      benefit: "A back facial and express facial for him — nose wax or brow cleanup included.",
      description: [
        "Not sure what to get that special guy in your life? The Modern Man pairs a relaxing Back Facial with a thorough Express Facial — plus the option of either a nose wax or a light brow cleanup.",
      ],
    } ),
    packageDoc( {
      slug: "pampered-pregnancy", name: "Pampered Pregnancy", order: 4,
      prices: [ { amount: 120 } ],
      durationMinutes: 65,
      benefit: "Pregnancy-safe facial care plus hand, foot, and scalp revival.",
      description: [
        "Take a load off with this full-body experience. A Calming Hydration Facial is perfect for safely addressing problem skin caused by the hormonal imbalance experienced during pregnancy — and because the hands, feet, and scalp are rich in nerve endings and acupressure points, the added Five Star Treatment revives and aligns your points.",
      ],
    } ),
    packageDoc( {
      slug: "teen-time", name: "Teen Time", order: 5,
      prices: [ { amount: 100 } ],
      durationMinutes: 45,
      benefit: "A first facial made for teens — breakout control and spa treats included.",
      description: [
        "Introduce your favorite teen to the joys of self-care. A skin analysis leads into a relaxing facial, with high frequency used to help control any breakouts — and an Almond Scalp Treatment paired with a Warm Paraffin Hand Treatment brings this awesome introduction to a conclusion!",
      ],
    } ),
    packageDoc( {
      slug: "up-grade-hour", name: "Up Grade Hour", order: 6,
      prices: [ { amount: 110 } ],
      durationMinutes: 60,
      benefit: "The Power Hour plus eye rejuvenation and an almond scalp treatment.",
      description: [
        "Our classic Power Hour facial paired with an Eye Rejuvenation and an Organic Almond Scalp Treatment — the perfect combination of beauty and spa relaxation.",
      ],
    } ),
  ];

  return [
    ...categories,
    ...hairRemovalServices,
    ...facialServices,
    ...lashAndBrowServices,
    ...bodyTreatmentServices,
    ...addOnServices,
    ...packages,
  ];
}
