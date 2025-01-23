// permissionRoutes.js
const db = require("../config/database");
const express = require("express");
const router = express.Router();
const absenController = require("../controllers/absenController");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/permissions",
  filename: function (req, file, cb) {
    cb(null, "permission-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Get permission categories
router.get("/categories", auth.verifyToken, async (req, res) => {
  try {
    const [categories] = await db.execute("SELECT * FROM kategori_izin");
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil kategori izin",
    });
  }
});

router.put(
  "/:id/status", // Ubah dari /:izinId/status
  auth.verifyToken,
  auth.isAdmin,
  auth.isResourceOwner,
  absenController.updateStatusIzin
);

// Submit permission request
router.post(
  "/submit",
  auth.verifyToken,
  auth.isMahasiswa,
  upload.single("file_bukti"),
  absenController.submitIzin
);

// Get permission history
router.get("/history", auth.verifyToken, absenController.getRiwayatIzin);

module.exports = router;
