import React from "react";

function RiwayatAbsensi() {
  const attendanceData = [
    {
      tanggal: "13 Jan 2024",
      status: "Hadir",
      waktu: "08:00:23",
      ketepatan: "Telat",
      keterangan: "-",
    },
  ];
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Riwayat Absensi</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4">Tanggal</th>
              <th className="text-left py-4">Status</th>
              <th className="text-left py-4">Waktu</th>
              <th className="text-left py-4">Ketepatan Waktu</th>
              <th className="text-left py-4">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-4">{item.tanggal}</td>
                <td className="py-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {item.status}
                  </span>
                </td>
                <td className="py-4">{item.waktu}</td>
                <td className="py-4">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                    {item.ketepatan}
                  </span>
                </td>
                <td className="py-4">{item.keterangan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">Showing 1 to 10 of 20 entries</p>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
            Previous
          </button>
          <button className="px-4 py-2 border rounded bg-gray-50">1</button>
          <button className="px-4 py-2 border rounded hover:bg-gray-50">
            2
          </button>
          <button className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default RiwayatAbsensi;
