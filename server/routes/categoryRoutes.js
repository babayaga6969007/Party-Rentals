const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const authAdmin = require("../middleware/authAdmin");
const categoryController = require("../controllers/categoryController");

// PUBLIC
router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// ADMIN
router.post("/admin/create", authAdmin, upload.array("images", 1), categoryController.createCategory);
router.put("/admin/update/:id", authAdmin, upload.array("images", 1), categoryController.updateCategory);
router.delete("/admin/delete/:id", authAdmin, categoryController.deleteCategory);

module.exports = router;
