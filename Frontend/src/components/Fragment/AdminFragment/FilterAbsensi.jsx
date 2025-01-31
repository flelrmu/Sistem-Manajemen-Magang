// Frontend/src/components/Fragment/AdminFragment/FilterAbsensi.jsx

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function FilterAbsensi({ onFilterChange }) {
  const [filters, setFilters] = useState({
    tanggal: null,
    status: "Semua Status",
    search: "",
  });

  const statusOptions = [
    "Semua Status",
    "hadir",
    "izin",
    "alpha"
  ];

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Filter */}
        <div>
          <label className="block text-gray-600 mb-2">Tanggal</label>
          <div className="relative">
            <DatePicker
              selected={filters.tanggal}
              onChange={(date) => handleFilterChange("tanggal", date)}
              placeholderText="Pilih tanggal"
              className="w-full border rounded-lg p-2"
              dateFormat="dd/MM/yyyy"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-gray-600 mb-2">Status Kehadiran</label>
          <select
            className="w-full border rounded-lg p-2"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-gray-600 mb-2">Pencarian</label>
          <input
            type="text"
            placeholder="Cari nama atau NIM"
            className="w-full border rounded-lg p-2"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default FilterAbsensi;