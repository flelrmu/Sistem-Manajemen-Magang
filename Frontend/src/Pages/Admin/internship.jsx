import React from "react";
import Mahasiswa from "../../components/Layouts/AdminLayouts/Mahasiswa";
import NavbarAdmin from "../../components/Fragment/AdminFragment/NavbarAdmin";

function InternshipPage() {
  return (
    <>
      <NavbarAdmin type={"internship"} />
      <Mahasiswa />
    </>
  );
}

export default InternshipPage;
