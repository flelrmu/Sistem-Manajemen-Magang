import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/UserContext';
import Swal from 'sweetalert2';

const PermissionModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    tanggal_mulai: '',
    tanggal_selesai: '',
    kategori: '',
    keterangan: '',
    file_bukti: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://157.245.206.178:3000/api/izin/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file_bukti: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formPayload.append(key, formData[key]);
        }
      });

      await axios.post('http://157.245.206.178:3000/api/izin/submit', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Show success alert
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pengajuan izin berhasil dikirim',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
        }
      });

    } catch (error) {
      // Show error alert
      Swal.fire({
        title: 'Gagal!',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengajukan izin',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
      setError(error.response?.data?.message || 'Terjadi kesalahan saat mengajukan izin');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Pengajuan Izin</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
            <input
              type="date"
              name="tanggal_mulai"
              value={formData.tanggal_mulai}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
            <input
              type="date"
              name="tanggal_selesai"
              value={formData.tanggal_selesai}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Pilih Kategori</option>
              <option value="Sakit">Sakit</option>
              <option value="Keperluan Keluarga">Keperluan Keluarga</option>
              <option value="Keperluan Kampus">Keperluan Kampus</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Keterangan</label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Bukti</label>
            <input
              type="file"
              name="file_bukti"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Mengirim...' : 'Ajukan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionModal;