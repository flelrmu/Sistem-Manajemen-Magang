import React from "react";
import { Clock, MapPin, LucideQrCode } from "lucide-react";

function QrUser() {
  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-8 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <LucideQrCode className="w-64 h-64" />
          <p className="text-gray-600">QR Code Anda</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-6">Status Absensi Hari Ini</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Clock className="text-blue-500" />
              <div>
                <div className="text-gray-600">Jam Masuk</div>
                <div className="font-medium">08:00:23</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="text-green-500" />
              <div>
                <div className="text-gray-600">Status Lokasi</div>
                <div className="font-medium">Terverifikasi ✓</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="text-red-500" />
              <div>
                <div className="text-gray-600">Jam Keluar</div>
                <div className="font-medium">17:00:23</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QrUser;
