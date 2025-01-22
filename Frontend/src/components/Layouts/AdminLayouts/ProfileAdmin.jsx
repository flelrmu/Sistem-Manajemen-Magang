import React from "react";
import FormProfile from "../../Fragment/AdminFragment/FormProfile";
import PageTitle from "../../Elements/Items/PageTitle";
import UploadParaf from "../../Fragment/AdminFragment/UploadParaf";
import UbahPassword from "../../Fragment/AdminFragment/UbahPassword";

const ProfileAdmin = () => {
  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6 bg-white p-6 rounded-lg shadow my-8">
        <PageTitle>Pengaturan Profile</PageTitle>
        <div className="mt-6">
          <FormProfile />
          <UploadParaf />
          <UbahPassword />
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;
