import React, { useState, useEffect } from "react";
import axios from "axios";

function InfoUser() {
  const [userData, setUserData] = useState({
    nama: "",
    institusi: "",
    sisa_hari: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
        const response = await axios.get("http://api.simagang.tech/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const { data } = response.data;
          setUserData({
            nama: data.profile.nama,
            institusi: data.profile.institusi,
            sisa_hari: data.profile.sisa_hari
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-8 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold mb-2">
            Selamat Datang, {userData.nama}
          </h1>
          <p className="text-gray-600">Magang - {userData.institusi}</p>
        </div>
        <div className="text-right">
          <div className="text-gray-600">Masa Magang</div>
          <div className="text-red-500 text-xl font-medium">
            {userData.sisa_hari} Hari Tersisa
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoUser;