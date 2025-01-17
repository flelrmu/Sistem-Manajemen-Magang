import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import { Link } from "react-router-dom";
import Background from "../Elements/Items/bg";
import Logo from "../Elements/Logo/Logo";

function ScanQr() {
  const [scanResult, setScanResult] = useState(null);

  const handleScan = (data) => {
    if (data) {
      setScanResult(data.text);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const scannerSize = 280;
  
  const previewStyle = {
    height: scannerSize,
    width: scannerSize,
    objectFit: 'cover',
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
                Scan QR Code
              </h2>

              <div className="relative mb-8 flex items-center justify-center">
                <div 
                  className="relative"
                  style={containerStyle}
                >
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

              {scanResult && (
                <div className="text-center mb-4">
                  <p className="text-green-500">Scan Result: {scanResult}</p>
                </div>
              )}
              
              <div className="text-center">
                <Link
                  to="/login"
                  className="bg-red-500 text-white px-8 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Tutup
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
                  linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
                  linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)
                `,
                backgroundSize: "40px 40px",
                backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
              }}
            ></div>
          </div>
        </div>
      </div>
      <Background />
    </div>
  );
}

export default ScanQr;