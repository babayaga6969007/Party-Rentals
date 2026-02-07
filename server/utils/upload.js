const fs = require("fs").promises;
const cloudinary = require("../config/cloudinary");

exports.uploadImagesToCloudinary = async (files) => {
  const uploadedImages = [];

  for (const file of files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "party-rentals/products",
      resource_type: "image",
    });

    uploadedImages.push({
      public_id: result.public_id,
      url: result.secure_url,
    });

    // Remove temp file from disk after successful Cloudinary upload
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.warn("Could not delete temp upload file:", file.path, err.message);
    }
  }

  return uploadedImages;
};
