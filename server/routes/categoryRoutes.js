const express = require("express");
const router = express.Router();

const authAdmin = require("../middleware/authAdmin");
const categoryController = require("../controllers/categoryController");
const upload = require("../middleware/uploadProductImages");

// PUBLIC
router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// ADMIN
router.post(
  "/",
  authAdmin,
  upload.single("image"),   // ✅ Cloudinary
  categoryController.createCategory
);

router.put(
  "/:id",
  authAdmin,
  upload.single("image"),   // ✅ Cloudinary
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authAdmin,
  categoryController.deleteCategory
);

module.exports = router;
