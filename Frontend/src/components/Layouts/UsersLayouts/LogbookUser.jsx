import React, { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import ActivityModal from "../../Fragment/UserFragment/Activity";
import LogbookCard from "../../Fragment/UserFragment/LogbookCard";
import LogbookData from "../../Fragment/UserFragment/LogbookData";
import PageTitle from "../../Elements/Items/PageTitle";

const LogbookUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <PageTitle>Logbook Aktivitas</PageTitle>
          <div className="space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-flex items-center"
            >
              <span className="text-xl mr-2">+</span> Tambah Aktivitas
            </button>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg inline-flex items-center">
              <ArrowUpDown className="mr-2 h-5 w-5" /> Download PDF
            </button>
          </div>
        </div>

        <LogbookCard />

        <LogbookData />

        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default LogbookUser;
