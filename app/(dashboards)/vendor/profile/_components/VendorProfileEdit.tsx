"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import type { VendorProfileDetails } from "../../_components/profileCompleteness";

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

interface VendorProfileEditProps {
  data: VendorProfileDetails;
  onCancel: () => void;
  onSuccess: () => void;
}

const VendorProfileEdit: React.FC<VendorProfileEditProps> = ({
  data,
  onCancel,
  onSuccess,
}) => {
  const { user, business } = data;

  const updateProfileMutation = trpc.vendor.updateMyProfile.useMutation();
  const utils = trpc.useUtils();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    },
  });

  useEffect(() => {
    form.reset({
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
  }, [data, form, user, business]);

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
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Edit Profile</h1>
          <p className='text-gray-500 mt-1'>
            Update your vendor profile information
          </p>
        </div>
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
                  <div className='p-2 bg-primary rounded-lg'>
                    <User className='h-5 w-5 text-primary' />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='user.full_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter your full name'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='user.vendor_contact'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Contact Number <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter contact number'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='user.vendor_alt_contact'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter alternate contact'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='pt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg'>
                  <p>
                    <strong>Email:</strong> {user.email}
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
                  <div className='p-2 bg-primary rounded-lg'>
                    <Building className='h-5 w-5 text-primary' />
                  </div>
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='business.biz_legal_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter business legal name'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='business.biz_trade_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter business trade name'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                          <SelectTrigger className='h-11'>
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
                  <FormField
                    control={form.control}
                    name='business.biz_established_year'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Established Year</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., 2010'
                            {...field}
                            className='h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='business.biz_employee_count'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Count</FormLabel>
                        <FormControl>
                          <Input
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

                <FormField
                  control={form.control}
                  name='business.biz_gst_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter GST number'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='business.biz_3_year_turnover'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3 Year Turnover</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., 10,00,000'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Business Contact Card */}
            <Card className='bg-white shadow-sm border border-gray-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                  <div className='p-2 bg-primary rounded-lg'>
                    <Building className='h-5 w-5 text-primary' />
                  </div>
                  Business Contact
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='business.biz_email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='Enter business email'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='business.biz_phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter business phone'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='business.biz_website'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://www.example.com'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Business Address Card */}
            <Card className='bg-white shadow-sm border border-gray-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                  <div className='p-2 bg-primary rounded-lg'>
                    <MapPin className='h-5 w-5 text-primary' />
                  </div>
                  Business Address
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='business.biz_addr_line1'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter address line 1'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='business.biz_addr_line2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter address line 2'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='business.biz_locality'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Locality</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter locality'
                            {...field}
                            className='h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='business.biz_city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter city'
                            {...field}
                            className='h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='business.biz_state'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter state'
                            {...field}
                            className='h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='business.biz_pin_code'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter PIN code'
                            {...field}
                            className='h-11'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='business.biz_country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter country'
                          {...field}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
