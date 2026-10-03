"use client";
import React, { useState } from "react";
import Heading from "@/_components/Shared/Heading";
import PageLoading from "@/_components/Shared/PageLoading";
import PageError from "@/_components/Shared/PageError";
import DashboardWrapper from "@/components/DashboardWrapper";
import { trpc } from "@/lib/trpc";
import VendorProfileView from "./_components/VendorProfileView";
import VendorProfileEdit from "./_components/VendorProfileEdit";
import AccountStatusBanner from "../_components/AccountStatusBanner";

const VendorProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, isError, refetch } =
    trpc.vendor.getMyProfile.useQuery();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !data?.vendorDetails) {
    return (
      <PageError
        title='Profile Not Found'
        message='Unable to load your profile. Please try again later.'
        onRetry={() => refetch()}
      />
    );
  }

  const handleEditSuccess = () => {
    setIsEditing(false);
    refetch();
  };

  return (
    <DashboardWrapper
      title={isEditing ? "Edit Profile" : "My Profile"}
      description={
        isEditing
          ? "Update your contact and business details."
          : "Your account, business and registration details."
      }>
      <Heading
        title='Vendor Profile'
        description='Your vendor profile and business information'
        keywords='Profile, Vendor, Business'
      />

      <div className='space-y-6'>
        <AccountStatusBanner
          status={data.vendorDetails.user.vendor_status}
          rejectionReason={data.vendorDetails.user.vendor_rejection_reason}
          showProfileLink={false}
        />

        {isEditing ? (
          <VendorProfileEdit
            data={data.vendorDetails}
            onCancel={() => setIsEditing(false)}
            onSuccess={handleEditSuccess}
          />
        ) : (
          <VendorProfileView
            data={data.vendorDetails}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </div>
    </DashboardWrapper>
  );
};

export default VendorProfilePage;
