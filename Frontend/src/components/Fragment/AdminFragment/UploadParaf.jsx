import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../../Context/UserContext';

function UploadParaf() {
  const { user, updateParaf } = useAuth();
  const [parafData, setParafData] = useState({
    selectedFile: null,
    previewUrl: null,
    error: null,
    loading: false,
    success: false
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setParafData(prev => ({
        ...prev,
        selectedFile: null,
        error: "Tipe file tidak diizinkan. Gunakan JPG, JPEG, atau PNG",
        success: false
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setParafData(prev => ({
        ...prev,
        selectedFile: null,
        error: "File terlalu besar. Maksimal 5MB",
        success: false
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setParafData(prev => ({
      ...prev,
      selectedFile: file,
      previewUrl: previewUrl,
      error: null,
      success: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parafData.selectedFile) return;

    setParafData(prev => ({ ...prev, loading: true, error: null }));

    const formData = new FormData();
    formData.append("paraf_image", parafData.selectedFile);

    try {
      const response = await updateParaf(formData);
      if (response.success) {
        // Clear preview URL after successful upload
        if (parafData.previewUrl) {
          URL.revokeObjectURL(parafData.previewUrl);
        }
        
        setParafData(prev => ({
          ...prev,
          loading: false,
          success: true,
          error: null,
          selectedFile: null,
          previewUrl: null
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setParafData(prev => ({
        ...prev,
        error: error.message || "Gagal mengupload paraf",
        loading: false,
        success: false
      }));
    }
  };

  return (
    <div className="divide-y divide-gray-100 bg-white rounded-xl shadow">
      {/* Header */}
      <div className="px-6 py-5 bg-gray-50 rounded-t-xl">
        <h2 className="text-lg font-semibold text-gray-900">Upload Paraf</h2>
        <p className="mt-1 text-sm text-gray-600">
        </p>
      </div>

      {/* Alert Messages */}
      {(parafData.error || parafData.success) && (
        <div className={`mx-6 my-4 p-4 rounded-xl border ${
          parafData.success 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {parafData.error || 'Paraf berhasil diupload!'}
        </div>
      )}

      {/* Form Content */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Paraf Preview */}
          <div className="flex-none">
            <p className="text-sm font-medium text-gray-700 mb-3"></p>
            <div className="relative">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-white border-2 border-gray-200">
                {(parafData.previewUrl || user?.paraf_image) ? (
                  <img
                    src={parafData.previewUrl || user?.paraf_image}
                    alt="Paraf"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    Belum ada paraf
                  </div>
                )}
              </div>
              <label className="absolute bottom-3 right-3 p-2.5 bg-white rounded-xl shadow-lg cursor-pointer hover:bg-gray-50 border border-gray-200 group">
                <Camera size={20} className="text-gray-500 group-hover:text-blue-500" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  disabled={parafData.loading}
                />
              </label>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              Format: JPG, JPEG, PNG<br />Maksimal 5MB
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-sm text-gray-600">
                  Paraf yang Anda upload akan digunakan untuk menandatangani dokumen secara digital. 
                  Pastikan paraf yang Anda upload jelas dan sesuai dengan paraf asli Anda.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!parafData.selectedFile || parafData.loading}
                  className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {parafData.loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Mengupload...
                    </>
                  ) : (
                    'Upload Paraf'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadParaf;