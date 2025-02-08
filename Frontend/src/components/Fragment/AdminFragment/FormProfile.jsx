import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../../Context/UserContext';

const FormProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileData, setProfileData] = useState({
    nama: user?.nama || "",
    email: user?.email || "",
    photo: null,
    photoPreview: user?.photo_profile || null
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "File terlalu besar. Maksimal 5MB" });
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setMessage({ type: "error", text: "Tipe file tidak diizinkan. Gunakan JPG, JPEG, atau PNG" });
        return;
      }

      setProfileData(prev => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      if (profileData.nama !== user.nama) formData.append("nama", profileData.nama);
      if (profileData.email !== user.email) formData.append("email", profileData.email);
      if (profileData.photo) formData.append("photo_profile", profileData.photo);

      const response = await updateProfile(formData);
      if (response.success) {
        setMessage({ type: "success", text: response.message });
      } else {
        throw new Error(response.message || "Update profile gagal");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan saat update profile"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {/* Header */}
      <div className="px-6 py-5 bg-gray-50 rounded-t-xl">
        <h2 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h2>
        <p className="mt-1 text-sm text-gray-600">
        </p>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div className={`mx-6 my-4 p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form Content */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Photo Upload */}
          <div className="flex-none">
            <p className="text-sm font-medium text-gray-700 mb-3">Foto Profil</p>
            <div className="relative">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-white border-2 border-gray-200">
                {profileData.photoPreview ? (
                  <img
                    src={profileData.photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    No Photo
                  </div>
                )}
              </div>
              <label className="absolute bottom-3 right-3 p-2.5 bg-white rounded-xl shadow-lg cursor-pointer hover:bg-gray-50 border border-gray-200 group">
                <Camera size={20} className="text-gray-500 group-hover:text-blue-500" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              Format: JPG, JPEG, PNG<br />Maksimal 5MB
            </p>
          </div>

          {/* Form Fields */}
          <div className="flex-1">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={profileData.nama}
                    onChange={(e) => setProfileData({ ...profileData, nama: e.target.value })}
                    className="block w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="block w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormProfile;