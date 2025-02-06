// Frontend/src/components/Layouts/AdminLayouts/ManagementLaporan.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GreenButton from "../../Elements/Button/GreenButton";
import LaporanCard from "../../Fragment/AdminFragment/LaporanCard";
import FilterLaporan from "../../Fragment/AdminFragment/FilterLaporan";
import DataLaporan from "../../Fragment/AdminFragment/DataLaporan";
import PageTitle from "../../Elements/Items/PageTitle";

function ManagementLaporan() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [exporting, setExporting] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSelectionChange = (selectedIds) => {
    setSelectedReports(selectedIds);
  };

  const handleExport = async () => {
    if (selectedReports.length === 0) {
      alert('Pilih laporan yang akan diekspor');
      return;
    }
  
    try {
      setExporting(true);
      
      const response = await axios({
        url: 'http://localhost:3000/api/reports/export',
        method: 'POST',
        responseType: 'blob',
        data: {
          selectedIds: selectedReports
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan_mahasiswa_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <PageTitle>Manajemen Laporan Akhir</PageTitle>
          <div className="flex gap-4 items-center">
            {selectedReports.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedReports.length} laporan dipilih
              </span>
            )}
            <GreenButton
              onClick={handleExport}
              disabled={exporting || selectedReports.length === 0}
            >
              {exporting ? 'Mengekspor...' : 'Export Data'}
            </GreenButton>
          </div>
        </div>
        
        <LaporanCard filters={filters} />
        <FilterLaporan onFilter={handleFilter} />
        <DataLaporan
          filters={filters}
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </div>
  );
}

export default ManagementLaporan;