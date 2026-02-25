const express = require("express");
const router = express.Router();

const authAdmin = require("../middleware/authAdmin");
const categoryController = require("../controllers/categoryController");
const upload = require("../middleware/uploadCategoryImage");

// PUBLIC
router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// ADMIN
router.post(
  "/",
  upload.single("image"),
  authAdmin,
  categoryController.createCategory
);

router.put(
  "/:id",
  upload.single("image"),
  authAdmin,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authAdmin,
  categoryController.deleteCategory
);

module.exports = router;
