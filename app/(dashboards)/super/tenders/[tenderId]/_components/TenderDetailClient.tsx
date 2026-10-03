"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDateTimeParts, formatDisplayTime12 } from "@/utils/dateUtils";
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Users,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Timer,
  Briefcase,
  Tag,
  Globe,
  Mail,
  Send,
} from "lucide-react";

import { Card, CardContent } from "@/_components/ui/card";
import { trpc } from "@/lib/trpc";
import { Button } from "@/_components/ui/button";
import PdfViewerModal from "@/_components/Shared/PdfViewerModal";
import { TENDER_STATUS } from "@/lib/server/constants";
import { toast } from "sonner";

interface BidderDocument {
  vdr_id: number;
  vdr_name: string;
  vdr_document: string | null;
  vdr_type: string | null;
  vdr_doc_type: string | null;
  s3_url?: string | null;
}

interface Tender {
  tender_id: number;
  tender_department: string | null;
  tender_number: string | null;
  tender_title: string;
  tender_type: string | null;
  tender_remark: string | null;
  tender_scope: string | null;
  tender_description: string | null;
  tender_contract_document: string | null;
  tender_doc_fee: string | null;
  tender_emd: string | null;
  tender_location: string | null;
  tender_status: string | null;
  // New timeline fields
  tender_release_date: string | null;
  tender_query_deadline: string | null;
  tender_query_response_date: string | null;
  tender_bid_submission_deadline: string | null;
  tender_technical_bid_opening: string | null;
  tender_financial_bid_opening: string | null;
  tender_opening_venue: string | null;
  tender_project_duration: string | null;
}

interface TenderData {
  tender: Tender;
  bidderDocumentsReq: BidderDocument[];
}

interface VendorSelection {
  vendor_id: number;
  vendor_name: string | null;
}

interface EmailInvite {
  invite_id: number;
  tender_id: number;
  email: string;
  sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface Props {
  tenderId: string;
}


const formatDateTime = (value?: string | null) => {
  if (!value) return { date: "TBD", time: "" };
  const parts = getDateTimeParts(value);
  return {
    date: parts.date,
    time: formatDisplayTime12(value),
  };
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "pending":
    case "review":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "rescheduled":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "draft":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-blue-100 text-blue-700 border-blue-200";
  }
};

