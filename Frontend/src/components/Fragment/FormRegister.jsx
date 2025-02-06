import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X } from "lucide-react";
import Swal from 'sweetalert2';
import Button from "../Elements/Button/Button";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { institutionHandlers } from '../../../../Backend/utils/formHandler';

const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="relative w-full">
    <input
      ref={ref}
      className="w-full p-2 border rounded-md shadow-sm focus:ring-1 focus:ring-black pr-10"
      value={value}
      onClick={onClick}
      placeholder={placeholder}
      readOnly
    />
    <div className="absolute right-2 top-1/2 -translate-y-1/2">
      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  </div>
));

function FormRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [existingInstitutions, setExistingInstitutions] = useState([]);
  const [showNewInstitutionInput, setShowNewInstitutionInput] = useState(false);
  const [newInstitution, setNewInstitution] = useState('');

  const [errors, setErrors] = useState({
    nim: "",
    email: "",
    no_telepon: "",
  });

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    matches: true
  });

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
    fetchAdminUsers();
    const fetchInstitutions = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/institutions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          // Prepare institutions list removing duplicate "Lainnya" options
          const institutions = response.data.institutions || [];
          const preparedInstitutions = institutionHandlers.prepareInstitutionsList(institutions);
          setExistingInstitutions(preparedInstitutions);
        }
      } catch (err) {
        console.error("Error fetching institutions:", err);
        showError('Gagal memuat daftar institusi');
      }
    };
    
    fetchInstitutions();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/admin/users");
      if (response.data.success) {
        setAdminUsers(response.data.admins);
      }
    } catch (err) {
      showError('Gagal memuat daftar admin');
    }
  };
  
  const fetchInstitutions = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/admin/institutions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        const institutions = response.data.institutions || [];
        if (!institutions.includes('Lainnya')) {
          institutions.push('Lainnya');
        }
        setExistingInstitutions(institutions);
      }
    } catch (err) {
      console.error("Error fetching institutions:", err);
      showError('Gagal memuat daftar institusi');
    }
  };

  const validateNIM = (value) => {
    if (!/^\d+$/.test(value)) {
      return "NIM hanya boleh berisi angka";
    }
    return "";
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Format email tidak valid";
    }
    return "";
  };

  const validatePhone = (value) => {
    if (!/^\d+$/.test(value)) {
      return "Nomor telepon hanya boleh berisi angka";
    }
    return "";
  };

  const validatePassword = (password) => {
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      matches: password === formData.konfirmasiPassword
    };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData(prev => ({ ...prev, password: newPassword }));
    setPasswordValidation(validatePassword(newPassword));
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setFormData(prev => ({ ...prev, konfirmasiPassword: newConfirmPassword }));
    setPasswordValidation(prev => ({
      ...prev,
      matches: formData.password === newConfirmPassword
    }));
  };

  const handleInstitutionSelect = (e) => {
    institutionHandlers.handleInstitutionChange(
      e.target.value,
      setFormData,
      setShowNewInstitutionInput,
      setNewInstitution
    );
  };

  const handleNewInstitutionInput = (e) => {
    institutionHandlers.handleNewInstitutionChange(
      e.target.value,
      setNewInstitution,
      setFormData
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));

    // Input validation
    if (name === "nim") {
      if (value !== "" && !/^\d+$/.test(value)) return;
      const error = validateNIM(value);
      setErrors(prev => ({ ...prev, nim: error }));
    }
    else if (name === "email") {
      const error = validateEmail(value);
      setErrors(prev => ({ ...prev, email: error }));
    }
    else if (name === "no_telepon") {
      if (value !== "" && !/^\d+$/.test(value)) return;
      const error = validatePhone(value);
      setErrors(prev => ({ ...prev, no_telepon: error }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showError = (message) => {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#EF4444'
    });
  };

  const PasswordRequirement = ({ isValid, text }) => (
    <div className="flex items-center space-x-2">
      {isValid ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-red-500" />
      )}
      <span className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
        {text}
      </span>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const nimError = validateNIM(formData.nim);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.no_telepon);

    // Validasi institusi
    const institutionValidation = institutionHandlers.validateInstitution(formData, newInstitution);
    if (!institutionValidation.isValid) {
      showError(institutionValidation.message);
      return;
    }

    if (nimError || emailError || phoneError) {
      setErrors({
        nim: nimError,
        email: emailError,
        no_telepon: phoneError
      });
      return;
    }

    if (!Object.values(passwordValidation).every(Boolean)) {
      showError('Password tidak memenuhi persyaratan');
      return;
    }

    if (!startDate || !endDate) {
      showError('Tanggal mulai dan selesai harus diisi');
      return;
    }

    if (!formData.admin_id) {
      showError('Silakan pilih admin pembimbing');
      return;
    }

    try {
      setLoading(true);
      const registerData = {
        ...formData,
        tanggal_mulai: startDate.toISOString().split("T")[0],
        tanggal_selesai: endDate.toISOString().split("T")[0],
      };
      delete registerData.konfirmasiPassword;

      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        registerData
      );

      if (response.data.success) {
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Registrasi berhasil',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
        navigate("/login");
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Gagal melakukan registrasi');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full p-2 border rounded-md shadow-sm focus:ring-1 focus:ring-black";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Nama</label>
          <input
            type="text"
            name="nama"
            className={inputStyle}
            value={formData.nama}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Pembimbing Lapangan</label>
          <select
            className={inputStyle}
            name="admin_id"
            value={formData.admin_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Pilih Pembimbing</option>
            {adminUsers.map((admin) => (
              <option key={admin.id} value={admin.id}>{admin.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">NIM</label>
          <input
            type="text"
            name="nim"
            className={`${inputStyle} ${errors.nim ? 'border-red-500' : ''}`}
            value={formData.nim}
            onChange={handleInputChange}
            required
          />
          {errors.nim && (
            <p className="text-red-500 text-sm mt-1">{errors.nim}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            className={`${inputStyle} ${errors.email ? 'border-red-500' : ''}`}
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Nomor Telepon</label>
          <input
            type="text"
            name="no_telepon"
            className={`${inputStyle} ${errors.no_telepon ? 'border-red-500' : ''}`}
            value={formData.no_telepon}
            onChange={handleInputChange}
            required
          />
          {errors.no_telepon && (
            <p className="text-red-500 text-sm mt-1">{errors.no_telepon}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Tanggal Mulai</label>
          <ReactDatePicker
            selected={startDate}
            onChange={setStartDate}
            customInput={<CustomDateInput placeholder="Pilih tanggal mulai" />}
            dateFormat="dd/MM/yyyy"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Tanggal Selesai</label>
          <ReactDatePicker
            selected={endDate}
            onChange={setEndDate}
            customInput={<CustomDateInput placeholder="Pilih tanggal selesai" />}
            dateFormat="dd/MM/yyyy"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Institusi</label>
          <select
            className={inputStyle}
            value={showNewInstitutionInput ? "Lainnya" : (formData.institusi || "")}
            onChange={handleInstitutionSelect}
            required
          >
            <option value="">Pilih Institusi</option>
            {existingInstitutions.map((inst, index) => (
              <option key={index} value={inst}>
                {inst}
              </option>
            ))}
          </select>

          {showNewInstitutionInput && (
            <div className="mt-2">
              <input
                type="text"
                className={inputStyle}
                value={newInstitution}
                onChange={handleNewInstitutionInput}
                placeholder="Masukkan nama institusi"
                required
              />
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Jenis Kelamin</label>
          <select
            className={inputStyle}
            name="jenis_kelamin"
            value={formData.jenis_kelamin}
            onChange={handleInputChange}
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
            className={`${inputStyle} h-24`}
            name="alamat"
            value={formData.alamat}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={`${inputStyle} pr-10`}
              value={formData.password}
              onChange={handlePasswordChange}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <PasswordRequirement 
              isValid={passwordValidation.minLength}
              text="Minimal 8 karakter"
            />
            <PasswordRequirement 
              isValid={passwordValidation.hasUpperCase}
              text="Minimal satu huruf besar (A-Z)"
            />
            <PasswordRequirement 
              isValid={passwordValidation.hasNumber}
              text="Minimal satu angka (0-9)"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Konfirmasi Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="konfirmasiPassword"
              className={`${inputStyle} pr-10`}
              value={formData.konfirmasiPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {formData.konfirmasiPassword && (
            <PasswordRequirement 
              isValid={passwordValidation.matches}
              text="Password cocok"
            />
          )}
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

      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker {
          font-family: inherit;
          border: none;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .react-datepicker__header {
          background-color: #fff;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem;
        }
        .react-datepicker__day--selected {
          background-color: #000 !important;
          color: #fff !important;
        }
        .react-datepicker__day:hover {
          background-color: #f3f4f6 !important;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #e5e7eb !important;
          color: #000 !important;
        }
        .react-datepicker__day-name {
          color: #6b7280;
          width: 2rem;
          margin: 0.2rem;
        }
        .react-datepicker__day {
          width: 2rem;
          margin: 0.2rem;
        }
        .react-datepicker__current-month {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .react-datepicker__month {
          margin: 0.5rem;
        }
        .react-datepicker__navigation {
          top: 1rem;
        }
        .react-datepicker__navigation--previous {
          left: 1rem;
        }
        .react-datepicker__navigation--next {
          right: 1rem;
        }
      `}</style>
    </form>
  );
}

export default FormRegister;