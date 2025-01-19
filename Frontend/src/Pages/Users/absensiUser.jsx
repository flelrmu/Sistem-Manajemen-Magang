import React from "react";
import NavbarUser from "../../components/Fragment/UserFragment/NavbarUser";
import AbsensiUser from "../../components/Layouts/UsersLayouts/AbsensiUser";

function AbsensiUserPage() {
  return (
    <>
      <NavbarUser type="absensiUser" />
      <AbsensiUser />
    </>
  );
}

export default AbsensiUserPage;
