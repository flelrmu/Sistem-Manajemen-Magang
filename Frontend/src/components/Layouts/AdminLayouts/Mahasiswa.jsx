import React from "react";
import FilterIntership from "../../Fragment/AdminFragment/FilterIntership";
import DataIntership from "../../Fragment/AdminFragment/DataIntership";
import PageTitle from "../../Elements/Items/PageTitle";

function Mahasiswa() {
  return (
    <div className="h-auto relative px-8 pt-[70px] w-full">
      <div className="max-w-7xl mx-auto py-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <PageTitle>Manajemen Data Intership</PageTitle>
          </div>
          <FilterIntership />
          <DataIntership />
        </div>
      </div>
    </div>
  );
}

export default Mahasiswa;
