import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import Button from "../Elements/Button/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios"; // Pastikan axios sudah diinstall

function FormRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    konfirmasiPassword: "",
    nim: "",
    nama: "",
    institusi: "",
    jenis_kelamin: "",
    alamat: "",
    no_telepon: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    admin_id: "",
  });

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/admin/users"
        );
        if (response.data.success) {
          setAdminUsers(response.data.admins);
        }
      } catch (err) {
        console.error("Error fetching admin users:", err);
        setError("Gagal memuat daftar admin");
      }
    };

    fetchAdminUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi password
    if (formData.password !== formData.konfirmasiPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    // Validasi tanggal
    if (!startDate || !endDate) {
      setError("Tanggal mulai dan selesai harus diisi");
      return;
    }

    // Validasi admin
    if (!formData.admin_id) {
      setError("Silakan pilih admin pembimbing");
      return;
    }

    try {
      setLoading(true);

      // Format data sesuai dengan yang diharapkan backend
      const registerData = {
        ...formData,
        tanggal_mulai: startDate.toISOString().split("T")[0],
        tanggal_selesai: endDate.toISOString().split("T")[0],
      };

      // Hapus konfirmasiPassword karena tidak dibutuhkan backend
      delete registerData.konfirmasiPassword;

      // Kirim request ke backend
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        registerData
      );

      if (response.data.success) {
        // Redirect ke halaman login
        navigate("/login");
      } else {
        setError(response.data.message || "Terjadi kesalahan saat registrasi");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat menghubungi server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {error && (
        <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Nama</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md shadow-sm"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Pembimbing Lapangan</label>
          <select
            className="w-full p-2 border rounded-md shadow-sm bg-white"
            value={formData.admin_id}
            onChange={(e) =>
              setFormData({ ...formData, admin_id: e.target.value })
            }
            required
          >
            <option value="">Pilih Pembimbing Lapangan</option>
            {adminUsers.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">NIM</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md shadow-sm"
            value={formData.nim}
            onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded-md shadow-sm"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Nomor Telepon</label>
          <input
            type="tel"
            className="w-full p-2 border rounded-md shadow-sm"
            value={formData.no_telepon}
            onChange={(e) =>
              setFormData({ ...formData, no_telepon: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Tanggal Mulai</label>
          <div className="flex">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="mm/dd/yyyy"
              className="w-full border rounded-l-md p-2 pr-44"
              required
            />
            <button
              type="button"
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
          <label className="block text-gray-700 mb-2">Tanggal Selesai</label>
          <div className="flex">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="mm/dd/yyyy"
              className="w-full border rounded-l-md p-2 pr-44"
              required
            />
            <button
              type="button"
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
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Institusi</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md shadow-sm"
            value={formData.institusi}
            onChange={(e) =>
              setFormData({ ...formData, institusi: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Jenis Kelamin</label>
          <select
            className="w-full p-2 border rounded-md shadow-sm bg-white"
            value={formData.jenis_kelamin}
            onChange={(e) =>
              setFormData({ ...formData, jenis_kelamin: e.target.value })
            }
            required
          >
            <option value="">Pilih Jenis Kelamin</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Alamat</label>
          <textarea
            className="w-full p-2 border rounded-md shadow-sm h-24"
            value={formData.alamat}
            onChange={(e) =>
              setFormData({ ...formData, alamat: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded-md shadow-sm"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Konfirmasi Password
          </label>
          <input
            type="password"
            className="w-full p-2 border rounded-md shadow-sm"
            value={formData.konfirmasiPassword}
            onChange={(e) =>
              setFormData({ ...formData, konfirmasiPassword: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="col-span-full flex justify-between items-center mt-6">
        <Link to="/login" className="text-sm text-gray-600 hover:underline">
          Sudah ada akun?
        </Link>
        <Button
          type="submit"
          variant="bg-black hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? "Mendaftar..." : "Daftar"}
        </Button>
      </div>
    </form>
  );
}

export default FormRegister;
