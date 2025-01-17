import React from "react";
import DashboardCard from "../../Fragment/AdminFragment/DashboardCard";
import DashboardGrafik from "../../Fragment/AdminFragment/DashboardGrafik";
import AktifitasTerbaru from "../../Fragment/AdminFragment/AktifitasTerbaru";

const DashboardAdmin = () => {
  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <DashboardCard />
        <DashboardGrafik />
        <AktifitasTerbaru />
      </div>
    </div>
  );
};

export default DashboardAdmin;
