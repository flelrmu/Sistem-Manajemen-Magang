import React, { useState, useEffect } from "react";
import { Calendar, Search, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { id } from 'date-fns/locale';
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

    Object.keys(filters).forEach(key =>
      filters[key] === null && delete filters[key]
    );

    onFilter(filters);
    setLoading(false);
  };

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

  const clearFilters = () => {
    setSubmitDate(null);
    setStatus('');
    setSearchTerm('');
    onFilter({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Submit
          </label>
          <DatePicker
            selected={submitDate}
            onChange={(date) => setSubmitDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Pilih tanggal"
            isClearable
            locale={id}
            maxDate={new Date()}
            customInput={<CustomInput />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white"
          >
            <option value="">Semua Status</option>
            <option value="pending_review">Pending Review</option>
            <option value="perlu_revisi">Perlu Revisi</option>
            <option value="disetujui">Disetujui</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cari Mahasiswa
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau NIM..."
              className="w-full p-2 pl-10 pr-10 border rounded-lg"
            />
            <Search 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {(submitDate || status || searchTerm) && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </button>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

export default FilterLaporan;