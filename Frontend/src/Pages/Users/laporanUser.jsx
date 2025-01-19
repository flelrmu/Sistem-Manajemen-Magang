import React from "react";
import NavbarUser from "../../components/Fragment/UserFragment/NavbarUser";
import LaporanUser from "../../components/Layouts/UsersLayouts/LaporanUser";

function LaporanUserPage() {
  return (
    <>
      <NavbarUser type="laporanUser" />
      <LaporanUser />
    </>
  );
}

export default LaporanUserPage;
