import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { useAuth } from "../../Context/UserContext";
import axios from "axios";

const API_URL = "http://api.simagang.tech/api";

function FormUser() {
  const { user, updateProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [personalInfo, setPersonalInfo] = useState({
    namaLengkap: "",
    nim: "",
    email: "",
    nomorTelepon: "",
    institusi: "",
    alamat: "",
    photo: null,
    photoPreview: null,
  });

  const [passwordForm, setPasswordForm] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        namaLengkap: user.nama || "",
        nim: user.nim || "",
        email: user.email || "",
        nomorTelepon: user.no_telepon || "",
        institusi: user.institusi || "",
        alamat: user.alamat || "",
        photo: null,
        photoPreview: user.photo_profile || null,
      });
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Ukuran file tidak boleh lebih dari 2MB",
        });
        return;
      }
      if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
        setMessage({ type: "error", text: "Format file harus JPG atau PNG" });
        return;
      }
      setPersonalInfo((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      if (personalInfo.email !== user.email) {
        formData.append('email', personalInfo.email);
      }
      if (personalInfo.nomorTelepon !== user.no_telepon) {
        formData.append('no_telepon', personalInfo.nomorTelepon);
      }
      if (personalInfo.alamat !== user.alamat) {
        formData.append('alamat', personalInfo.alamat);
      }
      if (personalInfo.photo) {
        formData.append('photo_profile', personalInfo.photo);
      }

      const response = await updateProfile(formData);
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        // Refresh the profile data
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Terjadi kesalahan saat update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.passwordBaru !== passwordForm.konfirmasiPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak sesuai" });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.put(
        `${API_URL}/user/profile/password`,
        {
          oldPassword: passwordForm.passwordLama,
          newPassword: passwordForm.passwordBaru,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setMessage({ type: "success", text: response.data.message });
        setPasswordForm({
          passwordLama: "",
          passwordBaru: "",
          konfirmasiPassword: "",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan saat update password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {message.text && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Informasi Pribadi</h2>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {personalInfo.photoPreview ? (
                  <img
                    src={personalInfo.photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    key={personalInfo.photoPreview} // Add key to force re-render
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Photo
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer">
                <Camera className="w-4 h-4 text-gray-600" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
          </div>

          <form onSubmit={handlePersonalInfoSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={personalInfo.namaLengkap}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIM
                </label>
                <input
                  type="text"
                  value={personalInfo.nim}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={personalInfo.nomorTelepon}
                  onChange={(e) =>
                    setPersonalInfo({
                      ...personalInfo,
                      nomorTelepon: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institusi
                </label>
                <input
                  type="text"
                  value={personalInfo.institusi}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <input
                  type="text"
                  value={personalInfo.alamat}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, alamat: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Ubah Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Lama
                </label>
                <input
                  type="password"
                  value={passwordForm.passwordLama}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      passwordLama: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.passwordBaru}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      passwordBaru: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={passwordForm.konfirmasiPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      konfirmasiPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Memperbarui..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Status Magang</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Status</label>
              <p className="text-green-500 font-medium">
                {user?.status || "Aktif"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600">
                Periode Magang
              </label>
              <p className="font-medium">
                {user?.tanggal_mulai} - {user?.tanggal_selesai}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Sisa Waktu</label>
              <p className="font-medium">{user?.sisa_hari || "0"} Hari</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormUser;
