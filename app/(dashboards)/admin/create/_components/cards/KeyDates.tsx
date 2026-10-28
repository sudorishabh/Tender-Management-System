import React, { FC } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import InfoCard from "@/components/Shared/InfoCard";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Clock,
  HelpCircle,
  InfoIcon,
  Save,
  AlertCircle,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { inputStyle } from "@/app/styles";
import { ITenderFormSteps } from "@/_types/tender/createTender.type";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomButton from "@/_components/Shared/CustomButton";

interface Props {
  setActive: (active: number) => void;
  /** Omit to hide the Save as Draft button (live tender edit). */
  handleSaveTender?: () => void;
  isSavingTender?: boolean;
  /**
   * When true (editing a published tender), skips the "release date must not be
   * in the past" check and instead requires every changed date to be in the future
   */
  isEditMode?: boolean;
  /** Dates shown read-only, each with a note explaining why (live tender edit). */
  lockedDates?: Partial<Record<KeyDateField, string>>;
}

export type KeyDateField = keyof ITenderFormSteps["step3"];

const keyDateDescriptions = [
  {
    key: "tender_release_date",
    name: "Release of Tender",
    description: "Official date and time when the tender is released/published.",
    requiresTime: true,
  },
  {
    key: "tender_bid_submission_deadline",
    name: "Bid Submission Deadline",
    description:
      "Last date and time for submission of technical and financial bid response.",
    requiresTime: true,
  },
  {
    key: "tender_technical_bid_opening",
    name: "Technical Bid Opening",
    description: "Date and time for opening of technical bids.",
    requiresTime: true,
  },
  {
    key: "tender_financial_bid_opening",
    name: "Financial Bid Opening",
    description: "Financial bid opening of only technically qualified bidders.",
    requiresTime: true,
  },
  {
    key: "tender_query_deadline",
    name: "Query Submission Deadline",
    description: "Last date for submission of written questions by bidders.",
    requiresTime: false,
  },
  {
    key: "tender_query_response_date",
    name: "Query Response Date",
    description: "Date when responses to bidder queries will be provided.",
    requiresTime: false,
  },
];

interface DateValidationError {
  field: KeyDateField;
  message: string;
}

