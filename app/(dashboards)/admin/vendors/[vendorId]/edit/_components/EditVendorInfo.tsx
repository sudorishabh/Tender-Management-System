import React, { useEffect, FC } from "react";
import {
  Save,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  User,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  Globe,
  FileText,
  Hash,
  Calendar,
  Users,
  MapPinned,
  Building2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/_components/ui/card";
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
import { trpc } from "@/lib/trpc";
import { isApiError } from "@/utils/isApiError";
import { VENDOR_STATUS } from "@/enum/vendorStatus.enum";
import CustomInput from "@/_components/Shared/CustomInput";
import { businessClassification } from "@/lib/constants";

interface UserData {
  user_id: number | null;
  email: string | null;
  role: "vendor" | "admin" | "super_admin" | null;
  created_at: Date | null;
  full_name: string | null;
  vendor_id: number | null;
  vendor_code: string;
  vendor_source: "direct" | "invite" | null;
  vendor_status: "pending" | "rejected" | "approved";
  vendor_contact: string | null;
  vendor_alt_contact: string | null;
  vendor_pan_number: string | null;
  vendor_pan_doc_key: string | null;
  vendor_image_key: string | null;
  vendor_adhar_doc_key: string | null;
  vendor_rejection_reason: string | null;
  vendor_updated_at: Date | null;
}

interface BusinessData {
  business_id: number;
  biz_legal_name: string | null;
  biz_trade_name: string | null;
  biz_classification: string | null;
  biz_reg_number: string | null;
  biz_reg_doc_key: string | null;
  biz_established_year: string | null;
  biz_addr_line1: string | null;
  biz_addr_line2: string | null;
  biz_locality: string | null;
  biz_city: string | null;
  biz_pin_code: string | null;
  biz_country: string | null;
  biz_state: string | null;
  biz_gst_number: string | null;
  biz_gst_doc_key: string | null;
  biz_bank_doc_key: string | null;
  biz_msme_cert_doc_key: string | null;
  biz_website: string | null;
  biz_email: string | null;
  biz_phone: string | null;
  biz_3_year_turnover: string | null;
  biz_employee_count: number | null;
  biz_created_at: Date | null;
  biz_updated_at: Date | null;
}

interface Props {
  user: UserData;
  business: BusinessData | null;
  vendorId: string;
}

// Form schema with Zod validation
const formSchema = z.object({
  user: z.object({
    full_name: z.string().min(1, "Full name is required"),
    vendor_status: z.nativeEnum(VENDOR_STATUS),
    vendor_contact: z.string().min(1, "Contact number is required"),
    vendor_alt_contact: z.string().optional(),
    vendor_pan_number: z.string().optional(),
  }),
  business: z.object({
    biz_legal_name: z.string().min(1, "Legal name is required"),
    biz_trade_name: z.string().optional(),
    biz_classification: z.string().optional(),
    biz_reg_number: z.string().optional(),
    biz_established_year: z.string().optional(),
    biz_addr_line1: z.string().optional(),
    biz_addr_line2: z.string().optional(),
    biz_locality: z.string().optional(),
    biz_city: z.string().optional(),
    biz_pin_code: z.string().optional(),
    biz_country: z.string().optional(),
    biz_state: z.string().optional(),
    biz_gst_number: z.string().optional(),
    biz_website: z.string().optional(),
    biz_email: z.string().optional(),
    biz_phone: z.string().optional(),
    biz_3_year_turnover: z.string().optional(),
    biz_employee_count: z.number().nullable().optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

// Options for classification select
const classificationOptions = businessClassification.map((c) => ({
  label: c,
  value: c,
}));

// Options for vendor status select
const vendorStatusOptions = [
  {
    label: "Pending",
    value: VENDOR_STATUS.PENDING,
    icon: Clock,
    color: "text-amber-500",
  },
  {
    label: "Approved",
    value: VENDOR_STATUS.APPROVED,
    icon: CheckCircle,
    color: "text-emerald-500",
  },
  {
    label: "Rejected",
    value: VENDOR_STATUS.REJECTED,
    icon: XCircle,
    color: "text-red-500",
  },
];

const EditVendorInfo: FC<Props> = ({ user, business, vendorId }) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const updateVendorMutation = trpc.vendor.updateByAdmin.useMutation({
    onSuccess: () => {
      utils.vendor.getDetails.invalidate(vendorId);
    },
  });
  const isSubmitting = updateVendorMutation.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: {
        full_name: "",
        vendor_status: VENDOR_STATUS.PENDING,
        vendor_contact: "",
        vendor_alt_contact: "",
        vendor_pan_number: "",
      },
      business: {
        biz_legal_name: "",
        biz_trade_name: "",
        biz_classification: "",
        biz_reg_number: "",
        biz_established_year: "",
        biz_addr_line1: "",
        biz_addr_line2: "",
        biz_locality: "",
        biz_city: "",
        biz_pin_code: "",
        biz_country: "",
        biz_state: "",
        biz_gst_number: "",
        biz_website: "",
        biz_email: "",
        biz_phone: "",
        biz_3_year_turnover: "",
        biz_employee_count: null,
      },
    },
  });

  useEffect(() => {
    if (user && business) {
      form.reset({
        user: {
          full_name: user.full_name || "",
          vendor_status:
            (user.vendor_status as VENDOR_STATUS) || VENDOR_STATUS.PENDING,
          vendor_contact: user.vendor_contact || "",
          vendor_alt_contact: user.vendor_alt_contact || "",
          vendor_pan_number: user.vendor_pan_number || "",
        },
        business: {
          biz_legal_name: business.biz_legal_name || "",
          biz_trade_name: business.biz_trade_name || "",
          biz_classification: business.biz_classification || "",
          biz_reg_number: business.biz_reg_number || "",
          biz_established_year: business.biz_established_year || "",
          biz_addr_line1: business.biz_addr_line1 || "",
          biz_addr_line2: business.biz_addr_line2 || "",
          biz_locality: business.biz_locality || "",
          biz_city: business.biz_city || "",
          biz_pin_code: business.biz_pin_code || "",
          biz_country: business.biz_country || "",
          biz_state: business.biz_state || "",
          biz_gst_number: business.biz_gst_number || "",
          biz_website: business.biz_website || "",
          biz_email: business.biz_email || "",
          biz_phone: business.biz_phone || "",
          biz_3_year_turnover: business.biz_3_year_turnover || "",
          biz_employee_count: null,
        },
      });
    }
  }, [user, business, form]);

  async function onSubmit(formData: FormData) {
    try {
      const updatedUserData = {
        user: formData.user,
        business: formData.business,
        vendor_id: vendorId,
      };

      const result = await updateVendorMutation.mutateAsync(updatedUserData);
      if (result.success) {
        toast.success("Vendor updated successfully");
      }
    } catch (error) {
      if (isApiError(error)) {
        toast.error(error.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8'>
      <div className='max-w-4xl mx-auto'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8'>
            {/* Vendor Profile Section */}
            <Card className='bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-900'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <User className='h-5 w-5 text-primary' />
                  </div>
                  Vendor Profile
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 pb-6'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <CustomInput
                    control={form.control}
                    fieldName='user.full_name'
                    Label='Full Name'
                    LabelIcon={User}
                    placeholder='Enter full name'
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='user.vendor_contact'
                    Label='Contact Number'
                    LabelIcon={Phone}
                    type='tel'
                    placeholder='Enter contact number'
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='user.vendor_alt_contact'
                    Label='Alternate Contact'
                    LabelIcon={Phone}
                    type='tel'
                    placeholder='Enter alternate contact'
                    optional
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='user.vendor_pan_number'
                    Label='PAN Number'
                    LabelIcon={FileText}
                    placeholder='e.g., ABCDE1234F'
                    optional
                  />

                  {/* Vendor Status Dropdown */}
                  <div className='lg:col-span-2'>
                    <FormField
                      control={form.control}
                      name='user.vendor_status'
                      render={({ field }) => (
                        <FormItem className='space-y-2'>
                          <FormLabel className='text-xs font-medium text-neutral-700 flex items-center gap-2'>
                            <CheckCircle className='size-3.5 text-neutral-400' />
                            <span>Vendor Status</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}>
                              <SelectTrigger className='h-[2.25rem] px-4 text-sm bg-neutral-50 border-neutral-200 rounded-lg placeholder:text-neutral-400 transition-all duration-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus-visible:ring-sky-300/20 focus-visible:ring-2 hover:border-neutral-300'>
                                <SelectValue placeholder='Select status' />
                              </SelectTrigger>
                              <SelectContent>
                                {vendorStatusOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}>
                                    <div className='flex items-center gap-2'>
                                      <option.icon
                                        className={`h-4 w-4 ${option.color}`}
                                      />
                                      {option.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className='text-xs' />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Information Section */}
            <Card className='bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-900'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <Building className='h-5 w-5 text-primary' />
                  </div>
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 pb-6'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <CustomInput
                    control={form.control}
                    fieldName='business.biz_legal_name'
                    Label='Legal Name'
                    LabelIcon={Building2}
                    placeholder='Enter legal business name'
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='business.biz_trade_name'
                    Label='Trade Name'
                    LabelIcon={Building}
                    placeholder='Enter trade name'
                    optional
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='business.biz_classification'
                    Label='Classification'
                    LabelIcon={FileText}
                    isSelect
                    selectOptions={classificationOptions}
                    placeholder='Select classification'
                    optional
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='business.biz_reg_number'
                    Label='Registration Number'
                    LabelIcon={Hash}
                    placeholder='Company registration number'
                    optional
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='business.biz_established_year'
                    Label='Established Year'
                    LabelIcon={Calendar}
                    placeholder='e.g., 2010'
                    optional
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='business.biz_website'
                    Label='Website'
                    LabelIcon={Globe}
                    type='url'
                    placeholder='https://example.com'
                    optional
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='business.biz_email'
                    Label='Company Email'
                    LabelIcon={Mail}
                    type='email'
                    placeholder='company@example.com'
                    optional
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='business.biz_phone'
                    Label='Company Phone'
                    LabelIcon={Phone}
                    type='tel'
                    placeholder='Enter company phone'
                    optional
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tax & Financial Information Section */}
            <Card className='bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-900'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <DollarSign className='h-5 w-5 text-primary' />
                  </div>
                  Tax & Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 pb-6'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <CustomInput
                    control={form.control}
                    fieldName='business.biz_gst_number'
                    Label='GST Number'
                    LabelIcon={FileText}
                    placeholder='e.g., 22AAAAA0000A1Z5'
                    optional
                  />

                  <CustomInput
                    control={form.control}
                    fieldName='business.biz_3_year_turnover'
                    Label='3 Year Turnover'
                    LabelIcon={DollarSign}
                    placeholder='e.g., 10,00,000'
                    optional
                  />

                  <FormField
                    control={form.control}
                    name='business.biz_employee_count'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel className='text-xs font-medium text-neutral-700 flex items-center gap-2'>
                          <Users className='size-3.5 text-neutral-400' />
                          <span>Employee Count</span>
                          <span className='text-xs font-normal text-neutral-400'>
                            (Optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <input
                            type='number'
                            className='w-full h-[2.25rem] px-4 text-sm bg-neutral-50 border border-neutral-200 rounded-lg placeholder:text-neutral-400 transition-all duration-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus-visible:ring-sky-300/20 focus-visible:ring-2 focus:outline-none hover:border-neutral-300'
                            placeholder='e.g., 50'
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === "" ? null : Number(val));
                            }}
                          />
                        </FormControl>
                        <FormMessage className='text-xs' />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Address Section */}
            <Card className='bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-900'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <MapPin className='h-5 w-5 text-primary' />
                  </div>
                  Business Address
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 pb-6'>
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <CustomInput
                      control={form.control}
                      fieldName='business.biz_addr_line1'
                      Label='Address Line 1'
                      LabelIcon={MapPin}
                      placeholder='Street address'
                      optional
                    />

                    <CustomInput
                      control={form.control}
                      fieldName='business.biz_addr_line2'
                      Label='Address Line 2'
                      LabelIcon={MapPin}
                      placeholder='Apartment, suite, etc.'
                      optional
                    />
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                    <CustomInput
                      control={form.control}
                      fieldName='business.biz_locality'
                      Label='Locality'
                      LabelIcon={MapPinned}
                      placeholder='Locality'
                      optional
                    />

                    <CustomInput
                      control={form.control}
                      fieldName='business.biz_city'
                      Label='City'
                      LabelIcon={Building}
                      placeholder='City'
                      optional
                    />

                    <CustomInput
                      control={form.control}
                      fieldName='business.biz_state'
                      Label='State'
                      LabelIcon={MapPinned}
                      placeholder='State'
                      optional
                    />

                    <CustomInput
                      control={form.control}
                      fieldName='business.biz_pin_code'
                      Label='PIN Code'
                      LabelIcon={Hash}
                      placeholder='PIN Code'
                      optional
                    />
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    <CustomInput
                      control={form.control}
                      fieldName='business.biz_country'
                      Label='Country'
                      LabelIcon={Globe}
                      placeholder='Country'
                      optional
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row justify-between items-center gap-4 pt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push("/admin/vendors")}
                className='w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-6 rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all'>
                <ArrowLeft className='h-4 w-4' />
                <span>Back to Vendors</span>
              </Button>

              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full sm:w-auto h-11 px-8 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                {isSubmitting ? (
                  <>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4' />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditVendorInfo;
