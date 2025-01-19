import React from "react";
import NavbarAdmin from "../../components/Fragment/AdminFragment/NavbarAdmin";
import ManagementLaporan from "../../components/Layouts/AdminLayouts/ManagementLaporan";

function LaporanPage() {
  return (
    <>
      <NavbarAdmin type={"laporan"} />
      <ManagementLaporan />
    </>
  );
}

export default LaporanPage;
