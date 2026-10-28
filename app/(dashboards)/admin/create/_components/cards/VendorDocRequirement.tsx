import { secondaryButtonStyle } from "@/app/styles";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import CustomInput from "@/components/Shared/CustomInput";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  HelpCircle,
  Plus,
  Save,
  Trash2,
  FileCheck,
  Calculator,
  FolderPlus,
} from "lucide-react";
import React, { FC } from "react";
import { toast } from "sonner";
import { useFieldArray, useFormContext } from "react-hook-form";
import InfoCard from "@/components/Shared/InfoCard";
import { ITenderFormSteps } from "@/_types/tender/createTender.type";
import CustomButton from "@/_components/Shared/CustomButton";

interface Props {
  setActive: (active: number) => void;
  /** Omit to hide the Save as Draft button (live tender edit). */
  handleSaveTender?: () => void;
  isSavingTender?: boolean;
  /** When true, document requirements are display-only (live tender edit). */
  readOnlyLiveTender?: boolean;
}

const VendorDocRequirement: FC<Props> = ({
  setActive,
  handleSaveTender,
  isSavingTender,
  readOnlyLiveTender = false,
}) => {
  const form = useFormContext<ITenderFormSteps>();
  const { control, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "step2",
  });

  function addDocumentDefinition() {
    const documents = watch("step2");
    const lastDocument = documents[documents.length - 1];

    if (!lastDocument || lastDocument.vdr_name) {
      append({
        vdr_name: "",
      });
    } else {
      toast.error(
        "Please fill in the previous document name before adding a new one."
      );
    }
  }

  const isTechnicalDoc = watch("step1.tender_is_technical_doc");
  const isFinancialDoc = watch("step1.tender_is_financial_doc");

  const handleNextBtn = async () => {
    if (readOnlyLiveTender) {
      setActive(2);
      return;
    }
    // Check if at least one document requirement is set
    const hasStandardDoc = isTechnicalDoc || isFinancialDoc;
    const customDocs = watch("step2") || [];
    const hasCustomDoc = customDocs.some(
      (doc) => doc.vdr_name && doc.vdr_name.trim()
    );

    if (!hasStandardDoc && !hasCustomDoc) {
      toast.error(
        "Please select at least one document requirement (Technical, Financial, or add a custom document)"
      );
      return;
    }

    // Validate that all custom documents have names
    const hasEmptyCustomDoc = customDocs.some(
      (doc) => !doc.vdr_name || !doc.vdr_name.trim()
    );
    if (hasEmptyCustomDoc) {
      toast.error(
        "Please fill in all custom document names or remove empty entries"
      );
      return;
    }

    setActive(2);
  };

  return (
    <InfoCard
      title='Vendor Document Requirements'
      information='Define the documents vendors must submit with their bids (At least one required)'
      Button={
        handleSaveTender && (
          <CustomButton
            btnName={isSavingTender ? "Saving..." : "Save as Draft"}
            variant='tertiary'
            LeftIcon={Save}
            onClick={handleSaveTender}
            disabled={isSavingTender}
          />
        )
      }>
      <div className='space-y-6'>
        {/* Info Banner */}
        <div className='p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3'>
          <HelpCircle
            size={20}
            className='text-amber-600 mt-0.5 flex-shrink-0'
          />
          <div className='text-sm'>
            <h3 className='font-semibold text-amber-800 mb-1'>
              Document Submission Requirements
            </h3>
            <p className='text-amber-700'>
              {readOnlyLiveTender
                ? "Published tenders keep the same vendor document requirements. Continue to update allowed dates and other editable fields."
                : "Configure which documents vendors need to provide when submitting their bids. You must enable at least one of the standard Technical or Financial documents below, or add a custom document. This ensures vendors provide necessary documentation with their bids."}
            </p>
          </div>
        </div>

        {/* Standard Documents Section */}
        <div className='space-y-4'>
          <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
            <FileCheck
              size={18}
              className='text-primary'
            />
            Standard Document Types
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Technical Document Card */}
            <div
              className={`relative p-5 rounded-lg border-2 transition-all ${readOnlyLiveTender ? "cursor-default opacity-90" : "cursor-pointer"} ${isTechnicalDoc
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              onClick={() => {
                if (readOnlyLiveTender) return;
                setValue("step1.tender_is_technical_doc", !isTechnicalDoc, {
                  shouldValidate: false,
                });
              }}>
              <div className='flex items-start gap-4'>
                <div
                  className={`p-3 rounded-lg ${isTechnicalDoc ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                  <FileText
                    size={24}
                    className={
                      isTechnicalDoc ? "text-blue-600" : "text-gray-500"
                    }
                  />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <Label
                      htmlFor='is_technical_doc'
                      className='text-base font-semibold text-gray-800 cursor-pointer'>
                      Technical Document
                    </Label>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        id='is_technical_doc'
                        checked={isTechnicalDoc}
                        disabled={readOnlyLiveTender}
                        onCheckedChange={(checked) => {
                          setValue("step1.tender_is_technical_doc", checked === true, {
                            shouldValidate: false,
                          });
                        }}
                        className='h-5 w-5'
                      />
                    </div>
                  </div>
                  <p className='text-xs text-gray-600 leading-relaxed'>
                    Request technical specifications, methodology, project
                    approach, team qualifications, and implementation plans from
                    vendors.
                  </p>
                </div>
              </div>
              {isTechnicalDoc && (
                <div className='absolute top-2 left-2'>
                  <span className='px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full'>
                    Required
                  </span>
                </div>
              )}
            </div>

            {/* Financial Document Card */}
            <div
              className={`relative p-5 rounded-lg border-2 transition-all ${readOnlyLiveTender ? "cursor-default opacity-90" : "cursor-pointer"} ${isFinancialDoc
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              onClick={() => {
                if (readOnlyLiveTender) return;
                setValue("step1.tender_is_financial_doc", !isFinancialDoc, {
                  shouldValidate: false,
                });
              }}>
              <div className='flex items-start gap-4'>
                <div
                  className={`p-3 rounded-lg ${isFinancialDoc ? "bg-green-100" : "bg-gray-100"
                    }`}>
                  <Calculator
                    size={24}
                    className={
                      isFinancialDoc ? "text-green-600" : "text-gray-500"
                    }
                  />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <Label
                      htmlFor='is_financial_doc'
                      className='text-base font-semibold text-gray-800 cursor-pointer'>
                      Financial Document
                    </Label>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        id='is_financial_doc'
                        checked={isFinancialDoc}
                        disabled={readOnlyLiveTender}
                        onCheckedChange={(checked) => {
                          setValue("step1.tender_is_financial_doc", checked === true, {
                            shouldValidate: false,
                          });
                        }}
                        className='h-5 w-5'
                      />
                    </div>
                  </div>
                  <p className='text-xs text-gray-600 leading-relaxed'>
                    Request pricing breakdown, cost estimates, payment terms,
                    and financial proposals from vendors.
                  </p>
                </div>
              </div>
              {isFinancialDoc && (
                <div className='absolute top-2 left-2'>
                  <span className='px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded-full'>
                    Required
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-200' />
          </div>
          <div className='relative flex justify-center'>
            <span className='bg-white px-4 text-sm text-gray-500'>
              Additional Documents
            </span>
          </div>
        </div>

        {/* Additional Documents Section */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
                <FolderPlus
                  size={18}
                  className='text-primary'
                />
                Custom Document Requirements
              </h3>
              <p className='text-xs text-gray-500 mt-1'>
                Add any other documents you need from vendors (e.g., Company
                Profile, Certifications, Experience Letters, etc.)
              </p>
            </div>
            {!readOnlyLiveTender && (
              <Button
                type='button'
                variant={"outline"}
                className={secondaryButtonStyle}
                onClick={addDocumentDefinition}>
                <Plus size={16} /> Add Document
              </Button>
            )}
          </div>

          {/* Custom Documents List */}
          <div className='space-y-3'>
            {fields.map((field, i) => (
              <div
                key={field.id}
                className='bg-gray-50 rounded-lg border border-gray-200 overflow-hidden'>
                <div className='bg-gray-100 py-2.5 px-4 flex items-center justify-between'>
                  <h2 className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                    <FileText
                      size={14}
                      className='text-primary'
                    />
                    Additional Document {i + 1}
                    {watch(`step2.${i}.vdr_name`) && (
                      <span className='text-gray-500'>
                        — {watch(`step2.${i}.vdr_name`)}
                      </span>
                    )}
                  </h2>
                  {!readOnlyLiveTender && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50'
                      onClick={() => remove(i)}>
                      <Trash2
                        size={14}
                        className='mr-1'
                      />
                      Remove
                    </Button>
                  )}
                </div>
                <div className='p-4'>
                  <CustomInput
                    control={control}
                    fieldName={`step2.${i}.vdr_name`}
                    Label='Document Name'
                    placeholder='E.g., Company Profile, ISO Certification, Past Experience'
                    disabled={readOnlyLiveTender}
                  />
                </div>
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <div className='text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
              <FolderPlus
                size={36}
                className='mx-auto mb-3 text-gray-400'
              />
              <p className='text-sm font-medium text-gray-600'>
                No additional documents added
              </p>
              <p className='text-xs text-gray-500 mt-1 max-w-md mx-auto'>
                Need more than Technical and Financial documents? Click
                &quot;Add Document&quot; to request additional materials from
                vendors.
              </p>
            </div>
          )}
        </div>

        {/* Summary or Warning */}
        {(() => {
          const hasStandardDoc = isTechnicalDoc || isFinancialDoc;
          const customDocs = watch("step2") || [];
          const hasCustomDoc = customDocs.some(
            (doc) => doc.vdr_name && doc.vdr_name.trim()
          );
          const hasAnyDoc = hasStandardDoc || hasCustomDoc;

          if (!hasAnyDoc && !readOnlyLiveTender) {
            return (
              <div className='p-4 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3'>
                <HelpCircle
                  size={20}
                  className='text-red-600 mt-0.5 flex-shrink-0'
                />
                <div className='text-sm'>
                  <h4 className='font-semibold text-red-800 mb-1'>
                    No Documents Selected
                  </h4>
                  <p className='text-red-700'>
                    Please select at least one document requirement before
                    proceeding. Enable Technical or Financial documents, or add
                    a custom document.
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <h4 className='text-xs font-semibold text-gray-700 mb-2'>
                Documents vendors will need to submit:
              </h4>
              <div className='flex flex-wrap gap-2'>
                {isTechnicalDoc && (
                  <span className='px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full'>
                    Technical Document
                  </span>
                )}
                {isFinancialDoc && (
                  <span className='px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full'>
                    Financial Document
                  </span>
                )}
                {fields.map((field, i) => {
                  const docName = watch(`step2.${i}.vdr_name`);
                  return docName ? (
                    <span
                      key={field.id}
                      className='px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full'>
                      {docName}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          );
        })()}

        <div className='flex justify-between mt-8'>
          <CustomButton
            variant='secondary'
            btnName='Previous Step'
            LeftIcon={ArrowLeft}
            onClick={() => setActive(0)}
          />

          <CustomButton
            btnName='Continue to Deadlines'
            RightIcon={ArrowRight}
            onClick={handleNextBtn}
            variant='primary'
          />
        </div>
      </div>
    </InfoCard>
  );
};

export default VendorDocRequirement;
