const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/**
 * Upload vinyl wrap design (image or PDF) to Cloudinary.
 * Accepts JPG, JPEG, PDF. Returns { url } - Cloudinary secure URL.
 */
exports.uploadVinylImage = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "File is required (JPG, JPEG, or PDF)" });
    }

    const isPdf = req.file.mimetype === "application/pdf";
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "party-rentals/vinyl",
      resource_type: isPdf ? "raw" : "image",
    });

    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.log("Temp file cleanup skipped:", e.message);
    }

    return res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload vinyl image error:", err);
    return res.status(500).json({ message: err.message || "Upload failed" });
  }
};

/**
 * Upload vinyl printing artwork (PDF, PNG, JPEG, SVG, AI, etc.) to Cloudinary.
 * Returns { url } - Cloudinary secure URL.
 */
exports.uploadVinylPrintingFile = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "File is required (PDF, PNG, JPEG, SVG, AI, etc.)" });
    }

    const isPdf = req.file.mimetype === "application/pdf";
    const isSvg = req.file.mimetype === "image/svg+xml";
    const isImage = (req.file.mimetype || "").startsWith("image/");
    const resourceType = isPdf ? "raw" : isImage || isSvg ? "image" : "raw";

    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "party-rentals/vinyl-printing",
      resource_type: resourceType,
    });

    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.log("Temp file cleanup skipped:", e.message);
    }

    return res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload vinyl printing file error:", err);
    return res.status(500).json({ message: err.message || "Upload failed" });
  }
};
