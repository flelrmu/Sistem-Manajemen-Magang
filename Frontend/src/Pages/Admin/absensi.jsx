import React from "react";
import ManagementAbsen from "../../components/Layouts/AdminLayouts/ManagementAbsen";
import NavbarAdmin from "../../components/Fragment/AdminFragment/NavbarAdmin";

function AbsensiPage() {
  return (
    <>
      <NavbarAdmin type="absensi" />
      <ManagementAbsen />
    </>
  );
}

export default AbsensiPage;
