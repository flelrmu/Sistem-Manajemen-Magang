// Frontend/src/components/Layouts/AdminLayouts/ManagementAbsen.jsx

import React from "react";
import AbsensiCard from "../../Fragment/AdminFragment/AbsensiCard";
import DataAbsensi from "../../Fragment/AdminFragment/DataAbsensi";
import IzinAbsensi from "../../Fragment/AdminFragment/IzinAbsensi";
import PageTitle from "../../Elements/Items/PageTitle";

function ManagementAbsen() {
  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <PageTitle>Manajemen Absensi</PageTitle>
        </div>
        <AbsensiCard />
        <DataAbsensi />
        <IzinAbsensi />
      </div>
    </div>
  );
}

export default ManagementAbsen;