"use client";
import React, { useEffect } from "react";
import { useForm, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/_components/ui/card";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/_components/ui/form";
import { Save, X, User, Building, MapPin, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { isApiError } from "@/utils/isApiError";
import { businessClassification } from "@/lib/constants";
import type {
  ProfileFormField,
  VendorProfileDetails,
} from "../../_components/profileCompleteness";

const formSchema = z.object({
  user: z.object({
    full_name: z.string().min(1, "Full name is required"),
    vendor_contact: z.string().min(1, "Contact number is required"),
    vendor_alt_contact: z.string().optional(),
  }),
  business: z.object({
    biz_legal_name: z.string().optional(),
    biz_trade_name: z.string().min(1, "Trade name is required").optional(),
    biz_classification: z.string().optional(),
    biz_established_year: z.string().optional(),
    biz_addr_line1: z.string().optional(),
    biz_addr_line2: z.string().optional(),
    biz_locality: z.string().optional(),
    biz_city: z.string().optional(),
    biz_state: z.string().optional(),
    biz_pin_code: z.string().optional(),
    biz_country: z.string().optional(),
    biz_website: z.string().optional(),
    biz_email: z.string().email("Invalid email").optional().or(z.literal("")),
    biz_phone: z.string().optional(),
    biz_gst_number: z.string().optional(),
    biz_3_year_turnover: z.string().optional(),
    biz_employee_count: z.number().optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

// Form paths that hold plain text values
type TextFieldName = Exclude<
  FieldPath<FormData>,
  "user" | "business" | "business.biz_employee_count"
>;

const toFormValues = ({ user, business }: VendorProfileDetails): FormData => ({
  user: {
    full_name: user.full_name || "",
    vendor_contact: user.vendor_contact || "",
    vendor_alt_contact: user.vendor_alt_contact || "",
  },
  business: {
    biz_legal_name: business?.biz_legal_name || "",
    biz_trade_name: business?.biz_trade_name || "",
    biz_classification: business?.biz_classification || "",
    biz_established_year: business?.biz_established_year || "",
    biz_addr_line1: business?.biz_addr_line1 || "",
    biz_addr_line2: business?.biz_addr_line2 || "",
    biz_locality: business?.biz_locality || "",
    biz_city: business?.biz_city || "",
    biz_state: business?.biz_state || "",
    biz_pin_code: business?.biz_pin_code || "",
    biz_country: business?.biz_country || "",
    biz_website: business?.biz_website || "",
    biz_email: business?.biz_email || "",
    biz_phone: business?.biz_phone || "",
    biz_gst_number: business?.biz_gst_number || "",
    biz_3_year_turnover: business?.biz_3_year_turnover || "",
    biz_employee_count: business?.biz_employee_count || undefined,
  },
});

interface ProfileTextFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "name"> {
  control: Control<FormData>;
  name: TextFieldName;
  label: string;
  required?: boolean;
}

const ProfileTextField = ({
  control,
  name,
  label,
  required = false,
  ...inputProps
}: ProfileTextFieldProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          {label}
          {required && <span className='text-red-500'> *</span>}
        </FormLabel>
        <FormControl>
          <Input
            {...inputProps}
            {...field}
            className='h-11'
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

interface VendorProfileEditProps {
  data: VendorProfileDetails;
  /** Field to focus when the form opens */
  focusField?: ProfileFormField;
  onCancel: () => void;
  onSuccess: () => void;
}

const VendorProfileEdit: React.FC<VendorProfileEditProps> = ({
  data,
  focusField,
  onCancel,
  onSuccess,
}) => {
  const updateProfileMutation = trpc.vendor.updateMyProfile.useMutation();
  const utils = trpc.useUtils();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(data),
  });

  useEffect(() => {
    form.reset(toFormValues(data));
  }, [data, form]);

  useEffect(() => {
    if (focusField) form.setFocus(focusField);
  }, [focusField, form]);

  const onSubmit = async (formData: FormData) => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success("Profile updated successfully");
      utils.vendor.getMyProfile.invalidate();
      onSuccess();
    } catch (error) {
      if (isApiError(error)) {
        toast.error(error.data?.message || "Failed to update profile");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className='space-y-6'>
      {/* Actions (the page header shows the title) */}
      <div className='flex justify-end'>
        <div className='flex items-center gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            className='border-gray-200'>
            <X className='h-4 w-4 mr-2' />
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateProfileMutation.isPending}
            className='bg-primary hover:bg-primary text-white'>
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='h-4 w-4 mr-2' />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Personal Information Card */}
            <Card className='bg-white shadow-sm border border-gray-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                  <div className='p-2 bg-primary/15 rounded-lg'>
                    <User className='h-5 w-5 text-primary' />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <ProfileTextField
                  control={form.control}
                  name='user.full_name'
                  label='Full Name'
                  required
                  placeholder='Enter your full name'
                />

                <ProfileTextField
                  control={form.control}
                  name='user.vendor_contact'
                  label='Contact Number'
                  required
                  placeholder='Enter contact number'
                />

                <ProfileTextField
                  control={form.control}
                  name='user.vendor_alt_contact'
                  label='Alternate Contact'
                  placeholder='Enter alternate contact'
                />

                <div className='pt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg'>
                  <p>
                    <strong>Email:</strong> {data.user.email}
                  </p>
                  <p className='text-xs mt-1'>
                    Contact support to change your email address.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Business Information Card */}
            <Card className='bg-white shadow-sm border border-gray-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                  <div className='p-2 bg-primary/15 rounded-lg'>
                    <Building className='h-5 w-5 text-primary' />
                  </div>
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <ProfileTextField
                  control={form.control}
                  name='business.biz_legal_name'
                  label='Legal Name'
                  placeholder='Enter business legal name'
                />

                <ProfileTextField
                  control={form.control}
                  name='business.biz_trade_name'
                  label='Trade Name'
                  required
                  placeholder='Enter business trade name'
                />

                <FormField
                  control={form.control}
                  name='business.biz_classification'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classification</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger
                            ref={field.ref}
                            className='h-11'>
                            <SelectValue placeholder='Select classification' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessClassification.map((classification) => (
                            <SelectItem
                              key={classification}
                              value={classification}>
                              {classification}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <ProfileTextField
                    control={form.control}
                    name='business.biz_established_year'
                    label='Established Year'
                    placeholder='e.g., 2010'
                  />

                  <FormField
                    control={form.control}
                    name='business.biz_employee_count'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Count</FormLabel>
                        <FormControl>
                          <Input
                            ref={field.ref}
                            type='number'
                            placeholder='e.g., 50'
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                            className='h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <ProfileTextField
                  control={form.control}
                  name='business.biz_gst_number'
                  label='GST Number'
                  placeholder='Enter GST number'
                />

                <ProfileTextField
                  control={form.control}
                  name='business.biz_3_year_turnover'
                  label='3 Year Turnover'
                  placeholder='e.g., 10,00,000'
                />
              </CardContent>
            </Card>

            {/* Business Contact Card */}
            <Card className='bg-white shadow-sm border border-gray-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                  <div className='p-2 bg-primary/15 rounded-lg'>
                    <Building className='h-5 w-5 text-primary' />
                  </div>
                  Business Contact
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <ProfileTextField
                  control={form.control}
                  name='business.biz_email'
                  label='Business Email'
                  type='email'
                  placeholder='Enter business email'
                />

                <ProfileTextField
                  control={form.control}
                  name='business.biz_phone'
                  label='Business Phone'
                  placeholder='Enter business phone'
                />

                <ProfileTextField
                  control={form.control}
                  name='business.biz_website'
                  label='Website'
                  placeholder='https://www.example.com'
                />
              </CardContent>
            </Card>

            {/* Business Address Card */}
            <Card className='bg-white shadow-sm border border-gray-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                  <div className='p-2 bg-primary/15 rounded-lg'>
                    <MapPin className='h-5 w-5 text-primary' />
                  </div>
                  Business Address
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <ProfileTextField
                  control={form.control}
                  name='business.biz_addr_line1'
                  label='Address Line 1'
                  placeholder='Enter address line 1'
                />

                <ProfileTextField
                  control={form.control}
                  name='business.biz_addr_line2'
                  label='Address Line 2'
                  placeholder='Enter address line 2'
                />

                <div className='grid grid-cols-2 gap-4'>
                  <ProfileTextField
                    control={form.control}
                    name='business.biz_locality'
                    label='Locality'
                    placeholder='Enter locality'
                  />

                  <ProfileTextField
                    control={form.control}
                    name='business.biz_city'
                    label='City'
                    placeholder='Enter city'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <ProfileTextField
                    control={form.control}
                    name='business.biz_state'
                    label='State'
                    placeholder='Enter state'
                  />

                  <ProfileTextField
                    control={form.control}
                    name='business.biz_pin_code'
                    label='PIN Code'
                    placeholder='Enter PIN code'
                  />
                </div>

                <ProfileTextField
                  control={form.control}
                  name='business.biz_country'
                  label='Country'
                  placeholder='Enter country'
                />
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons (Mobile) */}
          <div className='flex sm:hidden flex-col gap-3 pt-4'>
            <Button
              type='submit'
              disabled={updateProfileMutation.isPending}
              className='w-full bg-primary hover:bg-primary text-white h-12'>
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              className='w-full border-gray-200 h-12'>
              <X className='h-4 w-4 mr-2' />
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default VendorProfileEdit;
