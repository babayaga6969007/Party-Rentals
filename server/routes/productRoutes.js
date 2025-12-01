const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const authAdmin = require("../middleware/authAdmin");
const productController = require("../controllers/productController");

// Admin routes
router.post(
  "/admin/add",
  authAdmin,
  upload.array("images", 8),
  productController.addProduct
);

router.put(
  "/admin/edit/:id",
  authAdmin,
  upload.array("images", 8),
  productController.editProduct
);

router.delete("/admin/delete/:id", authAdmin, productController.deleteProduct);

// Public routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getSingleProduct);

module.exports = router;
