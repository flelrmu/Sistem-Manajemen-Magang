import React, { useState, useEffect } from "react";
import { X, Check, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

function IzinAbsensi() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [actionType, setActionType] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/izin/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPermissions(response.data.data);
      setLoading(false);
    } catch (error) {
      setError("Gagal mengambil data izin");
      setLoading(false);
    }
  };

  const handleAction = (permission, action) => {
    setSelectedPermission(permission);
    setActionType(action);
    setShowDialog(true);
  };

  const confirmAction = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/izin/${selectedPermission.id}/status`,
        { 
          status: actionType === "approve" ? "approved" : "rejected",
          alasan_response: "" // opsional
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
  
      setPermissions(permissions.map(p => 
        p.id === selectedPermission.id 
          ? { ...p, status: actionType === "approve" ? "approved" : "rejected" } 
          : p
      ));
  
      setShowDialog(false);
    } catch (error) {
      setError(error.response?.data?.message || "Gagal memperbarui status izin");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return `px-2 py-1 rounded-full text-xs ${styles[status]}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = permissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(permissions.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Mahasiswa</th>
              <th className="text-left p-4">Tanggal</th>
              <th className="text-left p-4">Kategori</th>
              <th className="text-left p-4">Keterangan</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((record) => (
              <tr key={record.id} className="border-t">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{record.mahasiswa_nama}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {formatDate(record.tanggal_mulai)} -{" "}
                  {formatDate(record.tanggal_selesai)}
                </td>
                <td className="p-4">{record.kategori}</td>
                <td className="p-4">{record.keterangan}</td>
                <td className="p-4">
                  <span className={getStatusBadge(record.status)}>
                    {record.status}
                  </span>
                </td>
                <td className="p-4">
                  {record.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(record, "approve")}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => handleAction(record, "reject")}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, permissions.length)} of{" "}
              {permissions.length} entries
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`px-4 py-2 border rounded ${
                    currentPage === i + 1 ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>
          {actionType === "approve" ? "Approve Permission" : "Reject Permission"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionType} this permission request? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={confirmAction}>
            Confirm {actionType}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default IzinAbsensi;
