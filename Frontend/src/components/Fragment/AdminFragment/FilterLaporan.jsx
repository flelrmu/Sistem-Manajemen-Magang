import React, { useState } from "react";
import { Calendar } from "lucide-react";
import SearchButton from "../../Elements/Button/SearchButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function FilterLaporan() {
  const [startDate, setStartDate] = useState(null);
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-600 mb-2">Periode</label>
          <div className="flex">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="mm/dd/yyyy"
              className="w-full border rounded-l-md p-2 pr-36"
            />
            <button
              className="bg-gray-100 px-3 border-y border-r rounded-r-md"
              onClick={() =>
                document
                  .querySelector(".react-datepicker__input-container input")
                  .focus()
              }
            >
              <Calendar size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-gray-600 mb-2">Status</label>
          <select className="w-full p-2 border rounded-lg">
            <option>Semua Status</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-600 mb-2">Mahasiswa</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari nama atau NIM"
              className="flex-1 p-2 border rounded-lg"
            />
            <SearchButton>Cari</SearchButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterLaporan;
