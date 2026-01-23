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
  { name: "images", maxCount: 10 },           // product images
  { name: "variationImages_0", maxCount: 1 },
  { name: "variationImages_1", maxCount: 1 },
  { name: "variationImages_2", maxCount: 1 },
  { name: "variationImages_3", maxCount: 1 },
  { name: "variationImages_4", maxCount: 1 },
  { name: "variationImages_5", maxCount: 1 },
  { name: "variationImages_6", maxCount: 1 },
  { name: "variationImages_7", maxCount: 1 },
  { name: "variationImages_8", maxCount: 1 },
  { name: "variationImages_9", maxCount: 1 },
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



// Delete product
router.delete("/admin/delete/:id", authAdmin, productController.deleteProduct);

// ============ PUBLIC ROUTES ============

router.get("/", productController.getProducts);
router.get("/:id", productController.getSingleProduct);

module.exports = router;
