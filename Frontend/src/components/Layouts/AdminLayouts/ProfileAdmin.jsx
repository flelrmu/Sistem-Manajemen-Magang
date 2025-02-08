import React from "react";
import FormProfile from "../../Fragment/AdminFragment/FormProfile";
import PageTitle from "../../Elements/Items/PageTitle";
import UploadParaf from "../../Fragment/AdminFragment/UploadParaf";
import UbahPassword from "../../Fragment/AdminFragment/UbahPassword";

const ProfileAdmin = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-[70px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          {/* Header */}
          <div className="mb-6">
            <PageTitle>Pengaturan Profile</PageTitle>
            <p className="mt-2 text-sm text-gray-600">
            </p>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Profile & Signature */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                <FormProfile />
              </div>

              {/* Signature Upload */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                <UploadParaf />
              </div>
            </div>

            {/* Right Column - Password Change */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden sticky top-[90px]">
                <UbahPassword />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;