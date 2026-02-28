const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const uploadVinylImage = require("../middleware/uploadVinylImage");
const uploadVinylPrintingFile = require("../middleware/uploadVinylPrintingFile");

// Public: upload vinyl wrap image (used when adding to cart)
router.post(
  "/vinyl-image",
  uploadVinylImage.single("image"),
  uploadController.uploadVinylImage
);

// Public: upload vinyl printing artwork (AI, SVG, PDF, PNG, etc.)
router.post(
  "/vinyl-printing-file",
  uploadVinylPrintingFile.single("file"),
  uploadController.uploadVinylPrintingFile
);

module.exports = router;
