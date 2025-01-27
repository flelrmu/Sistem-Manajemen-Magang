import React, { useState, useEffect } from "react";
import QrScanner from "react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../Context/UserContext";
import Background from "../Elements/Items/bg";
import Logo from "../Elements/Logo/Logo";

function ScanQr() {
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

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

        const response = await fetch("http://localhost:3000/api/absen/scan", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal memproses absensi");
        }

        const result = await response.json();

        if (result.success) {
          setAlert({
            type: "success",
            title: "Absensi Berhasil",
            message: result.message,
          });
          setScanResult(result);
          setShowSuccessDialog(true);
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
    setShowSuccessDialog(false);
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

              {alert && !showSuccessDialog && (
                <Alert 
                  severity={alert.type}
                  sx={{ mb: 2 }}
                >
                  <AlertTitle>{alert.title}</AlertTitle>
                  {alert.message}
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
                  <CircularProgress />
                </div>
              )}

              <div className="text-center space-y-4">
                {scanResult ? (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleDismiss}
                  >
                    Scan Lagi
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => navigate("/")}
                  >
                    Tutup
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <Background />
      </div>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Absensi Berhasil!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {scanResult?.message || "Proses absensi telah berhasil dilakukan."}
            {scanResult?.data && (
              <div style={{ marginTop: 16 }}>
                <p>Nama: {scanResult.data.nama}</p>
                <p>Waktu: {scanResult.data.waktu}</p>
                <p>Status: {scanResult.data.status}</p>
                {scanResult.data.dalam_radius !== undefined && (
                  <p>
                    Lokasi:{" "}
                    {scanResult.data.dalam_radius
                      ? "Dalam radius"
                      : "Di luar radius"}
                  </p>
                )}
              </div>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDismiss} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ScanQr;