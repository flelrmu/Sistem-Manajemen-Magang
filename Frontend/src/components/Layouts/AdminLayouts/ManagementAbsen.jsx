import React from "react";
import AbsensiCard from "../../Fragment/AdminFragment/AbsensiCard";
import FilterAbsensi from "../../Fragment/AdminFragment/FilterAbsensi";
import DataAbsensi from "../../Fragment/AdminFragment/DataAbsensi";
import GreenButton from "../../Elements/Button/GreenButton";
import PageTitle from "../../Elements/Items/PageTitle";
import IzinAbsensi from "../../Fragment/AdminFragment/IzinAbsensi";

function ManagementAbsen() {
  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <PageTitle>Manajemen Absensi</PageTitle>
          <GreenButton>Export Absensi</GreenButton>
        </div>
        <AbsensiCard />
        <DataAbsensi />
        <IzinAbsensi />
      </div>
    </div>
  );
}

export default ManagementAbsen;
