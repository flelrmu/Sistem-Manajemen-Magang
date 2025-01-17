import React from "react";
import GreenButton from "../../Elements/Button/GreenButton";
import LaporanCard from "../../Fragment/AdminFragment/LaporanCard";
import FilterLaporan from "../../Fragment/AdminFragment/FilterLaporan";
import DataLaporan from "../../Fragment/AdminFragment/DataLaporan";
import PageTitle from "../../Elements/Items/PageTitle";

function ManagementLaporan() {
  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <PageTitle>Manajemen Laporan Akhir</PageTitle>
          <GreenButton>Export Data</GreenButton>
        </div>
        <LaporanCard />
        <FilterLaporan />
        <DataLaporan />
      </div>
    </div>
  );
}

export default ManagementLaporan;
