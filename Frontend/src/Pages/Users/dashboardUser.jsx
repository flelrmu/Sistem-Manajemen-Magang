import React from "react";
import DashboardUser from "../../components/Layouts/UsersLayouts/DashboardUser";
import NavbarUser from "../../components/Fragment/UserFragment/NavbarUser";

function DashboardUserPage() {
  return (
    <>
      <NavbarUser type="dashboardUser" />
      <DashboardUser />
    </>
  );
}

export default DashboardUserPage;
