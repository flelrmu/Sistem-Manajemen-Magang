import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import Swal from 'sweetalert2';
import Background from "../Elements/Items/bg";
import Logo from "../Elements/Logo/Logo";

function ScanQr() {
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (data) => {
    if (data && !isLoading && data.text) {
      setIsLoading(true);

      try {
        // Parse QR data
        let qrContent;
        try {
          qrContent = data.text;
        } catch (e) {
          console.error("QR Parse error:", e);
          throw new Error("Format QR Code tidak valid");
        }

        // Get location
        let position;
        try {
          position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });
        } catch (e) {
          console.error("Location error:", e);
          throw new Error("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
        }

        const requestData = {
          qrData: qrContent,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          deviceInfo: JSON.stringify({
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          }),
        };

        const response = await fetch("http://api.simagang.tech/api/absen/scan", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal memproses absensi");
        }

        const result = await response.json();

        if (result.success) {
          setScanResult(result);
          await Swal.fire({
            title: '<div class="text-2xl font-bold mb-4">Absensi Berhasil! 🎉</div>',
            html: `
              <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div class="space-y-3">
                  <div class="flex items-center border-b border-gray-200 pb-3">
                    <div class="w-24 text-gray-600">Nama</div>
                    <div class="flex-1 font-medium">${result.data.nama}</div>
                  </div>
                  <div class="flex items-center border-b border-gray-200 pb-3">
                    <div class="w-24 text-gray-600">Waktu</div>
                    <div class="flex-1 font-medium">${result.data.waktu}</div>
                  </div>
                  <div class="flex items-center border-b border-gray-200 pb-3">
                    <div class="w-24 text-gray-600">Status</div>
                    <div class="flex-1">
                      <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ${result.data.status}
                      </span>
                    </div>
                  </div>
                  ${result.data.dalam_radius !== undefined ? `
                    <div class="flex items-center">
                      <div class="w-24 text-gray-600">Lokasi</div>
                      <div class="flex-1">
                        <span class="px-3 py-1 ${result.data.dalam_radius ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full text-sm font-medium">
                          ${result.data.dalam_radius ? 'Dalam radius' : 'Di luar radius'}
                        </span>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `,
            icon: 'success',
            showConfirmButton: true,
            confirmButtonText: 'Selesai',
            confirmButtonColor: '#10B981',
            allowOutsideClick: false,
            customClass: {
              popup: 'swal2-show',
              container: 'swal2-container',
              title: 'text-2xl font-bold mb-4'
            }
          }).then((result) => {
            if (result.isConfirmed) {
              handleDismiss();
            }
          });
        } else {
          throw new Error(result.message || "Gagal memproses absensi");
        }
      } catch (error) {
        await Swal.fire({
          title: 'Gagal!',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleError = async (err) => {
    console.error("Camera error:", err);
    await Swal.fire({
      title: 'Error!',
      text: 'Gagal mengakses kamera. Pastikan kamera dalam keadaan aktif.',
      icon: 'error',
      confirmButtonColor: '#EF4444'
    });
  };

  const handleDismiss = () => {
    setScanResult(null);
    window.location.reload();
  };

  const scannerSize = 280;

  const previewStyle = {
    height: scannerSize,
    width: scannerSize,
    objectFit: "cover",
  };

  const containerStyle = {
    height: scannerSize + 40,
    width: scannerSize + 40,
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

              {!scanResult && !isLoading && (
                <div className="relative mb-8 flex items-center justify-center">
                  <div className="relative" style={containerStyle}>
                    <div className="absolute inset-5">
                      <QrScanner
                        delay={300}
                        style={previewStyle}
                        onError={handleError}
                        onScan={handleScan}
                        className="rounded-lg"
                      />
                    </div>
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
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center mb-8">
                  <CircularProgress />
                </div>
              )}

              <div className="text-center space-y-4">
                {!scanResult && !isLoading && (
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

export default ScanQr;