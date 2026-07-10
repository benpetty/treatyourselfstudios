import { richText } from "./helpers";

export function buildFaqs() {
  return [
    {
      _id: "faq-cancellation",
      _type: "faq",
      question: "What is the cancellation policy?",
      answer: richText( [
        "We ask for 24 hours' notice to change or cancel an appointment. Without proper notice, a fee of 50% of the appointment charge applies; no-shows are charged 100%.",
        "Arriving more than 15 minutes late (10 minutes for shorter appointments) counts as a no-show, and we won't be able to see you. When booking, you'll be asked for a credit card to hold your reservation — that information stays private.",
      ] ),
      order: 1,
    },
    {
      _id: "faq-arrival",
      _type: "faq",
      question: "How early should I arrive for my appointment?",
      answer: richText( [
        "Please arrive no earlier than 10 minutes before your session, out of consideration for your esthetician and fellow clients. Sessions include the full advertised treatment time plus 10 minutes for first-time paperwork, dressing, and consultation.",
        "Sessions can't be extended for late arrivals.",
      ] ),
      order: 2,
    },
    {
      _id: "faq-payment",
      _type: "faq",
      question: "What forms of payment are accepted?",
      answer: richText( [
        "All major debit and credit cards, and cash. Personal checks are not accepted.",
      ] ),
      order: 3,
    },
    {
      _id: "faq-gratuity",
      _type: "faq",
      question: "Is gratuity required?",
      answer: richText( [
        "No — gratuity is never required. If you'd like to leave one, 15–20% is customary.",
      ] ),
      order: 4,
    },
  ];
}
