import React, { useState } from "react";
import { Upload } from "lucide-react";
import UploadLaporan from "../../Fragment/UserFragment/UploadLaporan";
import StatusLaporan from "../../Fragment/UserFragment/StatusLaporan";
import RiwayatPengumpulan from "../../Fragment/UserFragment/RiwayatPengumpulan";
import PageTitle from "../../Elements/Items/PageTitle";

const LaporanUser = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <PageTitle>Laporan Akhir Magang</PageTitle>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-flex items-center hover:bg-blue-700"
          >
            <Upload className="mr-2 h-5 w-5" /> Upload Laporan
          </button>
        </div>

        <StatusLaporan />

        <RiwayatPengumpulan />

        <UploadLaporan
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
        />
      </div>
    </div>
  );
};

export default LaporanUser;
