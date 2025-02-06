import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ActivityModal = ({ isOpen, onClose, onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    aktivitas: '',
    progress: '',
  });

  const [errors, setErrors] = useState({
    aktivitas: '',
    progress: ''
  });

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        tanggal: initialData.tanggal.split('T')[0],
        aktivitas: initialData.aktivitas,
        progress: initialData.progress.toString(),
      });
    } else {
      // Set default date to today when opening a new activity
      setFormData(prev => ({
        ...prev,
        tanggal: new Date().toISOString().split('T')[0]
      }));
    }
  }, [initialData, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'progress') {
      const numValue = parseInt(value);
      if (numValue < 0 || numValue > 100 || isNaN(numValue)) {
        setErrors(prev => ({
          ...prev,
          progress: 'Masukkan nilai antara 0 sampai 100'
        }));
        return;
      } else {
        setErrors(prev => ({
          ...prev,
          progress: ''
        }));
      }
    }

    if (name === 'aktivitas') {
      if (value.length < 10 || value.length > 255) {
        setErrors(prev => ({
          ...prev,
          aktivitas: 'Aktivitas harus antara 10-255 karakter'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          aktivitas: ''
        }));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.aktivitas.length < 10 || formData.aktivitas.length > 255) {
      setErrors(prev => ({
        ...prev,
        aktivitas: 'Aktivitas harus antara 10-255 karakter'
      }));
      return;
    }

    const progressValue = parseInt(formData.progress);
    if (progressValue < 0 || progressValue > 100 || isNaN(progressValue)) {
      setErrors(prev => ({
        ...prev,
        progress: 'Masukkan nilai antara 0 sampai 100'
      }));
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      aktivitas: '',
      progress: '',
    });
    setErrors({
      aktivitas: '',
      progress: ''
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
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{isEdit ? 'Edit Aktivitas' : 'Tambah Aktivitas'}</h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Aktivitas</label>
              <textarea
                name="aktivitas"
                value={formData.aktivitas}
                onChange={handleInputChange}
                placeholder="Masukkan deskripsi aktivitas..."
                className={`w-full px-3 py-2 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.aktivitas ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.aktivitas && (
                <p className="mt-1 text-sm text-red-500">{errors.aktivitas}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Progress (%)</label>
              <input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleInputChange}
                min="0"
                max="100"
                placeholder="Masukkan progress (0-100)"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.progress ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.progress && (
                <p className="mt-1 text-sm text-red-500">{errors.progress}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                {isEdit ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;