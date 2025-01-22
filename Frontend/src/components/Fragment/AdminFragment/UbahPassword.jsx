import React, { useState } from "react";
import { useAuth } from "../../Context/UserContext";
import Button from "../../Elements/Button/Button";

function UbahPassword() {
  const { updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    konfirmasiPassword: "",
  });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validate password match
    if (passwordData.newPassword !== passwordData.konfirmasiPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak sesuai" });
      setLoading(false);
      return;
    }

    try {
      const response = await updatePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage({ type: "success", text: response.message });
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        konfirmasiPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan saat update password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow mt-8 max-w-3xl">
      <h2 className="text-xl font-semibold mb-6">Ubah Password</h2>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <div>
          <label className="block text-gray-600 mb-2">Password Lama</label>{" "}
          <input
            type="password"
            value={passwordData.oldPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, oldPassword: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-2">Password Baru</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-2">
            Konfirmasi Password
          </label>
          <input
            type="password"
            value={passwordData.konfirmasiPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                konfirmasiPassword: e.target.value,
              })
            }
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="justify-end flex">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Memperbarui..." : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default UbahPassword;
