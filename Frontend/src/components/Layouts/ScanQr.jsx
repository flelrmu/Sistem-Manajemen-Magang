import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@chakra-ui/alert";
import Background from "../Elements/Items/bg";
import Logo from "../Elements/Logo/Logo";

function ScanQr() {
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

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

        const response = await fetch("/api/absen/scan", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const result = await response.json();

        if (result.success) {
          setAlert({
            type: "success",
            title: "Absensi Berhasil",
            message: result.message,
          });
          setScanResult(result);
        } else {
          throw new Error(result.message || "Gagal memproses absensi");
        }
      } catch (error) {
        setAlert({
          type: "error",
          title: "Gagal",
          message: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error("Camera error:", err);
    setAlert({
      type: "error",
      title: "Error",
      message: "Gagal mengakses kamera. Pastikan kamera dalam keadaan aktif.",
    });
  };

  const handleDismiss = () => {
    setAlert(null);
    setScanResult(null);
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

              {alert && (
                <Alert
                  className={`mb-4 ${
                    alert.type === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  {alert.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle
                    className={
                      alert.type === "success"
                        ? "text-green-800"
                        : "text-red-800"
                    }
                  >
                    {alert.title}
                  </AlertTitle>
                  <AlertDescription
                    className={
                      alert.type === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }
                  >
                    {alert.message}
                  </AlertDescription>
                </Alert>
              )}

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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              )}

              <div className="text-center space-y-4">
                {scanResult ? (
                  <button
                    onClick={handleDismiss}
                    className="bg-green-500 text-white px-8 py-2 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Scan Lagi
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="bg-red-500 text-white px-8 py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Tutup
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <Background />
      </div>
    </div>
  );
}

export default ScanQr;
