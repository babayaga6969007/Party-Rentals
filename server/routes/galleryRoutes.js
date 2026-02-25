const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authAdmin = require("../middleware/authAdmin");
const galleryController = require("../controllers/galleryController");

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });

// ============ PUBLIC ROUTES ============
router.get("/", galleryController.getGalleryImages);

// ============ ADMIN ROUTES ============
router.get("/admin", authAdmin, galleryController.getAdminGalleryImages);
router.post(
  "/admin/upload",
  authAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  galleryController.uploadGalleryImage
);
router.put(
  "/admin/:id",
  authAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  galleryController.updateGalleryImage
);
router.delete("/admin/:id", authAdmin, galleryController.deleteGalleryImage);

module.exports = router;
