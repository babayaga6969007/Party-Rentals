const express = require("express");
const router = express.Router();
const multer = require("multer");

const authAdmin = require("../middleware/authAdmin");
const categoryController = require("../controllers/categoryController");

// Multer (optional – keep if you plan images later)
const upload = multer({ dest: "uploads/" });

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
  upload.array("images", 1),
  categoryController.createCategory
);

// Update category
router.put(
  "/:id",
  authAdmin,
  upload.array("images", 1),
  categoryController.updateCategory
);

// Delete category
router.delete(
  "/:id",
  authAdmin,
  categoryController.deleteCategory
);

module.exports = router;
