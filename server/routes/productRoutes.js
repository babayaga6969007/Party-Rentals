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

// ============ ADMIN ROUTES ============

// Add new product
router.post(
  "/admin/add",
  authAdmin,
  upload.array("images", 8),
  productController.addProduct
);

// Edit product
router.put(
  "/admin/edit/:id",
  authAdmin,
  upload.array("images", 8),
  productController.editProduct
);

// Delete product
router.delete("/admin/delete/:id", authAdmin, productController.deleteProduct);

// ============ PUBLIC ROUTES ============

router.get("/", productController.getProducts);
router.get("/:id", productController.getSingleProduct);

module.exports = router;
