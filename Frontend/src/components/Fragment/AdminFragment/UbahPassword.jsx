import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/UserContext';
import { Lock, Check, X, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const UbahPassword = () => {
 const { updatePassword } = useAuth();
 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState({ type: "", text: "" });
 const [showPassword, setShowPassword] = useState({
   old: false,
   new: false, 
   confirm: false
 });
 const [validationChecks, setValidationChecks] = useState({
   length: false,
   uppercase: false,
   number: false,
   match: false
 });

 const [passwordData, setPasswordData] = useState({
   oldPassword: "",
   newPassword: "",
   konfirmasiPassword: "",
 });

 useEffect(() => {
   const newPassword = passwordData.newPassword;
   const konfirmasi = passwordData.konfirmasiPassword;
   
   setValidationChecks({
     length: newPassword.length >= 8,
     uppercase: /[A-Z]/.test(newPassword),
     number: /[0-9]/.test(newPassword),
     match: newPassword === konfirmasi && newPassword !== ""
   });
 }, [passwordData.newPassword, passwordData.konfirmasiPassword]);

 const handlePasswordUpdate = async (e) => {
   e.preventDefault();
   setLoading(true);
   setMessage({ type: "", text: "" });

   try {
     const response = await updatePassword({
       oldPassword: passwordData.oldPassword,
       newPassword: passwordData.newPassword,
     });

     if (response.success) {
       await Swal.fire({
         title: 'Berhasil!',
         text: 'Password berhasil diperbarui',
         icon: 'success',
         confirmButtonColor: '#10B981'
       });
       
       setPasswordData({
         oldPassword: "",
         newPassword: "",
         konfirmasiPassword: "",
       });
     } else {
       throw new Error(response.message || 'Password lama tidak sesuai');
     }
   } catch (error) {
     await Swal.fire({
       title: 'Gagal!',
       text: 'Password lama tidak sesuai',
       icon: 'error',
       confirmButtonColor: '#EF4444'
     });
   } finally {
     setLoading(false);
   }
 };

 const ValidationItem = ({ fulfilled, text }) => (
   <div className="flex items-center gap-2">
     {fulfilled ? (
       <Check size={16} className="text-green-500" />
     ) : (
       <X size={16} className="text-gray-300" />
     )}
     <span className={`text-sm ${fulfilled ? 'text-green-500' : 'text-gray-500'}`}>
       {text}
     </span>
   </div>
 );

 return (
   <div className="divide-y divide-gray-100">
     <div className="px-6 py-5 bg-white">
       <div className="flex items-center gap-3">
         <Lock className="w-5 h-5 text-gray-600" />
         <div>
           <h2 className="text-lg font-semibold text-gray-900">Ubah Password</h2>
           <p className="mt-1 text-sm text-gray-600">
             Perbarui password akun Anda
           </p>
         </div>
       </div>
     </div>

     <div className="p-6">
       {message.text && (
         <div className={`mb-6 p-4 rounded-xl border ${
           message.type === "success"
             ? "bg-green-50 border-green-200 text-green-700"
             : "bg-red-50 border-red-200 text-red-700"
         }`}>
           {message.text}
         </div>
       )}

       <form onSubmit={handlePasswordUpdate} className="space-y-5">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1.5">
             Password Lama
           </label>
           <div className="relative">
             <input
               type={showPassword.old ? "text" : "password"}
               value={passwordData.oldPassword}
               onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
               className="block w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               required
             />
             <button
               type="button"
               onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
               className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
             >
               {showPassword.old ? <EyeOff size={20} /> : <Eye size={20} />}
             </button>
           </div>
         </div>

         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1.5">
             Password Baru
           </label>
           <div className="relative">
             <input
               type={showPassword.new ? "text" : "password"}
               value={passwordData.newPassword}
               onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
               className="block w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               required
             />
             <button
               type="button"
               onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
               className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
             >
               {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
             </button>
           </div>
         </div>

         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1.5">
             Konfirmasi Password
           </label>
           <div className="relative">
             <input
               type={showPassword.confirm ? "text" : "password"}
               value={passwordData.konfirmasiPassword}
               onChange={(e) => setPasswordData({ ...passwordData, konfirmasiPassword: e.target.value })}
               className="block w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               required
             />
             <button
               type="button"
               onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
               className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
             >
               {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
             </button>
           </div>
         </div>

         <div className="bg-gray-50 p-4 rounded-xl space-y-2">
           <ValidationItem 
             fulfilled={validationChecks.length} 
             text="Minimal 8 karakter" 
           />
           <ValidationItem 
             fulfilled={validationChecks.uppercase} 
             text="Minimal satu huruf besar (A-Z)" 
           />
           <ValidationItem 
             fulfilled={validationChecks.number} 
             text="Minimal satu angka (0-9)" 
           />
           <ValidationItem 
             fulfilled={validationChecks.match} 
             text="Password baru dan konfirmasi sama" 
           />
         </div>

         <div className="pt-2">
           <button
             type="submit"
             disabled={loading || !Object.values(validationChecks).every(Boolean)}
             className="w-full flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             {loading ? (
               <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                 </svg>
                 Memperbarui...
               </>
             ) : (
               'Update Password'
             )}
           </button>
         </div>
       </form>
     </div>
   </div>
 );
};

export default UbahPassword;