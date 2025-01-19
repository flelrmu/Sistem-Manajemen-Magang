import React from "react";
import NavbarAdmin from "../../components/Fragment/AdminFragment/NavbarAdmin";
import DashboardAdmin from "../../components/Layouts/AdminLayouts/DashboardAdmin";

function DashboardPage() {
  return (
    <>
      <NavbarAdmin type={"dashboard"} />
      <DashboardAdmin />
    </>
  );
}

export default DashboardPage;
