import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../Context/UserContext';
import Swal from 'sweetalert2';

const UploadLaporan = ({ isOpen, onClose, onSuccess, onUploadComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    versi: '',
    progress: '',
    catatan: '',
    file: null
  });

  const showSuccessAlert = () => {
    Swal.fire({
      title: 'Berhasil!',
      text: 'Laporan berhasil diunggah',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Gagal!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#EF4444',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const validateForm = () => {
    if (!formData.versi) {
      showErrorAlert('Versi laporan wajib diisi');
      return false;
    }
    if (!formData.file) {
      showErrorAlert('File laporan wajib diunggah');
      return false;
    }
    if (formData.progress && (formData.progress < 0 || formData.progress > 100)) {
      showErrorAlert('Progress harus antara 0-100');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    // Show loading state with SweetAlert2
    Swal.fire({
      title: 'Mengunggah...',
      html: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formPayload = new FormData();
    formPayload.append('versi', formData.versi);
    formPayload.append('progress', formData.progress);
    formPayload.append('catatan', formData.catatan);
    formPayload.append('file_laporan', formData.file);

    try {
      await axios.post('http://localhost:3000/api/reports', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFormData({
        versi: '',
        progress: '',
        catatan: '',
        file: null
      });

      showSuccessAlert();
      
      // Call both callback functions
      if (onSuccess) onSuccess();
      if (onUploadComplete) onUploadComplete();
      
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat mengunggah laporan';
      showErrorAlert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Upload Laporan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Versi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="versi"
                value={formData.versi}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="v1.0"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress (%)
              </label>
              <input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0-100"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                name="catatan"
                value={formData.catatan}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tambahkan catatan..."
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Laporan (PDF/DOC/DOCX) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                accept=".pdf,.doc,.docx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Maksimal ukuran file 10MB
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Mengunggah...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadLaporan;