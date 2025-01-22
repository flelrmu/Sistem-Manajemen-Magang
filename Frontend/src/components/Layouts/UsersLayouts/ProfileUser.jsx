import React from "react";
import FormUser from "../../Fragment/UserFragment/FormUser";
import PageTitle from "../../Elements/Items/PageTitle";

const ProfileUser = () => {
  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <PageTitle>Pengaturan Profile</PageTitle>
        <div className="mt-6">
          <FormUser />
        </div>
      </div>
    </div>
  );
};

export default ProfileUser;