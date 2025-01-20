import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineMail } from "react-icons/hi";
import { LuLockKeyhole } from "react-icons/lu";
import { useAuth } from "../Context/UserContext"; // Import useAuth

const FormLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use login from context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await login(formData.email, formData.password);
      
      // Get user data after successful login
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData.role === 'admin') {
        navigate('/dashboard');
      } else if (userData.role === 'mahasiswa') {
        navigate('/dashboardUser');
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <HiOutlineMail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <LuLockKeyhole className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-300 disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>

          <Link
            to="/scan"
            className="w-full bg-white text-black border border-black py-2 px-4 rounded-md hover:bg-gray-100 transition duration-300 text-center"
          >
            Scan QR Code
          </Link>
        </div>

        <div className="text-center">
          <Link to="/register" className="text-red-500 hover:underline text-sm">
            Belum punya akun? Daftar
          </Link>
        </div>
      </form>
    </div>
  );
};

export default FormLogin;