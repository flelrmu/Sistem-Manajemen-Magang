import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/UserContext';

const EditMahasiswaModal = ({ isOpen, onClose, mahasiswaData }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    institusi: '',
    jenis_kelamin: '',
    alamat: '',
    no_telepon: '',
    tanggal_mulai: '',
    tanggal_selesai: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mahasiswaData && isOpen) {
      setFormData({
        nama: mahasiswaData.nama || '',
        nim: mahasiswaData.nim || '',
        institusi: mahasiswaData.institusi || '',
        jenis_kelamin: mahasiswaData.jenis_kelamin || '',
        alamat: mahasiswaData.alamat || '',
        no_telepon: mahasiswaData.no_telepon || '',
        tanggal_mulai: mahasiswaData.tanggal_mulai ? new Date(mahasiswaData.tanggal_mulai).toISOString().split('T')[0] : '',
        tanggal_selesai: mahasiswaData.tanggal_selesai ? new Date(mahasiswaData.tanggal_selesai).toISOString().split('T')[0] : ''
      });
    }
  }, [mahasiswaData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.put(`http://api.simagang.tech/api/admin/mahasiswa/${mahasiswaData.id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      onClose(); // Close modal on successful update
      // Optional: Add success notification or refresh data
      window.location.reload(); // Simple way to refresh data
    } catch (error) {
      console.error('Update mahasiswa error:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat memperbarui data mahasiswa');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Edit Data Mahasiswa</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">NIM</label>
            <input
              type="text"
              name="nim"
              value={formData.nim}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Institusi</label>
            <input
              type="text"
              name="institusi"
              value={formData.institusi}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
            <select
              name="jenis_kelamin"
              value={formData.jenis_kelamin}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alamat</label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
            <input
              type="tel"
              name="no_telepon"
              value={formData.no_telepon}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Mulai Magang</label>
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
            <label className="block text-sm font-medium mb-1">Tanggal Selesai Magang</label>
            <input
              type="date"
              name="tanggal_selesai"
              value={formData.tanggal_selesai}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
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
              {loading ? 'Memperbarui...' : 'Perbarui'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMahasiswaModal;