import React, { FC } from "react";
import { useFormContext } from "react-hook-form";
import { numberToCurrencyVal } from "@/utils/numberToCurrencyVal";
import { CoinsIcon, HelpCircle, IndianRupee } from "lucide-react";
import InfoCard from "@/components/Shared/InfoCard";
import DocumentUploadField from "@/components/Shared/DocumentUploadField";
import CustomInput from "@/components/Shared/CustomInput";
import { TENDER_TITLE_MAX_LENGTH } from "@/lib/constants";
import { ArrowRight, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ITenderFormSteps } from "@/_types/tender/createTender.type";
import CustomButton from "@/_components/Shared/CustomButton";
import EmailInviteInput from "./EmailInviteInput";

interface Props {
  setActive: (active: number) => void;
  handleSaveTender: () => void;
  isSavingTender: boolean;
  /** When true, only description, contract document, and project timeframe are editable (live tender edit). */
  liveEditRestricted?: boolean;
}

// --- Component ---
const TenderNumberInput = ({ disabled }: { disabled?: boolean }) => {
  const { setValue, watch, register, getFieldState, formState } =
    useFormContext<ITenderFormSteps>();

  const currentYear = `${new Date().getFullYear() - 1}-${new Date().getFullYear().toString().slice(-2)}`;
  const prefix = `TERI/MAT/${currentYear}/`;

  const existingValue = watch("step1.tender_number") || "";
  const [idVal, setIdVal] = React.useState("");

  // Register the field with validation
  React.useEffect(() => {
    register("step1.tender_number", { required: "Tender number is required" });
  }, [register]);

  React.useEffect(() => {
    if (existingValue && existingValue.includes("TERI/MAT/")) {
      const parts = existingValue.split("/");
      // TERI/MAT/YEAR/ID -> parts[3]
      if (parts.length >= 4) {
        setIdVal(parts[3]);
      }
    } else if (!existingValue) {
      setIdVal("");
    }
  }, [existingValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIdVal(val);
    if (val) {
      setValue("step1.tender_number", `${prefix}${val}`, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue("step1.tender_number", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  // Safe access to error message
  const { error } = getFieldState("step1.tender_number", formState);
  const errorMessage = error?.message;

  if (disabled) {
    return (
      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold text-gray-700'>
          Tender Number <span className='text-red-500'>*</span>
        </label>
        <div className='h-9 px-3 flex items-center text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-800'>
          {existingValue || "—"}
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-2'>
      <label className='text-xs font-semibold text-gray-700'>
        Tender Number <span className='text-red-500'>*</span>
      </label>
      <div className='flex items-center w-full'>
        <span className='text-xs text-gray-500 bg-gray-100 px-3 h-9 flex items-center border border-r-0 border-gray-200 rounded-l-md min-w-max'>
          {prefix}
        </span>
        <input
          type='number'
          value={idVal}
          onChange={handleChange}
          placeholder='Seq. No.'
          className={`flex-1 h-9 px-3 w-full py-2 text-sm border rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary/20 ${errorMessage ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-primary"}`}
        />
      </div>
      {errorMessage && (
        <p className='text-xs text-red-500 mt-1'>{errorMessage as string}</p>
      )}
    </div>
  );
};

const ItemInfo: FC<Props> = ({
  setActive,
  handleSaveTender,
  isSavingTender,
  liveEditRestricted = false,
}) => {
  const form = useFormContext<ITenderFormSteps>();
  const {
    control,
    trigger,
    watch,
    formState: { errors },
  } = form;

  const {
    data: departmentsData,
    isLoading: deptLoading,
    error: deptError,
  } = trpc.department.getAll.useQuery();

  const handleNextBtn = async () => {
    const isValid = await trigger(["step1"]);
    if (isValid) {
      setActive(1);
    } else {
      const invalidFields = Object.keys(errors);
      console.log("These fields are invalid:", invalidFields);
    }
  };

  return (
    <InfoCard
      title='Primary Tender Information'
      information="Provide the basic details that define this tender's purpose and scope"
      Button={
        <CustomButton
          btnName={isSavingTender ? "Saving..." : "Save as Draft"}
          variant='tertiary'
          LeftIcon={Save}
          onClick={handleSaveTender}
          disabled={isSavingTender}
        />
      }>
      <div className='flex flex-col gap-6'>
        {liveEditRestricted && (
          <div className='p-3 rounded-md border border-amber-200 bg-amber-50 text-xs text-amber-900'>
            For published tenders you can only change the description, contract document, project timeframe, and the
            selected key dates on the next steps. All other fields stay as published.
          </div>
        )}
        {/* Basic Information Section */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-gray-700 border-b pb-2'>
            <h3 className='font-semibold text-sm'>Basic Information</h3>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {deptLoading ? (
              <p>Loading departments...</p>
            ) : deptError ? (
              <p className='text-red-600'>Failed to load</p>
            ) : (
              <CustomInput
                control={control}
                fieldName='step1.tender_department'
                Label='Department'
                placeholder='Select Department'
                isSelect
                disabled={liveEditRestricted}
                selectOptions={
                  Array.isArray(departmentsData?.data)
                    ? departmentsData.data.map(
                        (dept: { division_name: string }) => ({
                          label: dept.division_name,
                          value: String(dept.division_name),
                        }),
                      )
                    : []
                }
                rules={{ required: "Department is required" }}
              />
            )}

            <TenderNumberInput disabled={liveEditRestricted} />

            <CustomInput
              control={control}
              fieldName='step1.tender_type'
              Label='Tender Type'
              placeholder='Select Tender Type'
              isSelect
              disabled={liveEditRestricted}
              selectOptions={[
                { label: "Public", value: "public" },
                { label: "Limited", value: "limited" },
                { label: "Open", value: "open" },
                { label: "Global", value: "global" },
              ]}
              rules={{ required: "Tender type is required" }}
            />

            <CustomInput
              control={control}
              fieldName='step1.tender_scope'
              Label='Tender Scope'
              placeholder='Select Tender Scope'
              isSelect
              disabled={liveEditRestricted}
              selectOptions={[
                { label: "Product", value: "product" },
                { label: "Service", value: "service" },
              ]}
              rules={{ required: "Tender scope is required" }}
            />
          </div>

          {/* Email Invitations for Limited Tenders */}
          {watch("step1.tender_type")?.toLowerCase() === "limited" && (
            <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <EmailInviteInput readOnly={liveEditRestricted} />
            </div>
          )}
        </div>

        {/* Tender Details Section */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-gray-700 border-b pb-2'>
            <h3 className='font-semibold text-sm'>Tender Details</h3>
          </div>

          <CustomInput
            control={control}
            fieldName='step1.tender_title'
            Label='Title'
            placeholder='Enter a clear, descriptive title for this tender'
            disabled={liveEditRestricted}
            maxLength={TENDER_TITLE_MAX_LENGTH}
            rules={{ required: "Title is required" }}
          />

          <CustomInput
            control={control}
            fieldName='step1.tender_description'
            Label='Description'
            placeholder='Provide a detailed description of the tender requirements, scope, and expectations'
            isTextArea
            description='A thorough description helps vendors understand what is expected. Include key requirements, specifications, and any other relevant details.'
            rules={{ required: "Description is required" }}
          />

          <DocumentUploadField
            control={control}
            name='step1.tender_contract_document'
            value={watch("step1.tender_contract_document")}
            label='Contract Document'
            description='Upload the technical contract document (PDF only, max 50MB)'
            required={true}
            maxSizeMB={60}
          />
        </div>

        {/* Location & Timeline Section */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-gray-700 border-b pb-2'>
            <h3 className='font-semibold text-sm'>Location & Timeline</h3>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <CustomInput
              control={control}
              fieldName='step1.tender_location'
              Label='Tender Location'
              placeholder='E.g., New Delhi, Mumbai, Online'
              description='Physical location or specify if this is an online-only tender'
              disabled={liveEditRestricted}
              rules={{ required: "Tender location is required" }}
            />

            <CustomInput
              control={control}
              fieldName='step1.tender_project_duration'
              Label='Project Timeframe'
              placeholder='E.g., 07 months, 1 year, 6 weeks'
              description='Expected duration for project completion after contract award'
              optional
            />
          </div>

          <CustomInput
            control={control}
            fieldName='step1.tender_opening_venue'
            Label='Bid Opening Venue'
            placeholder='Enter the venue address for technical and financial bid opening.'
            description='Complete address where technical and financial bids will be opened'
            disabled={liveEditRestricted}
            optional
          />
        </div>

        {/* Financial Requirements Section */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-gray-700 border-b pb-2'>
            <CoinsIcon size={18} />
            <h3 className='font-semibold text-sm'>Financial Requirements</h3>
          </div>

          <div className='p-4 bg-amber-50 rounded-md border text-xs border-amber-100 flex items-start'>
            <HelpCircle
              size={14}
              className='text-amber-600 mr-3 mt-0.5 flex-shrink-0'
            />
            <div>
              <h3 className='font-medium text-amber-800 mb-1'>
                Fee Information
              </h3>
              <p className='text-amber-700'>
                Clearly define all financial requirements including document
                fees, EMD (Earnest Money Deposit), and payment instructions.
                This information is critical for vendors to prepare their bids
                correctly.
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <CustomInput
              control={control}
              fieldName='step1.tender_doc_fee'
              Label='Tender Processing Fee'
              LabelIcon={IndianRupee}
              placeholder='Enter fee to purchase tender documents'
              disabled={liveEditRestricted}
              rules={{ required: "Document fee is required" }}
              formatDisplay={(v: string | number | null | undefined) =>
                numberToCurrencyVal(String(v ?? ""))
              }
              parseValue={(display: string) => display.replace(/[^0-9]/g, "")}
            />

            <CustomInput
              control={control}
              fieldName='step1.tender_emd'
              Label='EMD Amount'
              LabelIcon={IndianRupee}
              placeholder='Enter security deposit amount'
              disabled={liveEditRestricted}
              rules={{ required: "EMD amount is required" }}
              formatDisplay={(v: string | number | null | undefined) =>
                numberToCurrencyVal(String(v ?? ""))
              }
              parseValue={(display: string) => display.replace(/[^0-9]/g, "")}
            />
          </div>
        </div>

        <div className='flex justify-end mt-4'>
          <CustomButton
            btnName='Continue to Documents'
            variant='primary'
            RightIcon={ArrowRight}
            onClick={handleNextBtn}
          />
        </div>
      </div>
    </InfoCard>
  );
};

export default ItemInfo;
