import React from "react";
import NavbarUser from "../../components/Fragment/UserFragment/NavbarUser";
import LogbookUser from "../../components/Layouts/UsersLayouts/LogbookUser";

function LogbookUserPage() {
  return (
    <>
      <NavbarUser type="logbookUser" />
      <LogbookUser />
    </>
  );
}

export default LogbookUserPage;
