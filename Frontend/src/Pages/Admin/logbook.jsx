import React from "react";
import NavbarAdmin from "../../components/Fragment/AdminFragment/NavbarAdmin";
import ManagementLogbook from "../../components/Layouts/AdminLayouts/ManagementLogbook";

function LogbookPage() {
  return (
    <>
      <NavbarAdmin type={"logbook"} />
      <ManagementLogbook />
    </>
  );
}

export default LogbookPage;
