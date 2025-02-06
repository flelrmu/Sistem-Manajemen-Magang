import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";
import Background from "../Elements/Items/bg";
import Logo from "../Elements/Logo/Logo";

function ScanQr() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (data) => {
    if (data && !isLoading && data.text) {
      setIsLoading(true);

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        const requestData = {
          qrData: data.text,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          deviceInfo: JSON.stringify({
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          }),
        };

        const response = await fetch("http://localhost:3000/api/absen/scan", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal memproses absensi");
        }

        const result = await response.json();

        if (result.success) {
          const alertContent = createAlertContent(result.data);
          
          await Swal.fire({
            title: `<div class="text-2xl font-bold mb-4">Absensi ${
              result.data.type === "masuk" ? "Masuk" : "Pulang"
            } Berhasil! 🎉</div>`,
            html: alertContent,
            icon: "success",
            showConfirmButton: true,
            confirmButtonText: "Selesai",
            confirmButtonColor: "#10B981",
            allowOutsideClick: false,
          });

          window.location.reload();
        }
      } catch (error) {
        await Swal.fire({
          title: "Gagal!",
          text: error.message,
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const createAlertContent = (data) => {
    const commonContent = `
      <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
        <div class="space-y-3">
          <div class="flex items-center border-b border-gray-200 pb-3">
            <div class="w-24 text-gray-600">Nama</div>
            <div class="flex-1 font-medium">${data.nama}</div>
          </div>
          <div class="flex items-center border-b border-gray-200 pb-3">
            <div class="w-24 text-gray-600">Waktu</div>
            <div class="flex-1 font-medium">${data.waktu}</div>
          </div>
    `;

    const statusContent = data.type === "masuk" ? `
      <div class="flex items-center border-b border-gray-200 pb-3">
        <div class="w-24 text-gray-600">Status</div>
        <div class="flex-1">
          <span class="px-3 py-1 ${
            data.status === "tepat_waktu"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          } rounded-full text-sm font-medium">
            ${data.status === "tepat_waktu" ? "Tepat Waktu" : "Telat"}
          </span>
        </div>
      </div>
    ` : "";

    return `
      ${commonContent}
      ${statusContent}
      <div class="flex items-center">
        <div class="w-24 text-gray-600">Lokasi</div>
        <div class="flex-1">
          <span class="px-3 py-1 ${
            data.dalam_radius
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          } rounded-full text-sm font-medium">
            ${data.dalam_radius ? "Dalam radius" : "Di luar radius"}
          </span>
        </div>
      </div>
    </div>
  </div>`;
  };

  const handleError = async (err) => {
    console.error("Camera error:", err);
    await Swal.fire({
      title: "Error!",
      text: "Gagal mengakses kamera. Pastikan kamera dalam keadaan aktif.",
      icon: "error",
      confirmButtonColor: "#EF4444",
    });
  };

  return (
    <div className="h-screen bg-white relative overflow-hidden">
      <Logo />
      <div className="bg-white relative overflow-hidden flex flex-col items-center justify-center">
        <div className="relative z-10 flex flex-col items-center justify-center px-10">
          <div className="max-w-2xl w-full mx-auto justify-center bg-white mb-4 rounded-lg shadow-xl p-8 px-24 pb-10 flex flex-col items-center">
            <div className="max-w-md w-full">
              <h2 className="text-2xl font-semibold text-center mb-8">
                Scan QR Code Absensi
              </h2>

              {!isLoading && (
                <div className="relative mb-8 flex items-center justify-center">
                  <div className="relative h-80 w-80">
                    <div className="absolute inset-5">
                      <QrScanner
                        delay={300}
                        style={{
                          height: 280,
                          width: 280,
                          objectFit: "cover",
                        }}
                        onError={handleError}
                        onScan={handleScan}
                        className="rounded-lg"
                      />
                    </div>
                    <QRCorners />
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center mb-8">
                  <CircularProgress />
                </div>
              )}

              <div className="text-center space-y-4">
                {!isLoading && (
                  <button
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    onClick={() => navigate("/")}
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Background />
    </div>
  );
}

const QRCorners = () => (
  <div className="absolute inset-0">
    <div className="absolute top-0 left-0 w-10 h-10">
      <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
      <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
    </div>
    <div className="absolute top-0 right-0 w-10 h-10">
      <div className="absolute top-0 right-0 w-full h-2 bg-red-500"></div>
      <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
    </div>
    <div className="absolute bottom-0 left-0 w-10 h-10">
      <div className="absolute bottom-0 left-0 w-full h-2 bg-red-500"></div>
      <div className="absolute bottom-0 left-0 w-2 h-full bg-red-500"></div>
    </div>
    <div className="absolute bottom-0 right-0 w-10 h-10">
      <div className="absolute bottom-0 right-0 w-full h-2 bg-red-500"></div>
      <div className="absolute bottom-0 right-0 w-2 h-full bg-red-500"></div>
    </div>
  </div>
);

export default ScanQr;