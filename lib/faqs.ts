/**
 * FAQ content shared by the /faq page and the home sidebar, so the two can't
 * drift apart. Answers describe what the portal actually does - check the
 * flow in code before changing one. Plain text only: answers also feed the
 * page's FAQPage structured data.
 */

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface FaqGroup {
  id: string;
  title: string;
  faqs: Faq[];
}

export const faqGroups: FaqGroup[] = [
  {
    id: "getting-started",
    title: "Getting started",
    faqs: [
      {
        id: "what-is-portal",
        question: "What is the TERI eTender portal?",
        answer:
          "It is the official site where The Energy and Resources Institute (TERI) publishes its tenders and receives bids online, at etender.teri.res.in. Anyone can browse tenders and read their details.",
      },
      {
        id: "registration-free",
        question: "Is registration free?",
        answer:
          "Yes. Registering costs nothing, and you can browse tenders without an account. You need an approved vendor account to submit a bid. Some tenders charge a document fee and an EMD, shown on the tender.",
      },
      {
        id: "register",
        question: "How do I register as a vendor?",
        answer:
          "Select Register Now and fill in the three sections: personal information, business information and document upload. You'll get an email confirming TERI has received your registration. TERI then reviews your account and emails you once it is approved or rejected.",
      },
      {
        id: "registration-documents",
        question: "What documents do I need to register?",
        answer:
          "Your PAN card, GST registration certificate, company registration document, Aadhaar card, and a bank cheque or passbook page. An MSME certificate is optional. You'll also need your PAN, GST and company registration numbers, your business address and your turnover for the last three years.",
      },
      {
        id: "cant-bid",
        question: "Why can't I submit a bid yet?",
        answer:
          "Only approved vendors can bid. While TERI reviews your registration you can still browse tenders. If your account is rejected, the reason is shown on your dashboard.",
      },
      {
        id: "international",
        question: "Can vendors from outside India take part?",
        answer:
          "Global tenders are open to bidders from outside India, subject to the eligibility rules in the tender documents. Registration currently asks for an Indian PAN and GST number, so contact the tender team well before the deadline if you don't have them.",
      },
    ],
  },
  {
    id: "finding-tenders",
    title: "Finding tenders",
    faqs: [
      {
        id: "tender-types",
        question: "What kinds of tenders does TERI publish?",
        answer:
          "TERI buys both products, such as equipment and materials, and services, such as IT systems, for its research divisions. Each tender shows its department, location, closing date and type: public, open, limited or global.",
      },
      {
        id: "new-tender-alerts",
        question: "How will I hear about new tenders?",
        answer:
          "The portal doesn't send alerts for every new tender, so check the home page, which lists the newest tenders first. TERI may also email you an invitation to a specific tender. Once you're signed in, the portal notifies you about your account, your bids and answers to your questions.",
      },
      {
        id: "ask-question",
        question: "Can I ask a question about a tender?",
        answer:
          "Yes. Approved vendors can ask on the tender page until its query deadline, or the bid deadline when there isn't one. Answers are published on the tender page for everyone without your name, and you're notified when yours is answered.",
      },
    ],
  },
  {
    id: "bidding",
    title: "Bidding and payment",
    faqs: [
      {
        id: "submit-bid",
        question: "How do I submit a bid?",
        answer:
          "Sign in, open the tender and select Proceed to Purchase. Pay the document fee and EMD, then upload the payment receipt and the documents the tender asks for, and submit. The portal stops accepting bids at the bid deadline, so don't leave it to the last minute.",
      },
      {
        id: "payment",
        question: "How do I pay the document fee and EMD?",
        answer:
          "Pay the document fee by bank cheque and the EMD by demand draft payable at New Delhi, both in favour of The Energy and Resources Institute. Quote the tender number as the reference and upload the payment receipt with your bid. The amounts are shown on each tender.",
      },
      {
        id: "bid-documents",
        question: "What documents do I need to bid?",
        answer:
          "The receipt for your fee payment, plus the technical and financial documents and any compliance documents the tender lists. Upload each one as a PDF of up to 5 MB.",
      },
      {
        id: "change-bid",
        question: "Can I change or withdraw a bid?",
        answer:
          "No. You can submit one bid per tender, and it can't be edited or withdrawn on the portal, so check everything before you submit. If you spot a mistake, contact the tender team before the bid deadline.",
      },
    ],
  },
  {
    id: "after-bidding",
    title: "After you bid",
    faqs: [
      {
        id: "track-bids",
        question: "How can I track my bids?",
        answer:
          "Open Purchased Tenders from your dashboard menu to see each bid and its status: under review, selected, approved or rejected. Bids you win also appear under Awarded Tenders.",
      },
      {
        id: "evaluation",
        question: "How are bids evaluated?",
        answer:
          "Bids stay hidden from TERI's tender team until the bid deadline passes. Technical and financial bids are then opened on the dates shown on the tender, bids are shortlisted, and one is approved. The portal notifies you when your bid is approved or not selected.",
      },
    ],
  },
  {
    id: "account-support",
    title: "Account and support",
    faqs: [
      {
        id: "update-details",
        question: "How do I update my business details?",
        answer:
          "Open your profile from the dashboard and choose Edit profile. Documents uploaded during registration can't be changed there, so contact the tender team to replace one.",
      },
      {
        id: "security",
        question: "How is my information protected?",
        answer:
          "The portal runs over HTTPS, passwords are stored hashed rather than as plain text, and bids stay hidden from TERI's tender team until the bid deadline has passed.",
      },
      {
        id: "contact",
        question: "How do I contact the tender team?",
        answer:
          "Call +91 8560064756 or email etender@teri.res.in. TERI's head office is at Darbari Seth Block, IHC Complex, Lodhi Road, New Delhi 110003.",
      },
      {
        id: "about-teri",
        question: "What is TERI?",
        answer:
          "The Energy and Resources Institute (TERI) is an independent, not-for-profit research institute working on energy, environment and sustainable development. It was founded in 1974 and is based in New Delhi. Learn more at www.teriin.org.",
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((group) => group.faqs);

const faqsById = new Map(allFaqs.map((faq) => [faq.id, faq]));

/** The FAQs with these ids, in the order given. Unknown ids are skipped. */
export const pickFaqs = (ids: string[]) =>
  ids.flatMap((id) => faqsById.get(id) ?? []);
