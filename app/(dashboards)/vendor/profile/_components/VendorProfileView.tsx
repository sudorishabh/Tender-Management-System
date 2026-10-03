"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/_components/ui/card";
import { Button } from "@/_components/ui/button";
import { Badge } from "@/_components/ui/badge";
import {
  Mail,
  Phone,
  User,
  Building,
  FileText,
  Calendar,
  MapPin,
  Globe,
  CreditCard,
  Users,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { formatDisplayDate } from "@/utils/dateUtils";
import PdfViewerModal from "@/_components/Shared/PdfViewerModal";
import type { VendorProfileDetails } from "../../_components/profileCompleteness";

interface VendorProfileViewProps {
  data: VendorProfileDetails;
  onEdit: () => void;
}

const VendorProfileView: React.FC<VendorProfileViewProps> = ({
  data,
  onEdit,
}) => {
  const { user, business } = data;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const formatAddress = () => {
    if (!business) return "Not provided";
    const parts = [
      business.biz_addr_line1,
      business.biz_addr_line2,
      business.biz_locality,
      business.biz_city,
      business.biz_state,
      business.biz_pin_code,
      business.biz_country,
    ].filter(Boolean);
    return parts.join(", ") || "Not provided";
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    isLink = false,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
    isLink?: boolean;
  }) => (
    <div className='flex items-start gap-3 py-3 border-b border-gray-100 last:border-0'>
      <div className='p-2 bg-primary/5 rounded-lg flex-shrink-0'>
        <Icon className='h-4 w-4 text-primary' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-xs text-gray-500'>{label}</p>
        {isLink && value ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target='_blank'
            rel='noopener noreferrer'
            className='font-medium text-primary hover:underline flex items-center gap-1'>
            {value}
            <ExternalLink className='h-3 w-3' />
          </a>
        ) : (
          <p className='font-medium text-gray-900'>{value || "Not provided"}</p>
        )}
      </div>
    </div>
  );

  const DocumentButton = ({
    label,
    docKey,
  }: {
    label: string;
    docKey: string | null;
  }) => (
    <div className='flex items-center justify-between py-2'>
      <span className='text-sm text-gray-600'>{label}</span>
      {docKey ? (
        <PdfViewerModal isS3File={true} value={docKey} triggerButton={<Button
          variant='outline'
          size='sm'
          className='text-primary border-primary/20 hover:bg-primary/10'>
          <FileText className='h-4 w-4 mr-1' />
          View
        </Button>} />

      ) : (
        <span className='text-sm text-gray-400'>Not uploaded</span>
      )}
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Header with Edit Button */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My Profile</h1>
          <p className='text-gray-500 mt-1'>
            View and manage your vendor profile information
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Badge className={`${getStatusColor(user.vendor_status)} px-3 py-1`}>
            {user.vendor_status
              ? user.vendor_status.charAt(0).toUpperCase() +
              user.vendor_status.slice(1)
              : "Pending"}
          </Badge>
          <Button
            onClick={onEdit}
            className='bg-primary hover:bg-primary text-white'>
            Edit Profile
          </Button>
        </div>
      </div>

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
          <CardContent className='pt-0'>
            <InfoRow
              icon={User}
              label='Full Name'
              value={user.full_name}
            />
            <InfoRow
              icon={Mail}
              label='Email'
              value={user.email}
            />
            <InfoRow
              icon={Phone}
              label='Contact'
              value={user.vendor_contact}
            />
            <InfoRow
              icon={Phone}
              label='Alternate Contact'
              value={user.vendor_alt_contact}
            />
            <InfoRow
              icon={CreditCard}
              label='PAN Number'
              value={user.vendor_pan_number}
            />
            <InfoRow
              icon={Calendar}
              label='Vendor Code'
              value={user.vendor_code}
            />
            <InfoRow
              icon={Calendar}
              label='Member Since'
              value={formatDisplayDate(user.created_at)}
            />
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
          <CardContent className='pt-0'>
            <InfoRow
              icon={Building}
              label='Legal Name'
              value={business?.biz_legal_name}
            />
            <InfoRow
              icon={Building}
              label='Trade Name'
              value={business?.biz_trade_name}
            />
            <InfoRow
              icon={FileText}
              label='Classification'
              value={business?.biz_classification}
            />
            <InfoRow
              icon={FileText}
              label='Registration Number'
              value={business?.biz_reg_number}
            />
            <InfoRow
              icon={Calendar}
              label='Established Year'
              value={business?.biz_established_year}
            />
            <InfoRow
              icon={CreditCard}
              label='GST Number'
              value={business?.biz_gst_number}
            />
            <InfoRow
              icon={Users}
              label='Employee Count'
              value={business?.biz_employee_count?.toString()}
            />
            <InfoRow
              icon={TrendingUp}
              label='3 Year Turnover'
              value={business?.biz_3_year_turnover}
            />
          </CardContent>
        </Card>

        {/* Contact & Address Card */}
        <Card className='bg-white shadow-sm border border-gray-200'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
              <div className='p-2 bg-primary/15 rounded-lg'>
                <MapPin className='h-5 w-5 text-primary' />
              </div>
              Contact & Address
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <InfoRow
              icon={Mail}
              label='Business Email'
              value={business?.biz_email}
            />
            <InfoRow
              icon={Phone}
              label='Business Phone'
              value={business?.biz_phone}
            />
            <InfoRow
              icon={Globe}
              label='Website'
              value={business?.biz_website}
              isLink
            />
            <InfoRow
              icon={MapPin}
              label='Address'
              value={formatAddress()}
            />
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card className='bg-white shadow-sm border border-gray-200'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
              <div className='p-2 bg-primary/15 rounded-lg'>
                <FileText className='h-5 w-5 text-primary' />
              </div>
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0 space-y-1'>
            <DocumentButton
              label='PAN Card Document'
              docKey={user.vendor_pan_doc_key}
            />
            <DocumentButton
              label='Aadhaar Document'
              docKey={user.vendor_adhar_doc_key}
            />
            <DocumentButton
              label='Business Registration'
              docKey={business?.biz_reg_doc_key ?? null}
            />
            <DocumentButton
              label='GST Certificate'
              docKey={business?.biz_gst_doc_key ?? null}
            />
            <DocumentButton
              label='MSME Certificate'
              docKey={business?.biz_msme_cert_doc_key ?? null}
            />
            <DocumentButton
              label='Bank Document'
              docKey={business?.biz_bank_doc_key ?? null}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorProfileView;
