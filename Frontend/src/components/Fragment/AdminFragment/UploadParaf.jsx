import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UploadParaf() {
  const [parafUpload, setParafUpload] = useState({
    selectedFile: null,
    previewUrl: null,
    error: null,
    loading: false,
    success: false,
  });

  // Fetch initial paraf data
  useEffect(() => {
    const fetchParafData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/profile");
        if (response.data.success && response.data.data.paraf_image) {
          setParafUpload((prev) => ({
            ...prev,
            previewUrl: `${process.env.REACT_APP_API_URL}/${response.data.data.paraf_image}`,
          }));
        }
      } catch (error) {
        console.error("Error fetching paraf:", error);
      }
    };

    fetchParafData();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setParafUpload({
        selectedFile: file,
        previewUrl: previewUrl,
        error: null,
        loading: false,
        success: false,
      });
    } else {
      setParafUpload({
        selectedFile: null,
        previewUrl: null,
        error: "File harus berupa gambar",
        loading: false,
        success: false,
      });
    }
  };

  const handleParafUpload = async (e) => {
    e.preventDefault();
    if (!parafUpload.selectedFile) return;

    setParafUpload((prev) => ({ ...prev, loading: true, error: null }));

    const formData = new FormData();
    formData.append("paraf_image", parafUpload.selectedFile);

    try {
      const response = await axios.put("http://localhost:3000/api/admin/paraf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setParafUpload((prev) => ({
          ...prev,
          loading: false,
          success: true,
          error: null,
        }));
        alert("Paraf berhasil diupload");
      } else {
        throw new Error(response.data.message || "Gagal mengupload paraf");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setParafUpload((prev) => ({
        ...prev,
        error: error.message || "Gagal mengupload paraf",
        loading: false,
        success: false,
      }));

      if (parafUpload.previewUrl) {
        URL.revokeObjectURL(parafUpload.previewUrl);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (parafUpload.previewUrl) {
        URL.revokeObjectURL(parafUpload.previewUrl);
      }
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-8 max-w-3xl">
      <h3 className="text-lg font-medium mb-4">Upload Paraf</h3>

      {parafUpload.error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {parafUpload.error}
        </div>
      )}

      {parafUpload.success && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-md">
          Paraf berhasil diupload!
        </div>
      )}

      {parafUpload.previewUrl && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Preview Paraf:</p>
          <img
            src={parafUpload.previewUrl}
            alt="Preview Paraf"
            className="h-20 object-contain border rounded-md"
          />
        </div>
      )}

      <form onSubmit={handleParafUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Pilih Gambar Paraf
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded-md"
            disabled={parafUpload.loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Format yang didukung: JPG, JPEG, PNG (Max: 5MB)
          </p>
        </div>

        <button
          type="submit"
          disabled={!parafUpload.selectedFile || parafUpload.loading}
          className={`px-4 py-2 rounded-md text-white transition-colors
            ${
              !parafUpload.selectedFile || parafUpload.loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {parafUpload.loading ? "Mengupload..." : "Upload Paraf"}
        </button>
      </form>
    </div>
  );
}

export default UploadParaf;
