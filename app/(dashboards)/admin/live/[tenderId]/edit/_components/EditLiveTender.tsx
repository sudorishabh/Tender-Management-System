"use client";
import React, { use, useMemo, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useForm, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { ITenderFormSteps } from "@/_types/tender/createTender.type";
import { tenderFormDefaultValues } from "@/app/(dashboards)/admin/create/_CreateTenderConstants";
import { createTenderNavData } from "@/app/(dashboards)/admin/create/_CreateTenderConstants";
import CreateTenderNavbar from "@/app/(dashboards)/admin/create/_components/CreateTenderNavbar";
import ItemInfo from "@/app/(dashboards)/admin/create/_components/cards/ItemInfo";
import VendorDocRequirement from "@/app/(dashboards)/admin/create/_components/cards/VendorDocRequirement";
import KeyDates from "@/app/(dashboards)/admin/create/_components/cards/KeyDates";
import useUploadFileToS3 from "@/hooks/useUploadFileToS3";
import useDeleteFileFromS3 from "@/hooks/useDeleteFileFromS3";
import {
  convertStep3DatesToStrings,
  normalizeStep3Dates,
} from "@/utils/dateUtils";
import EditLiveTenderPreview from "./EditLiveTenderPreview";
import PageLoading from "@/components/Shared/PageLoading";

interface Props {
  paramsPromise: Promise<{ tenderId: string }>;
}

const EditLiveTender = ({ paramsPromise }: Props) => {
  const { tenderId } = use(paramsPromise);
  const tenderIdNum = parseInt(tenderId);
  const router = useRouter();
  const [activeFormTab, setActiveFormTab] = useState<number>(0);

  const [uploadFile, { isLoading: isUploading }] = useUploadFileToS3();
  const [deleteFileFromS3] = useDeleteFileFromS3();

  const updateMutation = trpc.tender.updateLiveTender.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data, isLoading } = trpc.tender.getForEdit.useQuery(tenderIdNum, {
    enabled: !!tenderIdNum,
  });

  const form = useForm<ITenderFormSteps>({
    defaultValues: tenderFormDefaultValues,
    mode: "onChange",
  });

  // Pre-populate form once data is loaded
  useEffect(() => {
    if (!data?.tender) return;
    const { tender, docRequirements, emailInvites } = data;

    const resetData: ITenderFormSteps = {
      step1: {
        tender_id: String(tender.tender_id),
        tender_department: tender.tender_department ?? "",
        tender_number: tender.tender_number ?? "",
        tender_type: tender.tender_type ?? "",
        tender_scope: tender.tender_scope ?? "",
        tender_title: tender.tender_title ?? "",
        tender_description: tender.tender_description ?? "",
        tender_contract_document: tender.tender_contract_document ?? "",
        tender_location: tender.tender_location ?? "",
        tender_opening_venue: tender.tender_opening_venue ?? "",
        tender_project_duration: tender.tender_project_duration ?? "",
        tender_is_technical_doc: tender.tender_is_technical_doc ?? false,
        tender_is_financial_doc: tender.tender_is_financial_doc ?? false,
        tender_doc_fee: tender.tender_doc_fee ?? "",
        tender_emd: tender.tender_emd ?? "",
        invited_emails: emailInvites.map((inv) => inv.email),
      },
      step2: docRequirements.map((doc) => ({
        vdr_name: doc.vdr_name ?? "",
      })),
      step3: normalizeStep3Dates(tender),
    };
    form.reset(resetData, { keepDefaultValues: false });
  }, [data, form]);

  const progressPercentage = useMemo(
    () => Math.round((activeFormTab / (createTenderNavData.length - 1)) * 100),
    [activeFormTab],
  );

  const handleUpdateTender = async (formData: ITenderFormSteps) => {
    let uploadedContractDocKey: string | null = null;

    try {
      let contractDocKey = formData.step1.tender_contract_document as string;

      if (
        formData.step1.tender_contract_document instanceof FileList &&
        formData.step1.tender_contract_document.length > 0
      ) {
        const file = formData.step1.tender_contract_document[0];
        const uploadedKey = await uploadFile(file, "Contract Document");
        if (!uploadedKey) {
          throw new Error("Failed to upload contract document, please try again");
        }
        contractDocKey = uploadedKey;
        uploadedContractDocKey = uploadedKey;
      }

      await updateMutation.mutateAsync({
        tender_id: tenderIdNum,
        step1: {
          ...formData.step1,
          tender_contract_document: contractDocKey,
          tender_type: formData.step1.tender_type ?? "",
          tender_scope: formData.step1.tender_scope ?? "",
          tender_id: tenderIdNum,
          tender_doc_fee: Number(formData.step1.tender_doc_fee),
          tender_emd: Number(formData.step1.tender_emd),
        },
        step2: formData.step2,
        step3: convertStep3DatesToStrings(formData.step3),
      });

      toast.success("Tender updated successfully", {
        description: "The live tender has been updated.",
      });
      router.push("/admin/live");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Update failed. Please try again.";
      toast.error(message);

      if (uploadedContractDocKey) {
        try {
          await deleteFileFromS3(uploadedContractDocKey);
        } catch {}
      }
    }
  };

  const renderStep = useCallback(
    (form: UseFormReturn<ITenderFormSteps>) => {
      const noop = async () => {};
      const commonProps = {
        setActive: setActiveFormTab,
        handleSaveTender: noop,
        isSavingTender: false,
      };

      switch (activeFormTab) {
        case 0:
          return <ItemInfo {...commonProps} liveEditRestricted />;
        case 1:
          return <VendorDocRequirement {...commonProps} readOnlyLiveTender />;
        case 2:
          return <KeyDates {...commonProps} isEditMode liveEditRestricted />;
        case 3:
          return (
            <EditLiveTenderPreview
              isLoading={updateMutation.isPending || isUploading}
              setActive={setActiveFormTab}
              isPreviewData={form.getValues()}
            />
          );
        default:
          return null;
      }
    },
    [activeFormTab, updateMutation.isPending, isUploading],
  );

  if (isLoading) return <PageLoading />;

  return (
    <div>
      <div className="pb-4">
        <div
          className="w-full h-1.5 bg-gray-200 rounded-full"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercentage}
          aria-label="Edit tender progress">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-medium text-gray-600">
            Step {activeFormTab + 1} of {createTenderNavData.length}
          </span>
          <span className="text-xs font-medium text-gray-600">
            {progressPercentage}% Complete
          </span>
        </div>
      </div>

      <div className="flex justify-between gap-5 h-full">
        <CreateTenderNavbar
          active={activeFormTab}
          setActive={setActiveFormTab}
          form={form}
          liveEditRestricted
        />
        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateTender)}>
              {renderStep(form)}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditLiveTender;
