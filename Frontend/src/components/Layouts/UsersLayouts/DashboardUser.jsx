import React from "react";
import InfoUser from "../../Fragment/UserFragment/InfoUser";
import QrUser from "../../Fragment/UserFragment/QrUser";
import DashboardCard from "../../Fragment/UserFragment/DashboardCard";

function DashboardUser() {
  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <InfoUser/>
        <QrUser/>
        <DashboardCard/>
      </div>
    </div>
  );
}

export default DashboardUser;
