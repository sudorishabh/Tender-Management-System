import React from "react";
import { ITender } from "@/_types/tender";
import {
  FileText,
  AlertCircle,
  CreditCard,
  IndianRupee,
  Building2,
  Phone,
  Mail,
} from "lucide-react";

interface TenderDetailsProps {
  tender: ITender;
}

const TenderDetails: React.FC<TenderDetailsProps> = ({ tender }) => {
  return (
    <div className='space-y-4'>
      {/* Fees Section */}
      <div className='bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden'>
        <div className='px-5 py-4 border-b border-neutral-100'>
          <h2 className='text-sm font-semibold text-slate-900'>
            Fee Structure
          </h2>
        </div>
        <div className='p-5'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Document Fee */}
            <div className='p-4 rounded-lg bg-slate-50 border border-slate-200'>
              <div className='flex items-start gap-3 mb-3'>
                <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 flex-shrink-0'>
                  <FileText className='w-4 h-4 text-primary' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1'>
                    Document Fee
                  </h3>
                  <div className='flex items-baseline gap-0.5'>
                    <IndianRupee className='w-5 h-5 text-slate-700' />
                    <p className='text-2xl font-semibold text-slate-700'>
                      {Number(tender.tender_doc_fee).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
              <p className='text-xs text-slate-600 leading-relaxed'>
                Non-refundable fee required to access and download the complete
                tender documentation, including technical specifications and
                terms.
              </p>
            </div>

            {/* EMD Amount */}
            <div className='p-4 rounded-lg bg-slate-50 border border-slate-200'>
              <div className='flex items-start gap-3 mb-3'>
                <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 flex-shrink-0'>
                  <CreditCard className='w-4 h-4 text-primary' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1'>
                    EMD Amount
                  </h3>
                  <div className='flex items-baseline gap-0.5'>
                    <IndianRupee className='w-5 h-5 text-slate-700' />
                    <p className='text-2xl font-semibold text-slate-700'>
                      {Number(tender.tender_emd).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
              <p className='text-xs text-slate-600 leading-relaxed'>
                Earnest Money Deposit (EMD) is a refundable security deposit
                required at the time of bid submission to demonstrate serious
                intent.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className='bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden'>
        <div className='px-5 py-4 border-b border-neutral-100'>
          <h2 className='text-sm font-semibold text-slate-900'>
            Payment Instructions
          </h2>
          <p className='text-xs text-slate-600 mt-1'>
            Bank account details for document fee and EMD payments
          </p>
        </div>
        <div className='p-5'>
          <div className='p-4 rounded-lg bg-slate-50 border border-slate-200'>
            <div className='flex items-start gap-3 mb-4'>
              <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 flex-shrink-0'>
                <Building2 className='w-4 h-4 text-primary' />
              </div>
              <div className='flex-1'>
                <h3 className='text-sm font-semibold text-slate-900 mb-1'>
                  Tender Management Department
                </h3>
                <p className='text-xs text-slate-600'>
                  Please follow the instructions below for payments
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2'>
                  Document Fee Payment
                </p>
                <div className='p-3 bg-slate-50 border border-slate-200 rounded-lg'>
                  <p className='text-sm text-slate-900 font-medium'>
                    Bank Cheque in favour of{" "}
                    <span className='font-bold text-primary'>
                      The Energy and Resources Institute
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <p className='text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2'>
                  EMD Payment
                </p>
                <div className='p-3 bg-slate-50 border border-slate-200 rounded-lg'>
                  <p className='text-sm text-slate-900 font-medium'>
                    Demand Draft in favour of{" "}
                    <span className='font-bold text-primary'>
                      The Energy and Resources Institute
                    </span>{" "}
                    payable at{" "}
                    <span className='font-bold text-primary'>New Delhi</span>
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
              <p className='text-xs text-amber-800 leading-relaxed'>
                <strong>Note:</strong> Please mention the tender number (
                {tender.tender_number}) as reference when making the payment.
                Keep the payment receipt for verification during bid submission.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {(tender.tender_comm_prebid || tender.tender_remark) && (
        <div className='bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden'>
          <div className='px-5 py-4 border-b border-neutral-100'>
            <h2 className='text-sm font-semibold text-slate-900'>
              Additional Information
            </h2>
          </div>
          <div className='p-5 space-y-4'>
            {tender.tender_comm_prebid && (
              <div>
                <h3 className='text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2'>
                  Commercial Pre-bid
                </h3>
                <p className='text-sm text-slate-700 leading-relaxed'>
                  {tender.tender_comm_prebid}
                </p>
              </div>
            )}

            {tender.tender_remark && (
              <div className='flex gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg'>
                <AlertCircle className='w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-xs font-semibold text-amber-900 mb-1 uppercase tracking-wide'>
                    Important Notice
                  </h3>
                  <p className='text-sm text-amber-800 leading-relaxed'>
                    {tender.tender_remark}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help & Support */}
      <div className='bg-gray-100/90 rounded-lg border border-emerald-50/10 shadow-sm overflow-hidden'>
        <div className='px-5 py-4 border-b border-emerald-50/10'>
          <h2 className='text-sm font-semibold text-emerald-600'>
            Help & Support
          </h2>
          <p className='text-xs text-slate-600 mt-1'>
            Contact us for assistance with this tender
          </p>
        </div>
        <div className='p-5 grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-50 shadow-sm'>
            <div className='w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0'>
              <Phone className='w-4 h-4 text-emerald-600' />
            </div>
            <div>
              <p className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                Helpline Number
              </p>
              <p className='text-sm font-bold text-slate-900'>+91 8560064756</p>
            </div>
          </div>

          <div className='flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-50 shadow-sm'>
            <div className='w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0'>
              <Mail className='w-4 h-4 text-emerald-600' />
            </div>
            <div>
              <p className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                Email Support
              </p>
              <p className='text-sm font-bold text-slate-900'>
                etender@teri.res.in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderDetails;
