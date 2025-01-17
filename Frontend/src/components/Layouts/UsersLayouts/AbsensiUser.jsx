import React, { useState } from "react";
import PermissionModal from "../../Fragment/UserFragment/Permission";
import RiwayatAbsensi from "../../Fragment/UserFragment/RiwayatAbsensi";
import AbsensiCard from "../../Fragment/UserFragment/AbsensiCard";
import PageTitle from "../../Elements/Items/PageTitle";

const AbsensiUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitPermission = (formData) => {
    console.log("Permission form submitted:", formData);
    setIsModalOpen(false);
  };

  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <PageTitle>Absensi</PageTitle>
          <div className="space-x-4">
            <button
              onClick={handleOpenModal}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              Ajukan Izin
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
              Download Rekap
            </button>
          </div>
        </div>
        <AbsensiCard />
        <RiwayatAbsensi />
        <PermissionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitPermission}
        />
      </div>
    </div>
  );
};

export default AbsensiUser;
