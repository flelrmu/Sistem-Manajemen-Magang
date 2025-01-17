import React from 'react';
import FormProfile from '../../Fragment/AdminFragment/FormProfile';
import PageTitle from '../../Elements/Items/PageTitle';

const ProfileAdmin = () => {
  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl x-auto py-6">
        <PageTitle>Profile Settings</PageTitle>
        <FormProfile/>
      </div>
    </div>
  );
};

export default ProfileAdmin;