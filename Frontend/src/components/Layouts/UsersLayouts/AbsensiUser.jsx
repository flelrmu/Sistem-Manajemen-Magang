import React, { useState } from "react";
import PermissionModal from "../../Fragment/UserFragment/Permission";
import RiwayatAbsensi from "../../Fragment/UserFragment/RiwayatAbsensi";
import AbsensiCard from "../../Fragment/UserFragment/AbsensiCard";
import PageTitle from "../../Elements/Items/PageTitle";
import IzinUser from "../../Fragment/UserFragment/IzinUser";

const AbsensiUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <PageTitle>Absensi</PageTitle>
          <div className="flex gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Ajukan Izin
            </button>
          </div>
        </div>
        <AbsensiCard />
        <div className="mt-8">
          <RiwayatAbsensi />
        </div>
        <div className="mt-8">
          <IzinUser />
        </div>
        {isModalOpen && (
          <PermissionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AbsensiUser;
