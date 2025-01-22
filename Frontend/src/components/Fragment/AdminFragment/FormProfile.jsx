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
    photoPreview: user?.photo_profile
      ? `http://localhost:3000/uploads/profiles/${user.photo_profile}`
      : null,
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData((prev) => ({
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
      if (profileData.nama !== user.nama)
        formData.append("nama", profileData.nama);
      if (profileData.email !== user.email)
        formData.append("email", profileData.email);
      if (profileData.photo)
        formData.append("photo_profile", profileData.photo);

      const response = await updateProfile(formData);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan saat update profile",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className=" bg-white p-6 rounded-lg shadow mt-8 max-w-3xl">
      <h2 className="text-xl font-semibold mb-6">Informasi Pribadi</h2>
      {message.text && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <div className="flex items-start">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
            {profileData.photoPreview ? (
              <img
                src={profileData.photoPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Photo
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full text-white cursor-pointer">
            <Camera size={20} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </label>
        </div>

        <form className="flex-1 ml-8" onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Nama Lengkap</label>
            <input
              type="text"
              value={profileData.nama}
              onChange={(e) =>
                setProfileData({ ...profileData, nama: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-600 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormProfile;
