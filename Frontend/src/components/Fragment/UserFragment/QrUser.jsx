import React, { useState, useEffect } from "react";
import { Clock, MapPin } from "lucide-react";

function QrUser() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch attendance data
      const attendanceResponse = await fetch(
        "http://localhost:3000/api/absen/absensi?page=1&limit=1",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!attendanceResponse.ok) {
        throw new Error("Failed to fetch attendance data");
      }
      
      const attendanceResult = await attendanceResponse.json();

      if (attendanceResult.success && attendanceResult.data[0]) {
        const latestRecord = attendanceResult.data[0];
        const formattedData = {
          id: latestRecord.id,
          tanggal: new Date(latestRecord.tanggal).toLocaleDateString("id-ID"),
          waktu_masuk: latestRecord.waktu_masuk
            ? new Date(latestRecord.waktu_masuk).toLocaleTimeString("id-ID")
            : null,
          waktu_keluar: latestRecord.waktu_keluar
            ? new Date(latestRecord.waktu_keluar).toLocaleTimeString("id-ID")
            : null,
          status_kehadiran: latestRecord.status_kehadiran || "-",
          status_masuk: latestRecord.status_masuk || "-",
          dalam_radius: latestRecord.dalam_radius || false,
        };
        setAttendanceData(formattedData);
      }

      // Fetch QR code data
      const qrResponse = await fetch(
        "http://localhost:3000/api/user/profileQr",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!qrResponse.ok) {
        throw new Error("Failed to fetch QR code");
      }
      
      const qrData = await qrResponse.json();
      if (qrData.success && qrData.data.qr_code) {
        // If QR code starts with 'data:image', it's a base64 image
        if (qrData.data.qr_code.startsWith('data:image')) {
          setQrCodeUrl(qrData.data.qr_code);
        } else {
          // Otherwise, it's a file path
          setQrCodeUrl(`http://localhost:3000/${qrData.data.qr_code}`);
        }
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toLocaleDateString("id-ID");
    return dateString === today;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 md:p-8 mb-6">
        <div className="p-4 text-center">
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-4 md:p-8 mb-6">
        <div className="p-4 text-center text-red-500">
          <p>Error: {error}</p>
          <button
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isTodayAttendance = attendanceData && isToday(attendanceData.tanggal);

  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-8 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          {qrCodeUrl ? (
            <div className="flex flex-col items-center">
              <img 
                src={qrCodeUrl}
                alt="QR Code" 
                className="w-64 h-64 object-contain"
              />
              <p className="text-gray-600 mt-2">QR Code Anda</p>
            </div>
          ) : (
            <div className="w-64 h-64 flex items-center justify-center border border-gray-200 rounded-lg">
              <p className="text-gray-500">QR Code tidak tersedia</p>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-6">Status Absensi Hari Ini</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Clock className="text-blue-500" />
              <div>
                <div className="text-gray-600">Jam Masuk</div>
                <div className="font-medium">
                  {isTodayAttendance && attendanceData.waktu_masuk
                    ? attendanceData.waktu_masuk
                    : "Belum Absen"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="text-green-500" />
              <div>
                <div className="text-gray-600">Status Lokasi</div>
                <div className="font-medium">
                  {isTodayAttendance ? (
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        attendanceData.dalam_radius
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {attendanceData.dalam_radius
                        ? "Dalam Radius"
                        : "Luar Radius"}
                    </span>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="text-red-500" />
              <div>
                <div className="text-gray-600">Jam Keluar</div>
                <div className="font-medium">
                  {isTodayAttendance && attendanceData.waktu_keluar
                    ? attendanceData.waktu_keluar
                    : "Belum Absen"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QrUser;