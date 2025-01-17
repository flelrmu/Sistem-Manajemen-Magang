import React, { useState } from "react";
import { Camera } from "lucide-react";

function FormUser() {
  const [personalInfo, setPersonalInfo] = useState({
    namaLengkap: "Ahmad Fauzi",
    nim: "2211523039",
    email: "ahmadfauzi@gmail.com",
    nomorTelepon: "082263653871",
    institusi: "Universitas Andalas",
    alamat: "jl. padang panjang",
  });

  const [passwordForm, setPasswordForm] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Informasi Pribadi</h2>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src="/images/avatar.svg"
                alt="Profile"
                className="w-24 h-26 rounded-full"
              />
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="namaLengkap"
                value={personalInfo.namaLengkap}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIM
              </label>
              <input
                type="text"
                name="nim"
                value={personalInfo.nim}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={personalInfo.email}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                name="nomorTelepon"
                value={personalInfo.nomorTelepon}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institusi
              </label>
              <input
                type="text"
                name="institusi"
                value={personalInfo.institusi}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <input
                type="text"
                name="alamat"
                value={personalInfo.alamat}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
              Simpan Perubahan
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Lama
              </label>
              <input
                type="password"
                name="passwordLama"
                value={passwordForm.passwordLama}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru
              </label>
              <input
                type="password"
                name="passwordBaru"
                value={passwordForm.passwordBaru}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password
              </label>
              <input
                type="password"
                name="konfirmasiPassword"
                value={passwordForm.konfirmasiPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Informasi Pribadi</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">
                Status Magang
              </label>
              <p className="text-green-500 font-medium">Aktif</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">
                Periode Magang
              </label>
              <p className="font-medium">6 Jan 2025 - 20 Feb 2025</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Sisa Waktu</label>
              <p className="font-medium">24 Hari</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Aktivitas Terakhir</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
              <div>
                <p className="font-medium">Login terakhir</p>
                <p className="text-sm text-gray-500">Today, 08:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full"></div>
              <div>
                <p className="font-medium">Password diubah</p>
                <p className="text-sm text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormUser;