const KeyDates: FC<Props> = ({
  setActive,
  handleSaveTender,
  isSavingTender,
  isEditMode = false,
  lockedDates = {},
}) => {
  const {
    control,
    watch,
    setValue,
    trigger,
    setError,
    clearErrors,
    formState: { defaultValues },
  } = useFormContext<ITenderFormSteps>();

  const step3Data = watch("step3");
  const [dateValidationErrors, setDateValidationErrors] = React.useState<DateValidationError[]>([]);

  // Helper to safely convert value to Date object using date-fns
  const toLocalDate = (value: Date | string | null | undefined): Date | null => {
    if (!value) return null;

    // If it's already a Date, check if it's valid
    if (value instanceof Date) {
      return isValid(value) ? value : null;
    }

    // If it's a string (ISO format from server), parse it using date-fns
    try {
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  // Validate all date constraints
  const validateDates = (): DateValidationError[] => {
    const errors: DateValidationError[] = [];

    const releaseDate = toLocalDate(step3Data?.tender_release_date);
    const deadlineDate = toLocalDate(step3Data?.tender_bid_submission_deadline);
    const queryStartDate = toLocalDate(step3Data?.tender_query_deadline);
    const queryEndDate = toLocalDate(step3Data?.tender_query_response_date);
    const technicalDate = toLocalDate(step3Data?.tender_technical_bid_opening);
    const financialDate = toLocalDate(step3Data?.tender_financial_bid_opening);

    // 0. Release Date Validation: release_date >= current_date
    // Skipped in edit mode because a published tender's release date is already in the past
    if (!isEditMode && releaseDate) {
      const today = new Date();
      // Set today to start of day for comparison (ignore time)
      today.setHours(0, 0, 0, 0);

      const releaseDateOnly = new Date(releaseDate);
      releaseDateOnly.setHours(0, 0, 0, 0);

      if (releaseDateOnly < today) {
        errors.push({
          field: "tender_release_date",
          message: "Release Date must not be earlier than the current date.",
        });
      }
    }

    // 0b. Edit mode: a changed date, even a passed one being rescheduled,
    // must be in the future (the server applies the same rule)
    if (isEditMode) {
      const now = new Date();
      for (const keyDate of keyDateDescriptions) {
        const field = keyDate.key as KeyDateField;
        const value = toLocalDate(step3Data?.[field]);
        const original = toLocalDate(defaultValues?.step3?.[field]);
        if (value && value.getTime() !== original?.getTime() && value <= now) {
          errors.push({ field, message: `${keyDate.name} must be in the future.` });
        }
      }
    }

    // 1. All dates must be after release date
    if (releaseDate) {
      // deadline_date >= release_date
      if (deadlineDate && deadlineDate < releaseDate) {
        errors.push({
          field: "tender_bid_submission_deadline",
          message: "Bid Submission Deadline must not be earlier than the Release Date.",
        });
      }

      // query_start_date > release_date
      if (queryStartDate && queryStartDate <= releaseDate) {
        errors.push({
          field: "tender_query_deadline",
          message: "Query Submission Deadline must be after the Release Date.",
        });
      }

      // query_end_date > release_date
      if (queryEndDate && queryEndDate <= releaseDate) {
        errors.push({
          field: "tender_query_response_date",
          message: "Query Response Date must be after the Release Date.",
        });
      }

      // technical_date > release_date
      if (technicalDate && technicalDate <= releaseDate) {
        errors.push({
          field: "tender_technical_bid_opening",
          message: "Technical Bid Opening must be after the Release Date.",
        });
      }

      // financial_date > release_date
      if (financialDate && financialDate <= releaseDate) {
        errors.push({
          field: "tender_financial_bid_opening",
          message: "Financial Bid Opening must be after the Release Date.",
        });
      }
    }

    // 2. Query Period Validation
    // query_start_date < query_end_date
    if (queryStartDate && queryEndDate) {
      if (queryStartDate >= queryEndDate) {
        errors.push({
          field: "tender_query_deadline",
          message: "Query Submission Deadline must be earlier than the Query Response Date.",
        });
      }
    }

    // query_start_date ≤ deadline_date
    if (queryStartDate && deadlineDate) {
      if (queryStartDate > deadlineDate) {
        errors.push({
          field: "tender_query_deadline",
          message: "Query Submission Deadline must be on or before the Bid Submission Deadline.",
        });
      }
    }

    // query_end_date ≤ deadline_date
    if (queryEndDate && deadlineDate) {
      if (queryEndDate > deadlineDate) {
        errors.push({
          field: "tender_query_response_date",
          message: "Query Response Date must be on or before the Bid Submission Deadline.",
        });
      }
    }

    // 3. Post-Deadline Dates Validation
    // technical_date > deadline_date
    if (technicalDate && deadlineDate) {
      if (technicalDate <= deadlineDate) {
        errors.push({
          field: "tender_technical_bid_opening",
          message: "Technical Bid Opening must be later than the Bid Submission Deadline.",
        });
      }
    }

    // financial_date > deadline_date
    if (financialDate && deadlineDate) {
      if (financialDate <= deadlineDate) {
        errors.push({
          field: "tender_financial_bid_opening",
          message: "Financial Bid Opening must be later than the Bid Submission Deadline.",
        });
      }
    }

    return errors;
  };

  // Handle time change for a specific date field using date-fns
  const handleTimeChange = (key: KeyDateField, timeString: string) => {
    const currentValue = step3Data?.[key];
    if (!timeString) return;

    const [hours, minutes] = timeString.split(":").map(Number);

    // Get the base date or use today if no date is set
    const baseDate = toLocalDate(currentValue) || new Date();

    // Create a new date with the same year, month, day but new hours and minutes
    // This ensures we're setting the local time correctly
    const newDateTime = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hours,
      minutes,
      0,
      0
    );

    setValue(`step3.${key}`, newDateTime, { shouldValidate: true });
  };

  // Get time string from date using native Date methods for local time
  const getTimeFromDate = (value: Date | string | null | undefined): string => {
    const date = toLocalDate(value);
    if (!date) return "00:00";

    // Use native getHours and getMinutes for local time
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  // Get validation error for a specific field
  const getFieldError = (fieldKey: string): string | undefined => {
    const error = dateValidationErrors.find((e) => e.field === fieldKey);
    return error?.message;
  };

  const handleNextBtn = async () => {
    // First trigger react-hook-form validation for required fields
    const isFormValid = await trigger("step3");

    // Then run custom date constraint validations
    const dateErrors = validateDates();
    setDateValidationErrors(dateErrors);

    // Set form errors for each date validation error
    dateErrors.forEach((error) => {
      setError(`step3.${error.field}`, {
        type: "manual",
        message: error.message,
      });
    });

    // Only proceed if both validations pass
    if (isFormValid && dateErrors.length === 0) {
      clearErrors("step3");
      setDateValidationErrors([]);
      setActive(3);
    }
  };

  return (
    <InfoCard
      title='Key Tender Dates'
      information='Define the timeline for your tender process'
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
        <div className='p-4 bg-primary/5 rounded-md border border-primary/20 flex items-start'>
          <HelpCircle
            size={20}
            className='text-primary mr-3 mt-0.5 flex-shrink-0'
          />
          <div className='text-xs'>
            <h3 className=' font-medium text-primary mb-1'>
              Important Timeline Information
            </h3>
            <p className=' text-primary'>
              Setting clear dates ensures vendors understand the timeline.
              Accuracy is essential.
            </p>
          </div>
        </div>

        {/* Display validation errors summary */}
        {dateValidationErrors.length > 0 && (
          <div className='p-4 bg-red-50 rounded-md border border-red-200 flex items-start'>
            <AlertCircle
              size={20}
              className='text-red-500 mr-3 mt-0.5 flex-shrink-0'
            />
            <div className='text-xs'>
              <h3 className='font-medium text-red-700 mb-2'>
                Date Validation Errors
              </h3>
              <ul className='list-disc list-inside text-red-600 space-y-1'>
                {dateValidationErrors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {keyDateDescriptions.map((keyDate, i) => {
            const lockedNote = lockedDates[keyDate.key as KeyDateField];
            if (lockedNote) {
              const lockedDate = toLocalDate(
                step3Data?.[keyDate.key as KeyDateField]
              );
              return (
                <div
                  key={i}
                  className='bg-gray-50 border rounded-md border-gray-200'>
                  <div className='py-3 px-4 justify-between flex items-center gap-2 bg-gray-100'>
                    <span className='flex gap-2 items-center'>
                      <h3 className='text-xs font-medium text-gray-800'>
                        {keyDate.name}
                      </h3>
                    </span>
                    <Clock size={16} className='text-gray-800' />
                  </div>
                  <div className='p-4'>
                    <p className='text-xs text-muted-foreground mb-2'>
                      {lockedNote}
                    </p>
                    <p className='text-sm font-medium text-gray-900'>
                      {lockedDate
                        ? format(
                            lockedDate,
                            keyDate.requiresTime
                              ? "PPP 'at' HH:mm 'hrs'"
                              : "PPP"
                          )
                        : "Not set"}
                    </p>
                  </div>
                </div>
              );
            }

            const fieldName = `step3.${keyDate.key}` as `step3.${KeyDateField}`;
            const fieldError = getFieldError(keyDate.key);

            return (
              <div
                key={i}
                className={cn(
                  'bg-gray-50 border rounded-md',
                  fieldError ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                )}>
                <div className={cn(
                  'py-3 px-4 justify-between flex items-center gap-2',
                  fieldError ? 'bg-red-100' : 'bg-gray-100'
                )}>
                  <span className='flex gap-2 items-center'>
                    <h3 className={cn(
                      'text-xs font-medium',
                      fieldError ? 'text-red-800' : 'text-gray-800'
                    )}>
                      {keyDate.name}
                    </h3>
                  </span>
                  {keyDate.requiresTime && (
                    <Clock
                      size={16}
                      className={fieldError ? 'text-red-800' : 'text-gray-800'}
                    />
                  )}
                </div>

                <div className='p-4'>
                  <div className='flex flex-col gap-3'>
                    <FormField
                      control={control}
                      name={fieldName}
                      rules={{ required: `${keyDate.name} is required` }}
                      render={({ field }) => (
                        <FormItem className='space-y-2'>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant='outline'
                                  className={cn(
                                    inputStyle,
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                    fieldError && "border-red-300 focus:ring-red-500"
                                  )}>
                                  {field.value ? (
                                    format(
                                      toLocalDate(field.value) || new Date(),
                                      keyDate.requiresTime
                                        ? "PPP 'at' HH:mm 'hrs'"
                                        : "PPP"
                                    )
                                  ) : (
                                    <span>
                                      {keyDate.requiresTime
                                        ? "Select date and time"
                                        : "Select a date"}
                                    </span>
                                  )}
                                  <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-auto p-0'
                              align='start'>
                              <Calendar
                                mode='single'
                                selected={
                                  field.value
                                    ? toLocalDate(field.value) || undefined
                                    : undefined
                                }
                                onSelect={(date) => {
                                  if (date) {
                                    // Preserve time if already set, otherwise default to 00:00
                                    if (field.value) {
                                      const existingDate = toLocalDate(field.value);
                                      if (existingDate) {
                                        // Create new date preserving the time from existing date
                                        const newDate = new Date(
                                          date.getFullYear(),
                                          date.getMonth(),
                                          date.getDate(),
                                          existingDate.getHours(),
                                          existingDate.getMinutes(),
                                          0,
                                          0
                                        );
                                        field.onChange(newDate);
                                        return;
                                      }
                                    }
                                  }
                                  field.onChange(date || null);
                                }}
                                initialFocus={false}
                              />
                              {/* Time picker below calendar for fields that require time */}
                              {keyDate.requiresTime && (
                                <div className='border-t p-3'>
                                  <div className='flex items-center gap-2'>
                                    <Clock
                                      size={16}
                                      className='text-gray-500'
                                    />
                                    <span className='text-sm font-medium text-gray-700'>
                                      Time:
                                    </span>
                                    <Input
                                      type='time'
                                      value={getTimeFromDate(field.value)}
                                      onChange={(e) => {
                                        if (field.value) {
                                          handleTimeChange(
                                            keyDate.key as KeyDateField,
                                            e.target.value
                                          );
                                        } else {
                                          // If no date selected, create a new date with the time
                                          const now = new Date();
                                          const [hours, minutes] =
                                            e.target.value
                                              .split(":")
                                              .map(Number);
                                          const newDate = new Date(
                                            now.getFullYear(),
                                            now.getMonth(),
                                            now.getDate(),
                                            hours,
                                            minutes,
                                            0,
                                            0
                                          );
                                          field.onChange(newDate);
                                        }
                                      }}
                                      className='w-auto'
                                    />
                                    <span className='text-sm text-gray-500'>
                                      hrs
                                    </span>
                                  </div>
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='flex items-start gap-2 mt-1'>
                      <InfoIcon
                        size={14}
                        className='text-gray-400 mt-0.5 flex-shrink-0'
                      />
                      <p className='text-gray-600 text-xs'>
                        {keyDate.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className='flex justify-between mt-8'>
          <CustomButton
            btnName='Previous Step'
            onClick={() => setActive(1)}
            variant='secondary'
            LeftIcon={ArrowLeft}
          />

          <CustomButton
            btnName='Continue to Vendor Selection'
            variant='primary'
            RightIcon={ArrowRight}
            onClick={handleNextBtn}
          />
        </div>
      </div>
    </InfoCard>
  );
};

export default KeyDates;
