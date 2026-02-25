const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const signageController = require("../controllers/signageController");
const authAdmin = require("../middleware/authAdmin");

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

const upload = multer({ storage });

// Public routes
router.post("/create", upload.single("backgroundImage"), signageController.createSignage);
router.get("/", signageController.getAllSignages);
router.get("/:id", signageController.getSignage);
router.get("/share/:token", signageController.getSignageByToken);

// Admin routes
router.put("/admin/:id", authAdmin, upload.single("backgroundImage"), signageController.updateSignage);
router.delete("/admin/:id", authAdmin, signageController.deleteSignage);
router.post("/admin/:id/share", authAdmin, signageController.generateShareToken);
router.post("/admin/:id/unshare", authAdmin, signageController.disableSharing);

module.exports = router;
