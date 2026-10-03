import React from "react";
import { ClipboardCheck, FileCheck2 } from "lucide-react";
import { IBidderDocumentsReq, ITender } from "@/_types/tender";

interface DocumentsSectionProps {
  tender: ITender;
  bidderDocs?: IBidderDocumentsReq[];
}

const DocumentList = ({ title, names }: { title: string; names: string[] }) => (
  <div>
    <h3 className='text-xs font-medium uppercase tracking-wide text-neutral-500'>
      {title}
    </h3>
    <ul className='mt-2 space-y-2'>
      {names.map((name) => (
        <li
          key={name}
          className='flex items-start gap-2.5 text-sm text-slate-800'>
          <FileCheck2
            className='mt-0.5 size-4 shrink-0 text-primary'
            aria-hidden='true'
          />
          {name}
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Everything the bid form will ask for, so bidders can gather it up front.
 * Labels match the upload fields on the bid form.
 */
const TenderDocumentsSection: React.FC<DocumentsSectionProps> = ({
  tender,
  bidderDocs = [],
}) => {
  const bidDocuments = [
    "Bid Fee Payment Receipt",
    ...(tender.tender_is_technical_doc ? ["Technical Document"] : []),
    ...(tender.tender_is_financial_doc ? ["Financial Document"] : []),
  ];

  const complianceDocuments = bidderDocs
    .map((doc) => doc.vdr_name)
    .filter((name): name is string => Boolean(name));

  return (
    <section
      aria-labelledby='documents-to-submit-heading'
      className='overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm'>
      <div className='border-b border-neutral-100 px-5 py-4'>
        <h2
          id='documents-to-submit-heading'
          className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
          <ClipboardCheck
            className='size-4 text-primary'
            aria-hidden='true'
          />
          Documents to submit
        </h2>
        <p className='mt-1 text-xs text-slate-600'>
          The bid form asks for each of these. Upload them as PDFs of up to 5
          MB each.
        </p>
      </div>

      <div className='grid gap-5 p-5 sm:grid-cols-2'>
        <DocumentList
          title='Bid documents'
          names={bidDocuments}
        />
        {complianceDocuments.length > 0 && (
          <DocumentList
            title='Compliance documents'
            names={complianceDocuments}
          />
        )}
      </div>
    </section>
  );
};

export default TenderDocumentsSection;
