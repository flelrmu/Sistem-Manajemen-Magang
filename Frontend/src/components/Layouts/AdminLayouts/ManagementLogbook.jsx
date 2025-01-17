import React from "react";
import GreenButton from "../../Elements/Button/GreenButton";
import LogbookCard from "../../Fragment/AdminFragment/LogbookCard";
import FilterLogbook from "../../Fragment/AdminFragment/FilterLogbook";
import DataLogbook from "../../Fragment/AdminFragment/DataLogbook";
import PageTitle from "../../Elements/Items/PageTitle";

function ManagementLogbook() {
  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <PageTitle>Manajemen Logbook</PageTitle>
          <GreenButton>Export Logbook</GreenButton>
        </div>
        <LogbookCard />
        <FilterLogbook />
        <DataLogbook />
      </div>
    </div>
  );
}

export default ManagementLogbook;
