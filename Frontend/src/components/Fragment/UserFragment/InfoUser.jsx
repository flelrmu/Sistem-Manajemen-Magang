import React from "react";

function InfoUser() {
  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-8 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold mb-2">
            Selamat Datang, Ahmad Fauzi
          </h1>
          <p className="text-gray-600">Mahasiswa Magang - Teknik Informatika</p>
        </div>
        <div className="text-right">
          <div className="text-gray-600">Masa Magang</div>
          <div className="text-red-500 text-xl font-medium">
            20 Hari Tersisa
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoUser;
