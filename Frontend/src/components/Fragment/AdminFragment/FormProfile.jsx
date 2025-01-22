import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import Button from "../../Elements/Button/Button";
import axiosInstance from "../../../../../Backend/utils/axios";

const FormProfile = () => {
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [parafUpload, setParafUpload] = useState({
    selectedFile: null,
    previewUrl: null,
    error: null,
    loading: false,
    success: false
  });

  // Fetch initial profile data including paraf image
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/profile');
        if (response.data.success) {
          setProfileData(prev => ({
            ...prev,
            fullName: response.data.data.nama,
            email: response.data.data.email
          }));
          
          // If there's an existing paraf, create preview URL
          if (response.data.data.paraf_image) {
            setParafUpload(prev => ({
              ...prev,
              previewUrl: `${process.env.REACT_APP_API_URL}/${response.data.data.paraf_image}`
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setParafUpload({
        selectedFile: file,
        previewUrl: previewUrl,
        error: null,
        loading: false,
        success: false
      });
    } else {
      setParafUpload({
        selectedFile: null,
        previewUrl: null,
        error: 'File harus berupa gambar',
        loading: false,
        success: false
      });
    }
  };

  const handleParafUpload = async (e) => {
    e.preventDefault();
    if (!parafUpload.selectedFile) return;

    setParafUpload(prev => ({ ...prev, loading: true, error: null }));

    const formData = new FormData();
    formData.append('paraf_image', parafUpload.selectedFile);

    try {
      const response = await axiosInstance.put('/api/admin/paraf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setParafUpload(prev => ({
          ...prev,
          loading: false,
          success: true,
          error: null
        }));
        
        // Show success message
        alert('Paraf berhasil diupload');
      } else {
        throw new Error(response.data.message || 'Gagal mengupload paraf');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setParafUpload(prev => ({
        ...prev,
        error: error.message || 'Gagal mengupload paraf',
        loading: false,
        success: false
      }));
      
      // Reset preview if upload fails
      if (parafUpload.previewUrl) {
        URL.revokeObjectURL(parafUpload.previewUrl);
      }
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (parafUpload.previewUrl) {
        URL.revokeObjectURL(parafUpload.previewUrl);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="max-w-3xl">
        {/* Personal Information Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Informasi Pribadi</h2>
          
          {/* Profile Picture and Info Form */}
          <div className="flex items-start mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-pink-200 overflow-hidden">
                <img
                  src="/images/avatar.svg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full text-white">
                <Camera size={20} />
              </button>
            </div>

            <form className="flex-1 ml-8">
              <div className="mb-4">
                <label className="block text-gray-600 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-600 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </form>
          </div>

          {/* Paraf Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h3 className="text-lg font-medium mb-4">Upload Paraf</h3>
            
            {/* Error message */}
            {parafUpload.error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
                {parafUpload.error}
              </div>
            )}

            {/* Success message */}
            {parafUpload.success && (
              <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-md">
                Paraf berhasil diupload!
              </div>
            )}

            {/* Preview Image */}
            {parafUpload.previewUrl && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Preview Paraf:</p>
                <img 
                  src={parafUpload.previewUrl} 
                  alt="Preview Paraf" 
                  className="h-20 object-contain border rounded-md"
                />
              </div>
            )}

            <form onSubmit={handleParafUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pilih Gambar Paraf
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-md"
                  disabled={parafUpload.loading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Format yang didukung: JPG, JPEG, PNG (Max: 5MB)
                </p>
              </div>
              
              <button
                type="submit"
                disabled={!parafUpload.selectedFile || parafUpload.loading}
                className={`px-4 py-2 rounded-md text-white transition-colors
                  ${!parafUpload.selectedFile || parafUpload.loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {parafUpload.loading ? 'Mengupload...' : 'Upload Paraf'}
              </button>
            </form>
          </div>
        </section>

        {/* Change Password Section */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Ubah Password</h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-2">Password Lama</label>
              <input
                type="password"
                value={profileData.oldPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, oldPassword: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-2">Password Baru</label>
              <input
                type="password"
                value={profileData.newPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-2">Konfirmasi Password</label>
              <input
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="justify-end flex">
              <Button variant="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Update Password
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default FormProfile;