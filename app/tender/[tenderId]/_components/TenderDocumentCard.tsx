"use client";
import React from "react";
import { Download, Eye, FileText } from "lucide-react";
import { Button } from "@/_components/ui/button";
import PdfViewerModal from "@/_components/Shared/PdfViewerModal";
import { trpc } from "@/lib/trpc";
import { getFileDisplayName, getPdfFileQuery } from "@/utils/s3FolderQuery";

interface Props {
  fileKey: string;
}

/**
 * The tender PDF holds the scope, terms and bid formats. Every bidder has to
 * read it, so it gets the strongest card on the page.
 */
const TenderDocumentCard = ({ fileKey }: Props) => {
  const fileName = getFileDisplayName(fileKey);
  const { data } = trpc.s3.getFileUrl.useQuery(getPdfFileQuery(fileKey));

  return (
    <section
      aria-labelledby='tender-document-heading'
      className='overflow-hidden rounded-xl border border-primary/30 bg-white shadow-sm ring-4 ring-primary/5'>
      <div className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center'>
        <div className='flex min-w-0 flex-1 items-start gap-4'>
          {/* File-type tile, so it reads as a PDF at a glance */}
          <div
            aria-hidden
            className='flex h-14 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-red-200 bg-red-50 text-red-600'>
            <FileText className='size-5' />
            <span className='text-[10px] font-bold tracking-wide'>PDF</span>
          </div>

          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h2
                id='tender-document-heading'
                className='text-base font-semibold text-slate-900'>
                Tender document
              </h2>
              <span className='rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20'>
                Read before you bid
              </span>
            </div>
            <p
              className='mt-0.5 truncate text-sm font-medium text-primary'
              title={fileName}>
              {fileName}
            </p>
            <p className='mt-1 text-xs leading-relaxed text-slate-500'>
              Scope of work, terms and conditions, payment terms, deliverables
              and penalties that govern this tender.
            </p>
          </div>
        </div>

        <div className='flex shrink-0 gap-2'>
          <PdfViewerModal
            value={fileKey}
            isS3File={true}
            triggerButton={
              <Button className='flex-1 bg-primary text-white hover:bg-primary/90 sm:flex-none'>
                <Eye aria-hidden='true' />
                View document
              </Button>
            }
          />
          {data?.fileUrl && (
            <Button
              asChild
              variant='outline'
              className='flex-1 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary sm:flex-none'>
              <a
                href={data.fileUrl}
                download={fileName}
                target='_blank'
                rel='noopener noreferrer'>
                <Download aria-hidden='true' />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default TenderDocumentCard;
