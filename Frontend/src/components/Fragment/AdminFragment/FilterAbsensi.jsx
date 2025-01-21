import React, { useState } from "react";
import { Calendar } from "lucide-react";
import SearchButton from "../../Elements/Button/SearchButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function FilterAbsensi({ onFilterChange }) {
  const [filters, setFilters] = useState({
    tanggal: null,
    status: "Semua Status",
    mahasiswa_id: "all",
    search: "",
  });

  // Status options for attendance
  const statusOptions = [
    "Semua Status",
    "hadir",
    "izin",
    "alpha"
  ];

  // Handle filter changes
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
          <div className="flex">
            <DatePicker
              selected={filters.tanggal}
              onChange={(date) => handleFilterChange("tanggal", date)}
              placeholderText="Pilih tanggal"
              className="w-full border rounded-l-md p-2 pr-48"
              dateFormat="dd/MM/yyyy"
            />
            <button
              className="bg-gray-100 px-3 border-y border-r rounded-r-md"
              onClick={() => document.querySelector(".react-datepicker__input-container input").focus()}
            >
              <Calendar size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-gray-600 mb-2">Status Kehadiran</label>
          <select
            className="w-full border rounded-md p-2"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-gray-600 mb-2">Pencarian</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari nama atau NIM"
              className="flex-1 p-2 border rounded-lg"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
            <SearchButton onClick={() => onFilterChange(filters)}>
              Cari
            </SearchButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterAbsensi;