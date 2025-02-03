import React, { useState, useEffect } from "react";
import { Search, X, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function FilterAbsensi({ onFilterChange }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  // Handle filter changes
  useEffect(() => {
    const filters = {
      startDate: selectedDate ? formatDate(selectedDate) : null,
      endDate: selectedDate ? formatDate(selectedDate) : null,
      status: status || "Semua Status",
      search: search.trim()
    };
    
    onFilterChange(filters);
  }, [selectedDate, status, search]);

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setStatus('');
    setSearch('');
    onFilterChange({
      startDate: null,
      endDate: null,
      status: "Semua Status",
      search: ""
    });
  };

  // Custom input component for DatePicker
  const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <div className="relative">
      <input
        type="text"
        ref={ref}
        className="w-full p-2 pl-10 border rounded-lg cursor-pointer bg-white pr-44"
        value={value || ''}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
      />
      <Calendar 
        size={20} 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  ));

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Pilih tanggal"
            isClearable
            customInput={<CustomInput />}
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Kehadiran
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white"
          >
            <option value="">Semua Status</option>
            <option value="hadir">Hadir</option>
            <option value="izin">Izin</option>
            <option value="alpha">Alpha</option>
          </select>
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cari Mahasiswa
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau NIM..."
              className="w-full p-2 pl-10 pr-10 border rounded-lg"
            />
            <Search 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedDate || status || search) && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterAbsensi;