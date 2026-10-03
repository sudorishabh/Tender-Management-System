"use client";
import React, { FC, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Download, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog";

// Dynamic imports for PDF viewer components
const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  { ssr: false }
);
const Worker = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Worker),
  { ssr: false }
);

import "@react-pdf-viewer/core/lib/styles/index.css";
import { getPdfFileQuery } from "@/utils/s3FolderQuery";
import { trpc } from "@/lib/trpc";

interface Props {
  value: string | File | null;
  isS3File: boolean;
  triggerButton?: React.ReactNode;
}

const PdfViewerModal: FC<Props> = ({ value, isS3File, triggerButton }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [s3FileName, setS3FileName] = useState<{
    fileName: string;
    fileType: string;
  }>({
    fileName: "",
    fileType: "",
  });
  const [viewPdfStr, setViewPdfStr] = useState<string | null>(null);
  const [viewPdf, setViewPdf] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);

  const { data: fileUrl, isSuccess: isFileUrlSuccess } =
    trpc.s3.getFileUrl.useQuery(
      {
        fileName: s3FileName.fileName,
        fileType: s3FileName.fileType,
      },
      {
        enabled: Boolean(
          isS3File && s3FileName.fileName && s3FileName.fileType
        ),
      }
    );

  useEffect(() => {
    if (isS3File) {
      const fileQuery = getPdfFileQuery(value as string);
      setS3FileName(fileQuery);
    } else {
      if (value instanceof Blob) {
        const fileType = ["application/pdf"];
        if (fileType.includes(value.type)) {
          const reader = new FileReader();
          reader.readAsDataURL(value);
          reader.onloadend = (e) => {
            const result = e.target?.result as string | null;
            setViewPdf(result);
            setDownloadUrl(URL.createObjectURL(value));
          };
        } else {
          setViewPdf(null);
        }
      }
    }
  }, [isS3File, value]);

  useEffect(() => {
    if (fileUrl && isFileUrlSuccess) {
      setViewPdfStr(fileUrl.fileUrl);
      setDownloadUrl(fileUrl.fileUrl);
    }
  }, [fileUrl, isFileUrlSuccess]);

  // Reset zoom when opening modal
  useEffect(() => {
    if (viewPdf || viewPdfStr) {
      setScale(1);
    }
  }, [viewPdf, viewPdfStr]);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "document.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  return (
    <Dialog>
      <DialogTrigger
        asChild
        className=''>
        {triggerButton || <Button variant='outline'>View Document</Button>}
      </DialogTrigger>

      <DialogContent className='sm:max-w-[65rem] p-0 py-4 z-[1000]'>
        <DialogHeader>
          <DialogTitle className='ml-5'>Document Viewer</DialogTitle>
        </DialogHeader>
        <div className='flex items-center justify-between gap-2 bg-gray-100 px-6 py-2 border-b border-gray-200'>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleZoomOut}
              className='rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900'
              aria-label='Zoom out'>
              <ZoomOut size={18} />
            </button>
            <span className='text-sm font-medium text-gray-700'>
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className='rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900'
              aria-label='Zoom in'>
              <ZoomIn size={18} />
            </button>
          </div>
          {(viewPdf || viewPdfStr) && downloadUrl && (
            <button
              onClick={handleDownload}
              type='button'
              className='flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'>
              <Download size={16} />
              Download PDF
            </button>
          )}
        </div>

        <div
          className='h-[calc(90vh-110px)] overflow-auto px-1 bg-gray-50'
          ref={containerRef}>
          {viewPdf || viewPdfStr ? (
            <div
              className='pdf-container'
              style={{
                transformOrigin: "0 0",
                transform: `scale(${scale})`,
                width: `${100 / scale}%`,
                height: "100%",
              }}>
              <Worker workerUrl='/pdf.worker.min.js'>
                <Viewer fileUrl={viewPdf || viewPdfStr || ""} />
              </Worker>
            </div>
          ) : (
            <div className='flex h-full flex-col items-center justify-center'>
              <div className='rounded-lg bg-gray-100 p-8 text-center'>
                <h1 className='text-xl font-medium text-gray-700'>
                  No PDF file selected
                </h1>
                <p className='mt-2 text-gray-500'>
                  Please select a valid PDF document to view
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerModal;
