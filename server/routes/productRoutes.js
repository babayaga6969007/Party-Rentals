
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Middleware & controllers
const authAdmin = require("../middleware/authAdmin");
const productController = require("../controllers/productController");

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure server/uploads exists
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },

  // ✅ allow up to 50 variation images safely
  ...Array.from({ length: 50 }).map((_, i) => ({
  name: `variationImages_${i}`,
  maxCount: 5,
}
)),
]);



// ============ ADMIN ROUTES ============

// Add new product
// Add new product
router.post(
  "/admin/add",
  authAdmin,
  uploadFields,
  productController.addProduct
);

// Edit product
router.put(
  "/admin/edit/:id",
  authAdmin,
  uploadFields,
  productController.editProduct
);

// Upload images for a single variation (queue: one variation at a time)
const uploadVariationImages = multer({ storage }).array("images", 5);
router.put(
  "/admin/edit/:id/variations/:variationIndex/images",
  authAdmin,
  uploadVariationImages,
  productController.uploadVariationImages
);

// Delete product
router.delete("/admin/delete/:id", authAdmin, productController.deleteProduct);

// ============ PUBLIC ROUTES ============

router.get("/", productController.getProducts);
router.get("/:id", productController.getSingleProduct);

module.exports = router;
