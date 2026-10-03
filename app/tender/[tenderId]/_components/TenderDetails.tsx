import React from "react";
import { ITender } from "@/_types/tender";
import {
  FileText,
  AlertCircle,
  CreditCard,
  IndianRupee,
  type LucideIcon,
} from "lucide-react";

interface TenderDetailsProps {
  tender: ITender;
}

const PAYEE = "The Energy and Resources Institute";

/** One fee with what it is for and how to pay it, side by side. */
const FeeBlock = ({
  icon: Icon,
  label,
  amount,
  description,
  payment,
}: {
  icon: LucideIcon;
  label: string;
  amount: string | null;
  description: string;
  payment: React.ReactNode;
}) => (
  <div className='flex flex-col rounded-lg border border-slate-200'>
    <div className='flex items-start gap-3 p-4'>
      <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 flex-shrink-0'>
        <Icon
          className='w-4 h-4 text-primary'
          aria-hidden='true'
        />
      </div>
      <div className='min-w-0 flex-1'>
        <h3 className='text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1'>
          {label}
        </h3>
        <div className='flex items-baseline gap-0.5'>
          <IndianRupee
            className='w-5 h-5 text-slate-700'
            aria-hidden='true'
          />
          <p className='text-2xl font-semibold text-slate-700 tabular-nums'>
            {Number(amount).toLocaleString("en-IN")}
          </p>
        </div>
        <p className='mt-2 text-xs text-slate-600 leading-relaxed'>
          {description}
        </p>
      </div>
    </div>
    <div className='mt-auto border-t border-slate-200 bg-slate-50 px-4 py-3'>
      <p className='text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1'>
        How to pay
      </p>
      <p className='text-sm text-slate-900 font-medium'>{payment}</p>
    </div>
  </div>
);

const TenderDetails: React.FC<TenderDetailsProps> = ({ tender }) => {
  return (
    <div className='space-y-4'>
      {/* Fees and how to pay each of them */}
      <div className='bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden'>
        <div className='px-5 py-4 border-b border-neutral-100'>
          <h2 className='text-sm font-semibold text-slate-900'>
            Fees and payment
          </h2>
          <p className='text-xs text-slate-600 mt-1'>
            Payment instructions from the Tender Management Department for the
            document fee and EMD
          </p>
        </div>
        <div className='p-5'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FeeBlock
              icon={FileText}
              label='Document Fee'
              amount={tender.tender_doc_fee}
              description='Non-refundable fee required to access and download the complete tender documentation, including technical specifications and terms.'
              payment={
                <>
                  Bank Cheque in favour of{" "}
                  <span className='font-bold text-primary'>{PAYEE}</span>
                </>
              }
            />
            <FeeBlock
              icon={CreditCard}
              label='EMD Amount'
              amount={tender.tender_emd}
              description='Earnest Money Deposit (EMD) is a refundable security deposit required at the time of bid submission to demonstrate serious intent.'
              payment={
                <>
                  Demand Draft in favour of{" "}
                  <span className='font-bold text-primary'>{PAYEE}</span>{" "}
                  payable at{" "}
                  <span className='font-bold text-primary'>New Delhi</span>
                </>
              }
            />
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
    </div>
  );
};

export default TenderDetails;
