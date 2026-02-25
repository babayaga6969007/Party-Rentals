const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/**
 * Upload a single image to Cloudinary (vinyl wrap design).
 * Used by product page when user uploads custom vinyl image.
 * Returns { url } - Cloudinary secure URL (path stored in order addon).
 */
exports.uploadVinylImage = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "party-rentals/vinyl",
      resource_type: "image",
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
