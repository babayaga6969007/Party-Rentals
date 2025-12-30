const express = require("express");
const router = express.Router();
const multer = require("multer");

const authAdmin = require("../middleware/authAdmin");
const categoryController = require("../controllers/categoryController");

// Multer (optional – keep if you plan images later)
const path = require("path");


const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .jpg, .png
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

/* =========================
   PUBLIC ROUTES
========================= */

// Get all categories
router.get("/", categoryController.getCategories);

// Get category by slug (optional / future use)
router.get("/:slug", categoryController.getCategoryBySlug);

/* =========================
   ADMIN ROUTES
========================= */

// Create category
router.post(
  "/",
  authAdmin,
  upload.single("image"),
  categoryController.createCategory
);


// Update category
router.put(
  "/:id",
  authAdmin,
  upload.single("image"),
  categoryController.updateCategory
);


// Delete category
router.delete(
  "/:id",
  authAdmin,
  categoryController.deleteCategory
);

module.exports = router;
