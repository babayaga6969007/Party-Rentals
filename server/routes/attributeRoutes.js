const express = require("express");
const router = express.Router();

const authAdmin = require("../middleware/authAdmin");
const attributeController = require("../controllers/attributeController");

// ✅ BASE PUBLIC (IMPORTANT)
router.get("/", attributeController.getAllAttributesGrouped);

// PUBLIC (by type)
router.get("/:type", attributeController.getAttributesByType);

// ADMIN
router.post("/admin/create", authAdmin, attributeController.createAttribute);
router.put("/admin/update/:id", authAdmin, attributeController.updateAttribute);
router.delete("/admin/delete/:id", authAdmin, attributeController.deleteAttribute);

module.exports = router;
