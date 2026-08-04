# Legacy store data rescue

Snapshot of the old GoDaddy Website Builder store (`/ols/` module, backend
`mysimplestore.com` API), captured 2026-08-04 while the store was still live —
source material for migrating retail into Square Online
([issue #15](https://github.com/benpetty/treatyourselfstudios/issues/15)).

- `products.json` — raw `/api/v2/products` response (46 products: names,
  prices, full descriptions, stock state, image URLs).
- `taxons.json` — raw `/api/v2/taxons` response (categories).
- `product-categories.json` — product slug → taxon permalinks (includes structural taxons: categories/featured-products/terminal).
- `images/` — original full-resolution product images (73 files; the
  store served 600px proxies, these are the untransformed sources, mostly
  1200×1200).

## Product summary (for Square listing)

| Product | Price | In stock | Categories | Images |
|---|---|---|---|---|
| Blemish Spot Treatment | $19.00 | yes | serums | blemish-spot-treatment-1 |
| Minimalist Kit | $40.50 | yes | treatments-kits | minimal-1, minimal-2, minimal-3 |
| Glycolic and Retinol Pads | $25.00 | yes | toners, exfoliants | glycolic-and-retinol-pads-1 |
| Collagen Sheet Mask-10 Pack | $60.00 | yes | masks | collagen-sheet-mask-10-pack-1, collagen-sheet-mask-10-pack-2 |
| Raspberry Refining Cleanser | $30.00 | yes | cleansers | raspberry-refining-cleanser-1 |
| Satin Pillow Eye Mask-Charcoal | $18.00 | yes | eye--lip-care, bath--body | satin-pillow-eye-mask-black-1, satin-pillow-eye-mask-black-2, satin-pillow-eye-mask-black-3, satin-pillow-eye-mask-black-4 |
| The Creamy Restore Four | $164.00 | yes | treatments-kits | the-creamy-restore-four-1, the-creamy-restore-four-2, the-creamy-restore-four-3 |
| Ageless Skin Moisturizer | $17.00 | yes | moisturizers | ageless-skin-moisturizer-1 |
| Collagen Sheet Mask -Single | $6.00 | yes | masks | collagen-sheet-mask-single-1, collagen-sheet-mask-single-2 |
| The Lite Restore Four | $160.00 | yes | treatments-kits | the-lite-restore-four-1, the-lite-restore-four-2, the-lite-restore-four-3 |
| Refine & Renew | $64.50 | yes | treatments-kits | refine-renew-1, refine-renew-2, refine-renew-3 |
| Plump & Protect Lite Kit | $47.00 | yes | treatments-kits | plump-protect-lite-kit-1, plump-protect-lite-kit-2, plump-protect-lite-kit-3 |
| Moderate Acne Kit | $154.00 | yes | treatments-kits | moderate-acne-kit-1 |
| Sheer Protection SPF 30 | $26.50 | yes | sunscreens | sheer-protection-spf-30-1 |
| Raspberry Refining Scrub | $31.00 | yes | exfoliants | raspberry-refining-scrub-1 |
| Oily Skin Kit | $173.50 | yes | treatments-kits | oily-skin-kit-1 |
| Hyperpigmentation Kit aka : Pre/Post Peel Care KIt | $220.00 | yes | treatments-kits | hyperpigmentation-kit-aka-prepost-peel-care-kit-1 |
| Clarifying Toner Pads | $19.00 | yes | toners, exfoliants | clarifying-toner-pads-1 |
| Hydrating Moisturizer | $25.50 | yes | moisturizers | hydrating-moisturizer-1 |
| Beta-Carotene/Papain Renewal Serum | $37.00 | yes | exfoliants, serums | beta-carotenepapain-renewal-serum-1 |
| Dry Skin Kit | $220.00 | yes | treatments-kits | dry-skin-kit-1 |
| Mint Lip Hydrator | $11.00 | yes | eye--lip-care | mint-lip-hydrator-1 |
| Cacteen Balancing Moisturizer | $27.50 | yes | moisturizers | cacteen-balancing-moisturizer-1 |
| Eco-Friendly Spa Headband | $18.00 | yes | bath--body | eco-friendly-spa-headband-1, eco-friendly-spa-headband-2, eco-friendly-spa-headband-3, eco-friendly-spa-headband-4 |
| Green Tea Citrus Cleanser | $30.00 | yes | cleansers | green-tea-citrus-cleanser-1 |
| Hydro Sun | $40.00 | yes | sunscreens | hydro-sun-1 |
| Peptide Eye Serum | $33.00 | yes | eye--lip-care | peptide-eye-serum-1 |
| Cucumber Hydration Toner | $22.00 | yes | toners | cucumber-hydration-toner-1 |
| Glycolic Cleanser | $32.00 | yes | cleansers | glycolic-cleanser-1 |
| Citrus-C Nourishing Cream | $44.00 | yes | serums, moisturizers | citrus-c-nourishing-cream-1 |
| Peptide Restoration Moisturizer | $55.00 | yes | moisturizers | peptide-restoration-moisturizer-1 |
| Mild Acne Kit | $100.00 | yes | treatments-kits | mild-acne-kit-1 |
| Pomegranate Antioxidant Cleanser | $30.00 | yes | cleansers | pomegranate-antioxidant-cleanser-1 |
| Vitamin C/Green Tea Serum | $40.00 | yes | serums | vitamin-cgreen-tea-serum-1 |
| Retinol 2% Exfoliating Scrub/Mask | $43.00 | yes | exfoliants, masks | retinol-2-exfoliating-scrubmask-1 |
| Light Aloe Moisturizer | $18.00 | yes | moisturizers | light-aloe-moisturizer-1 |
| Tri-Peptide Eye Cream | $33.00 | yes | eye--lip-care | tri-peptide-eye-cream-1 |
| Charcoal Clay Cleanser | $30.00 | yes | cleansers | wash-1 |
| Rosacea/Sensitive Skin Kit | $196.00 | yes | treatments-kits | rosaceasensitive-skin-kit-1 |
| Retinaldehyde Serum with IconicA | $60.00 | yes | serums | retinaldehyde-serum-with-iconica-1 |
| Lip Balm SPF 15 | $5.50 | yes | eye--lip-care | lip-balm-spf-15-1 |
| Ageless Hydrating Serum | $33.00 | yes | serums | ageless-hydrating-serum-1 |
| Babe Lash Mini Essential Serum | $37.00 | yes | eye--lip-care | babe-lash-mini-essential-serum-1, babe-lash-mini-essential-serum-2, babe-lash-mini-essential-serum-3, babe-lash-mini-essential-serum-4, babe-lash-mini-essential-serum-5, babe-lash-mini-essential-serum-6, babe-lash-mini-essential-serum-7 |
| Acai Berry Moisturizer | $33.00 | yes | moisturizers | acai-berry-moisturizer-1 |
| Satin Pillow Eye Mask Blush | $18.00 | yes | eye--lip-care, bath--body | satin-pillow-eye-mask-blush-1, satin-pillow-eye-mask-blush-2, satin-pillow-eye-mask-blush-3, satin-pillow-eye-mask-blush-4 |
| Mint Refining Toner | $22.00 | yes | toners | mint-refining-toner-1 |
