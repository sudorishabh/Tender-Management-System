import { ITenderFormSteps } from "@/_types/tender/createTender.type";
import { UseFormReturn } from "react-hook-form";
import { useCallback } from "react";
import { tenderFormDefaultValues } from "../_CreateTenderConstants";
import { normalizeStep3Dates } from "@/utils/dateUtils";

const useHandleResetTenderForm = () => {
  const handleResetTenderForm = useCallback(
    ({
      savedTenderData,
      form,
    }: {
      savedTenderData: ITenderFormSteps | null;
      form: UseFormReturn<ITenderFormSteps>;
    }) => {
      if (!savedTenderData) {
        form.reset(tenderFormDefaultValues);
        return;
      }

      const resetData: ITenderFormSteps = {
        step1: {
          ...savedTenderData.step1,
          tender_department: savedTenderData.step1.tender_department || "",
          tender_type: savedTenderData.step1.tender_type || "",
          tender_scope: savedTenderData.step1.tender_scope || "",
        },
        step2: savedTenderData.step2,
        step3: normalizeStep3Dates(savedTenderData.step3),
      };
      form.reset(resetData, {
        keepDefaultValues: false,
      });
    },
    []
  );

  return [handleResetTenderForm];
};

export default useHandleResetTenderForm;
