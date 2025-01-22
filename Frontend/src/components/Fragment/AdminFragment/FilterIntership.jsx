import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import SearchButton from "../../Elements/Button/SearchButton";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";

function FilterInternship({ onFilterChange }) {
  // State for filter values
  const [filters, setFilters] = useState({
    status: "Semua Status",
    institusi: "Semua Institusi",
    periode: null,
    search: ""
  });
  
  // State for institution options from database
  const [institutions, setInstitutions] = useState([]);
  
  // Status options
  const statusOptions = ["Semua Status", "aktif", "selesai", "berhenti"];

  // Fetch unique institutions from backend when component mounts
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/institutions");
        setInstitutions(["Semua Institusi", ...response.data.institutions]);
      } catch (error) {
        console.error("Error fetching institutions:", error);
      }
    };
    fetchInstitutions();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters); // Notify parent component
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-gray-600 mb-2">Status</label>
          <select 
            className="w-full border rounded-md p-2"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Institution Filter */}
        <div>
          <label className="block text-gray-600 mb-2">Institusi</label>
          <select 
            className="w-full border rounded-md p-2"
            value={filters.institusi}
            onChange={(e) => handleFilterChange("institusi", e.target.value)}
          >
            {institutions.map(institution => (
              <option key={institution} value={institution}>{institution}</option>
            ))}
          </select>
        </div>

        {/* Period Filter */}
        <div>
          <label className="block text-gray-600 mb-2">Periode Magang</label>
          <div className="flex">
            <DatePicker
              selected={filters.periode}
              onChange={(date) => handleFilterChange("periode", date)}
              placeholderText="Pilih tanggal"
              className="w-full border rounded-l-md p-2 pr-44"
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

export default FilterInternship;