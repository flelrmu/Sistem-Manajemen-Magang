import React, { useState, useEffect } from "react";
import { Calendar, Search } from "lucide-react";
import SearchButton from "../../Elements/Button/SearchButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { id } from 'date-fns/locale';
import axios from "axios";
import { useDebounce } from 'use-debounce';

function FilterLaporan({ onFilter }) {
  const [submitDate, setSubmitDate] = useState(null);
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
 
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  useEffect(() => {
    handleFilter();
  }, [debouncedSearch, status, submitDate]); 

  const handleFilter = () => {
    setLoading(true);
    const filters = {
      created_at: submitDate ? submitDate.toISOString().split('T')[0] : null,
      status: status || null,
      search: searchTerm || null
    };

    // Remove null values
    Object.keys(filters).forEach(key =>
      filters[key] === null && delete filters[key]
    );

    onFilter(filters);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-600 mb-2">Tanggal Submit</label>
          <div className="flex">
            <DatePicker
              selected={submitDate}
              onChange={(date) => setSubmitDate(date)}
              placeholderText="Pilih tanggal submit"
              className="w-full border rounded-l-md p-2"
              locale={id}
              dateFormat="dd/MM/yyyy"
              isClearable
              maxDate={new Date()}
            />
            <button
              className="bg-gray-100 px-3 border-y border-r rounded-r-md"
              onClick={() => document.querySelector(".react-datepicker__input-container input").focus()}
            >
              <Calendar size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-600 mb-2">Status</label>
          <select
            className="w-full p-2 border rounded-lg"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="pending_review">Pending Review</option>
            <option value="perlu_revisi">Perlu Revisi</option>
            <option value="disetujui">Disetujui</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-600 mb-2">Cari</label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-2 border rounded-lg pl-10"
              placeholder="Cari nama/NIM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

export default FilterLaporan;