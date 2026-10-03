import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLdScript } from "@/_components/SEO/JsonLd";
import { BASE_URL, generateTenderMetadata } from "@/lib/seo.config";
import {
  generateBreadcrumbSchema,
  generateTenderSchema,
} from "@/lib/structured-data";
import { formatDisplayDateTime } from "@/utils/dateUtils";
import TenderPageClient from "./_components/TenderPageClient";
import { getTender, parseTenderId } from "./_lib/getTender";

interface Props {
  params: Promise<{ tenderId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseTenderId((await params).tenderId);
  const data = id ? await getTender(id) : null;

  // The page answers with a 404, whose own metadata applies
  if (!data) return {};

  // Unapproved and scheduled tenders must not leak into search or previews
  if (!data.isPublic) {
    return {
      title: "Tender Not Yet Available",
      robots: { index: false, follow: true },
    };
  }

  const { tender } = data.response.tenderData;
  return generateTenderMetadata({
    id: tender.tender_id,
    title: tender.tender_title || "Tender Details",
    description: tender.tender_description,
    number: tender.tender_number,
    department: tender.tender_department,
    bidDeadline: tender.tender_bid_submission_deadline
      ? formatDisplayDateTime(tender.tender_bid_submission_deadline)
      : null,
  });
}

export default async function TenderPage({ params }: Props) {
  const id = parseTenderId((await params).tenderId);
  if (!id) notFound();

  const data = await getTender(id);
  if (!data) notFound();

  // Admins can still preview these - the client fetches them with the session
  if (!data.isPublic) return <TenderPageClient tenderId={id} />;

  const { tender } = data.response.tenderData;
  const url = `${BASE_URL}/tender/${tender.tender_id}`;

  return (
    <>
      <JsonLdScript
        data={[
          generateTenderSchema({
            id: tender.tender_id,
            title: tender.tender_title || "Tender Details",
            description: tender.tender_description || undefined,
            department: tender.tender_department || undefined,
            location: tender.tender_location || undefined,
            referenceNumber: tender.tender_number || undefined,
            releaseDate: tender.tender_release_date,
            bidDeadline: tender.tender_bid_submission_deadline,
          }),
          generateBreadcrumbSchema([
            { name: "Tenders", url: BASE_URL },
            { name: tender.tender_title || "Tender Details", url },
          ]),
        ]}
      />
      <TenderPageClient
        tenderId={id}
        initialData={data.response}
      />
    </>
  );
}
