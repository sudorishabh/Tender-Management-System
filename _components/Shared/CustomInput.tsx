import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/_components/ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Control,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";

interface SelectOption {
  label: string;
  value: string;
}

interface Props<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  Label?: string;
  LabelIcon?: React.JSXElementConstructor<React.SVGProps<SVGSVGElement>>;
  fieldName: FieldPath<TFieldValues>;
  placeholder?: string;
  optional?: boolean;
  type?: string;
  inputIconButton?: {
    icon: React.JSXElementConstructor<React.SVGProps<SVGSVGElement>>;
    onClick: () => void;
  };
  onChange?: (value: string) => void;
  disabled?: boolean;
  description?: string;
  /**
   * Optional function to format the value for display (e.g. add commas).
   * If provided, the displayed input value will be the formatted value and
   * the raw value will be reconstructed using `parseValue` on change.
   */
  formatDisplay?: (value: any) => string;
  /**
   * Optional function to parse the display value back into the stored value.
   */
  parseValue?: (displayValue: string) => any;
  // Select-related props
  isSelect?: boolean;
  selectOptions?: SelectOption[];
  isTextArea?: boolean;
  /** Caps the input length and shows a character counter */
  maxLength?: number;
  // Validation rules
  rules?: RegisterOptions<TFieldValues>;
}

const CustomInput = <TFieldValues extends FieldValues = FieldValues>({
  control,
  fieldName,
  Label,
  LabelIcon,
  placeholder,
  optional,
  type,
  inputIconButton,
  onChange,
  disabled,
  description,
  isSelect,
  selectOptions,
  isTextArea,
  formatDisplay,
  parseValue,
  maxLength,
  rules,
}: Props<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={fieldName}
      rules={rules}
      render={({ field }) => (
        <FormItem className='space-y-2'>
          <FormLabel className='text-xs font-medium text-neutral-700 flex items-center gap-2'>
            {LabelIcon && <LabelIcon className='size-3.5 text-neutral-400' />}
            <span>{Label}</span>
            {optional && (
              <span className='text-xs font-normal text-neutral-400'>
                (Optional)
              </span>
            )}
          </FormLabel>
          <FormControl>
            {isSelect && selectOptions ? (
              <Select
                key={`${fieldName}-${field.value || "empty"}`}
                value={field.value || ""}
                onValueChange={(value) => {
                  field.onChange(value);
                  onChange?.(value);
                }}
                disabled={disabled}>
                <SelectTrigger
                  className={`h-[2.25rem] px-4 text-sm bg-neutral-50 border-neutral-200 rounded-lg placeholder:text-neutral-400 transition-all duration-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus-visible:ring-sky-300/20 focus-visible:ring-2 hover:border-neutral-300 ${disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}>
                  <SelectValue
                    placeholder={placeholder ?? `Select ${Label?.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : isTextArea ? (
              <textarea
                autoComplete='off'
                className={`w-full min-h-[6rem] px-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg placeholder:text-neutral-400 transition-all duration-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus-visible:ring-sky-300/20 focus-visible:ring-2 focus:outline-none hover:border-neutral-300 resize-none ${disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                placeholder={placeholder ?? `Enter ${Label?.toLowerCase()}`}
                disabled={disabled}
                maxLength={maxLength}
                {...field}
                onChange={(e) => {
                  // textarea uses raw values, keep behavior
                  field.onChange(e);
                  onChange?.(e.target.value);
                }}
              />
            ) : (
              <div className='relative'>
                <Input
                  type={type ?? "text"}
                  className={`h-[2.25rem] px-4 text-sm bg-neutral-50 border-neutral-200 rounded-lg placeholder:text-neutral-400 transition-all duration-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus-visible:ring-sky-300/20 focus-visible:ring-2 hover:border-neutral-300 ${inputIconButton ? "pr-10" : ""
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder={placeholder ?? `Enter ${Label?.toLowerCase()}`}
                  disabled={disabled}
                  maxLength={maxLength}
                  // If formatting is provided, show the formatted value but
                  // store the raw value using parseValue on change.
                  value={
                    formatDisplay ? formatDisplay(field.value) : field.value
                  }
                  onChange={(e) => {
                    const display = e.target.value;
                    const valueToStore = parseValue
                      ? parseValue(display)
                      : display;
                    field.onChange(valueToStore);
                    onChange?.(valueToStore);
                  }}
                />
                {inputIconButton && (
                  <button
                    type='button'
                    onClick={inputIconButton.onClick}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-500'>
                    <inputIconButton.icon className='size-4' />
                  </button>
                )}
              </div>
            )}
          </FormControl>
          {description && (
            <p className='text-xs text-neutral-500'>{description}</p>
          )}
          {maxLength !== undefined && (
            <p
              className={`text-right text-xs tabular-nums ${String(field.value ?? "").length >= maxLength
                ? "text-amber-600"
                : "text-neutral-400"
                }`}>
              {String(field.value ?? "").length}/{maxLength}
            </p>
          )}
          <FormMessage className='text-xs' />
        </FormItem>
      )}
    />
  );
};

export default CustomInput;
