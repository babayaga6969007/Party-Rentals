const GalleryImage = require("../models/GalleryImage");
const { uploadImagesToCloudinary } = require("../utils/upload");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ============================================
// GET ALL GALLERY IMAGES (PUBLIC)
// ============================================
exports.getGalleryImages = async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = { isActive: true };
    if (category && (category === "signage" || category === "vinyl-wraps")) {
      query.category = category;
    }

    const images = await GalleryImage.find(query)
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    return res.status(200).json({ images });
  } catch (err) {
    console.error("GET GALLERY IMAGES ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ============================================
// GET ALL GALLERY IMAGES (ADMIN - INCLUDES INACTIVE)
// ============================================
exports.getAdminGalleryImages = async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = {};
    if (category && (category === "signage" || category === "vinyl-wraps")) {
      query.category = category;
    }

    const images = await GalleryImage.find(query)
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    return res.status(200).json({ images });
  } catch (err) {
    console.error("GET ADMIN GALLERY IMAGES ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ============================================
// UPLOAD GALLERY IMAGE (ADMIN)
// ============================================
exports.uploadGalleryImage = async (req, res) => {
  try {
    const { title, subtitle, category, order } = req.body;

    if (!title || !category) {
      return res.status(400).json({ 
        message: "Title and category are required" 
      });
    }

    if (category !== "signage" && category !== "vinyl-wraps") {
      return res.status(400).json({ 
        message: "Category must be 'signage' or 'vinyl-wraps'" 
      });
    }

    if (!req.files || !req.files.image || !req.files.image[0]) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const file = req.files.image[0];

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "party-rentals/gallery",
      resource_type: "image",
    });

    // Delete temp file
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      console.log("Temp file cleanup skipped:", e.message);
    }

    // Save to database
    const galleryImage = await GalleryImage.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || "",
      category,
      image: {
        url: result.secure_url,
        public_id: result.public_id,
      },
      order: order ? Number(order) : 0,
      isActive: true,
    });

    return res.status(201).json({ 
      message: "Image uploaded successfully",
      image: galleryImage 
    });
  } catch (err) {
    console.error("UPLOAD GALLERY IMAGE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ============================================
// UPDATE GALLERY IMAGE (ADMIN)
// ============================================
exports.updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, category, order, isActive } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (subtitle !== undefined) updates.subtitle = subtitle?.trim() || "";
    if (category !== undefined) {
      if (category !== "signage" && category !== "vinyl-wraps") {
        return res.status(400).json({ 
          message: "Category must be 'signage' or 'vinyl-wraps'" 
        });
      }
      updates.category = category;
    }
    if (order !== undefined) updates.order = Number(order);
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    // Handle new image upload if provided
    if (req.files && req.files.image && req.files.image[0]) {
      const file = req.files.image[0];
      
      // Get existing image to delete from Cloudinary
      const existing = await GalleryImage.findById(id);
      if (existing && existing.image?.public_id) {
        try {
          await cloudinary.uploader.destroy(existing.image.public_id);
        } catch (e) {
          console.log("Cloudinary delete error:", e.message);
        }
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "party-rentals/gallery",
        resource_type: "image",
      });

      // Delete temp file
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.log("Temp file cleanup skipped:", e.message);
      }

      updates.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const updated = await GalleryImage.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Image not found" });
    }

    return res.status(200).json({ 
      message: "Image updated successfully",
      image: updated 
    });
  } catch (err) {
    console.error("UPDATE GALLERY IMAGE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ============================================
// DELETE GALLERY IMAGE (ADMIN)
// ============================================
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await GalleryImage.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete from Cloudinary
    if (image.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(image.image.public_id);
      } catch (e) {
        console.log("Cloudinary delete error:", e.message);
      }
    }

    // Delete from database
    await GalleryImage.findByIdAndDelete(id);

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("DELETE GALLERY IMAGE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};
