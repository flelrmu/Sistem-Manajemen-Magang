import React from "react";
import { ArrowUpDown } from "lucide-react";

function RiwayatPengumpulan() {
  const submissionHistory = [
    {
      versi: "v1.2",
      tanggal: "13 Jan 2024",
      status: "In Review",
      feedback: "Menunggu review dari pembimbing",
      file: "Download",
    },
    {
      versi: "v1.1",
      tanggal: "10 Jan 2024",
      status: "Need Revision",
      feedback: "Perlu penambahan pada bab metodologi",
      file: "Download",
    },
  ];
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Riwayat Pengumpulan</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-4">Versi</th>
              <th className="text-left py-4 px-4">Tanggal</th>
              <th className="text-left py-4 px-4">Status</th>
              <th className="text-left py-4 px-4">Feedback</th>
              <th className="text-left py-4 px-4">File</th>
            </tr>
          </thead>
          <tbody>
            {submissionHistory.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-4 px-4">{item.versi}</td>
                <td className="py-4 px-4">{item.tanggal}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.status === "In Review"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-4">{item.feedback}</td>
                <td className="py-4 px-4">
                  <button className="text-blue-600 hover:underline inline-flex items-center">
                    <ArrowUpDown className="mr-1 h-4 w-4" />
                    {item.file}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RiwayatPengumpulan;
