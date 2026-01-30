const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const uploadVinylImage = require("../middleware/uploadVinylImage");

// Public: upload vinyl wrap image (used when adding to cart)
router.post(
  "/vinyl-image",
  uploadVinylImage.single("image"),
  uploadController.uploadVinylImage
);

module.exports = router;