export default function TenderDetailClient({ tenderId }: Props) {
  const numericTenderId = Number(tenderId);

  const { data, isLoading, isError } =
    trpc.tender.getAdminDetails.useQuery(numericTenderId);
  const [remarksValue, setRemarksValue] = useState("");
  // Default to 'published' so updates send 'published' unless user selects otherwise
  const [tenderStatusValue, setTenderStatusValue] = useState("published");

  const router = useRouter();
  const updateTender = trpc.tender.tenderStatusUpdateSuperAdmin.useMutation();

  const tenderData = data?.tenderData as TenderData | undefined;
  const vendorSelection = (data?.vendorSelection || []) as VendorSelection[];
  const emailInvites = (data?.emailInvites || []) as EmailInvite[];

  useEffect(() => {
    if (!tenderData?.tender) return;
    setRemarksValue(tenderData.tender.tender_remark ?? "");
  }, [tenderData?.tender]);

  const selectedStatus =
    tenderStatusValue || tenderData?.tender.tender_status || "published";

  const shouldShowRemarks = selectedStatus === "rescheduled";

  const handleSubmit = async () => {
    if (!tenderData) return;

    const updatedPayload = {
      tender_id: numericTenderId,
      tender_status: selectedStatus,
      ...(shouldShowRemarks && {
        tender_remark: remarksValue.trim() || undefined,
      }),
    };


    try {
      await updateTender.mutateAsync(updatedPayload);

      // Show success message based on status and email invites
      if (selectedStatus === TENDER_STATUS.PUBLISHED && emailInvites.length > 0) {
        toast.success(
          `Tender published successfully! Email invitations sent to ${emailInvites.length
          } ${emailInvites.length === 1 ? "vendor" : "vendors"}.`,
          {
            duration: 5000,
          }
        );
      } else if (selectedStatus === TENDER_STATUS.PUBLISHED) {
        toast.success("Tender published successfully!", { duration: 3000 });
      } else if (selectedStatus === TENDER_STATUS.RESCHEDULED) {
        toast.success("Tender rescheduled successfully!", { duration: 3000 });
      } else {
        toast.success("Tender status updated successfully!", {
          duration: 3000,
        });
      }

      router.push("/super/tenders");
      router.refresh();
    } catch {
      toast.error("Failed to update tender status. Please try again.", {
        duration: 4000,
      });
    }
  };
  if (isLoading) return <div>Loading tender details...</div>;
  if (isError || !data?.success || !tenderData)
    return <div>Error loading tender.</div>;

  const tender = tenderData.tender;

  const timelineEvents = [
    {
      label: "Release of Tender",
      date: tender.tender_release_date,
      icon: Calendar,
    },
    {
      label: "Query Submission Deadline",
      date: tender.tender_query_deadline,
      icon: AlertCircle,
    },
    {
      label: "Query Response Date",
      date: tender.tender_query_response_date,
      icon: CheckCircle2,
    },
    {
      label: "Bid Submission Deadline",
      date: tender.tender_bid_submission_deadline,
      icon: Timer,
    },
    {
      label: "Technical Bid Opening",
      date: tender.tender_technical_bid_opening,
      icon: Briefcase,
    },
    {
      label: "Financial Bid Opening",
      date: tender.tender_financial_bid_opening,
      icon: IndianRupee,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-3'>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                  tender.tender_status || ""
                )}`}>
                {tender.tender_status?.toUpperCase() || "N/A"}
              </span>
              <span className='text-gray-400 font-mono text-sm'>
                #{tender.tender_number}
              </span>
            </div>
            <h1 className='text-2xl font-bold mb-2 text-gray-900'>
              {tender.tender_title}
            </h1>
            <p className='text-gray-600 text-sm leading-relaxed max-w-2xl'>
              {tender.tender_description || "No description available."}
            </p>
          </div>
          {/* tender_value removed */}
        </div>
        <div className='flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-100'>
          <div className='flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100'>
            <Building2 className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-700'>
              {tender.tender_department || "N/A"}
            </span>
          </div>
          <div className='flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100'>
            <MapPin className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-700'>
              {tender.tender_location || "N/A"}
            </span>
          </div>
          <div className='flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100'>
            <Tag className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-700'>
              Type: {tender.tender_type || "N/A"}
            </span>
          </div>
          <div className='flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100'>
            <Globe className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-700'>
              Scope: {tender.tender_scope || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Financial Details Card */}
          <Card className='shadow-sm border border-gray-100'>
            <CardContent className='p-5'>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {/* Tender value removed */}
                <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
                  <p className='text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1'>
                    Document Fee
                  </p>
                  <p className='text-lg font-bold text-gray-900'>
                    {tender.tender_doc_fee || "N/A"}
                  </p>
                </div>
                <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
                  <p className='text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1'>
                    EMD Amount
                  </p>
                  <p className='text-lg font-bold text-gray-900'>
                    {tender.tender_emd || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className='shadow-sm border border-gray-100'>
            <CardContent className='p-5'>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {timelineEvents.map((event, index) => {
                  const { date, time } = formatDateTime(event.date);
                  const IconComponent = event.icon;
                  return (
                    <div
                      key={index}
                      className='relative p-4 rounded-xl border border-dashed bg-white'>
                      <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 mb-2'>
                        <IconComponent className='h-4 w-4 text-gray-500' />
                      </div>
                      <p className='text-xs font-medium text-gray-500 mb-1'>
                        {event.label}
                      </p>
                      <p className='text-base font-bold text-gray-900'>
                        {date}
                      </p>
                      {time && <p className='text-xs text-gray-400'>{time}</p>}
                    </div>
                  );
                })}
              </div>
              {(tender.tender_opening_venue ||
                tender.tender_project_duration) && (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100'>
                    {tender.tender_opening_venue && (
                      <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
                        <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>
                          Bid Opening Venue
                        </p>
                        <p className='text-sm text-gray-700'>
                          {tender.tender_opening_venue}
                        </p>
                      </div>
                    )}
                    {tender.tender_project_duration && (
                      <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
                        <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>
                          Project Duration
                        </p>
                        <p className='text-sm font-bold text-gray-700'>
                          {tender.tender_project_duration}
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Remarks Section */}
          {tender.tender_remark && (
            <Card className='shadow-sm border border-gray-100'>
              <CardContent className='p-5'>
                <p className='text-gray-700 leading-relaxed'>
                  {tender.tender_remark}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contract Document */}
          {tender.tender_contract_document && (
            <Card className='shadow-sm border border-gray-100'>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                      <FileText className='h-5 w-5 text-gray-500' />
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>
                        Contract Document
                      </p>
                      <p className='text-xs text-gray-500'>PDF Document</p>
                    </div>
                  </div>
                  <PdfViewerModal
                    value={tender.tender_contract_document}
                    isS3File={true}
                    triggerButton={
                      <Button
                        type='button'
                        variant='outline'
                        className='bg-white hover:bg-gray-50'>
                        <FileText className='w-4 h-4 mr-2' /> View Document
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className='space-y-6'>
          {/* Required Documents */}
          <Card className='shadow-sm border border-gray-100'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Required Documents
                </h2>
                <span className='text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full'>
                  {tenderData.bidderDocumentsReq.length}
                </span>
              </div>
              {tenderData.bidderDocumentsReq.length === 0 ? (
                <div className='text-center py-6 bg-gray-50 rounded-lg'>
                  <FileText className='h-6 w-6 text-gray-300 mx-auto mb-1' />
                  <p className='text-xs text-gray-400'>No documents required</p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {tenderData.bidderDocumentsReq.map((doc, index) => (
                    <div
                      key={doc.vdr_id}
                      className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                      <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <span className='text-xs font-bold text-gray-500'>
                          {index + 1}
                        </span>
                      </div>
                      <p className='text-sm font-medium text-gray-700 flex-1'>
                        {doc.vdr_name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Target Vendors */}
          <Card className='shadow-sm border border-gray-100'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  Target Vendors
                </h2>
                <span className='text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full'>
                  {vendorSelection.length}
                </span>
              </div>
              {vendorSelection.length === 0 ? (
                <div className='text-center py-6 bg-gray-50 rounded-lg'>
                  <Users className='h-6 w-6 text-gray-300 mx-auto mb-1' />
                  <p className='text-xs text-gray-400'>No vendors selected</p>
                </div>
              ) : (
                <div className='space-y-2 max-h-48 overflow-auto'>
                  {vendorSelection.map((vendor) => (
                    <div
                      key={vendor.vendor_id}
                      className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                      <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0'>
                        <span className='text-xs font-bold text-gray-500'>
                          {(vendor.vendor_name || "V")[0].toUpperCase()}
                        </span>
                      </div>
                      <p className='text-sm font-medium text-gray-700'>
                        {vendor.vendor_name || `Vendor #${vendor.vendor_id}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Invitations (for Limited tenders) */}
          {emailInvites.length > 0 && (
            <Card className='shadow-sm border border-blue-200 bg-blue-50/30'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <h2 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
                    <Mail className='h-5 w-5 text-blue-600' />
                    Email Invitations
                  </h2>
                  <span className='text-[10px] font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full'>
                    {emailInvites.length}
                  </span>
                </div>
                <div className='space-y-2 max-h-48 overflow-auto'>
                  {emailInvites.map((invite) => (
                    <div
                      key={invite.invite_id}
                      className='flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-blue-100'>
                      <div className='flex items-center gap-2 flex-1 min-w-0'>
                        <Mail className='h-4 w-4 text-blue-500 flex-shrink-0' />
                        <p className='text-sm font-medium text-gray-700 truncate'>
                          {invite.email}
                        </p>
                      </div>
                      {invite.sent_at ? (
                        <CheckCircle2 className='h-4 w-4 text-green-500 flex-shrink-0' />
                      ) : (
                        <Clock className='h-4 w-4 text-amber-500 flex-shrink-0' />
                      )}
                    </div>
                  ))}
                </div>
                <div className='mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200'>
                  <p className='text-xs text-blue-800'>
                    <strong>Note:</strong> Emails will be sent when tender
                    status is changed to &quot;Published&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Update Section */}
          <Card className='shadow-sm border border-gray-100'>
            <CardContent className='p-5 space-y-4'>
              <div>
                <label
                  htmlFor='tenderStatus'
                  className='block text-sm font-medium text-gray-700 mb-2'>
                  Select Status
                </label>
                <select
                  id='tenderStatus'
                  value={tenderStatusValue || tender.tender_status || "live"}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setTenderStatusValue(event.target.value)
                  }
                  className='w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'>
                  <option value={TENDER_STATUS.PUBLISHED}>Published</option>
                  <option value={TENDER_STATUS.RESCHEDULED}>Rescheduled</option>
                </select>
              </div>
              {shouldShowRemarks && (
                <div>
                  <label
                    htmlFor='remarks'
                    className='block text-sm font-medium text-gray-700 mb-2'>
                    Remarks
                  </label>
                  <textarea
                    id='remarks'
                    value={remarksValue}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      setRemarksValue(event.target.value)
                    }
                    placeholder='Add your remarks here...'
                    className='w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none'
                    rows={4}
                  />
                </div>
              )}

              {/* Email Sending Warning for Live Status */}
              {selectedStatus === TENDER_STATUS.PUBLISHED &&
                emailInvites.length > 0 && (
                  <div className='p-4 bg-blue-50 border border-blue-200 rounded-xl'>
                    <div className='flex items-start gap-3'>
                      <Send className='h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5' />
                      <div className='flex-1'>
                        <h4 className='text-sm font-semibold text-blue-900 mb-1'>
                          Email Notifications Will Be Sent
                        </h4>
                        <p className='text-xs text-blue-700 mb-2'>
                          Publishing this tender will automatically send email
                          invitations to <strong>{emailInvites.length}</strong>{" "}
                          {emailInvites.length === 1 ? "vendor" : "vendors"}:
                        </p>
                        <div className='space-y-1 max-h-32 overflow-y-auto'>
                          {emailInvites.slice(0, 5).map((invite) => (
                            <div
                              key={invite.invite_id}
                              className='flex items-center gap-2 text-xs text-blue-600'>
                              <Mail className='h-3 w-3' />
                              <span>{invite.email}</span>
                            </div>
                          ))}
                          {emailInvites.length > 5 && (
                            <p className='text-xs text-blue-600 italic'>
                              ...and {emailInvites.length - 5} more
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              <Button
                onClick={handleSubmit}
                disabled={updateTender.isPending}
                className='w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl shadow-sm transition-all'>
                {updateTender.isPending
                  ? "Updating..."
                  : selectedStatus === TENDER_STATUS.PUBLISHED &&
                    emailInvites.length > 0
                    ? `Publish & Send ${emailInvites.length} Email${emailInvites.length === 1 ? "" : "s"
                    }`
                    : "Update Tender"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
