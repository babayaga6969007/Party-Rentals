const cloudinary = require("../config/cloudinary");

exports.uploadImagesToCloudinary = async (files) => {
  let uploadedImages = [];

  for (let file of files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "party-rentals/products",
    });

    uploadedImages.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  return uploadedImages;
};
