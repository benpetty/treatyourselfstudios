export function buildDeals() {
  const deals: Array<{ _id: string; _type: "deal"; title: string; details: string; finePrint?: string; order: number }> = [
    {
      _id: "deal-first-visit",
      _type: "deal",
      title: "15% off your first visit",
      details: "New to the studio? Mention this offer when you book and take 15% off your first service.",
      finePrint: "Cannot be combined with other deals.",
      order: 1,
    },
    {
      _id: "deal-rebook",
      _type: "deal",
      title: "10% off when you rebook",
      details: "Book your next appointment before you leave and save 10% on it.",
      order: 2,
    },
    {
      _id: "deal-package-sixth-free",
      _type: "deal",
      title: "Buy 5, get the 6th free",
      details: "Purchase any package of five of the same service and your sixth is on us.",
      order: 3,
    },
  ];
  return deals;
}
