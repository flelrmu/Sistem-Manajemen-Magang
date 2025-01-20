import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

const ActivityModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    tanggal: '',
    aktivitas: '',
    progress: '',
    file: null
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    onSubmit(formData);
    setFormData({
      tanggal: '',
      aktivitas: '',
      progress: '',
      file: null
    });
  };

  const handleClose = () => {
    setFormData({
      tanggal: '',
      aktivitas: '',
      progress: '',
      file: null
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Tambah Aktivitas</h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Aktivitas</label>
              <textarea
                name="aktivitas"
                className="w-full border rounded-lg p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan deskripsi aktivitas..."
                value={formData.aktivitas}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Progress</label>
              <input
                type="text"
                name="progress"
                placeholder="Masukkan progress..."
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.progress}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Upload Bukti (jika ada)</label>
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center">
                  <Upload className="text-gray-400 mr-2" size={20} />
                  <input
                    type="file"
                    name="file"
                    className="w-full text-gray-500 focus:outline-none"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      file: e.target.files[0]
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Ajukan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;