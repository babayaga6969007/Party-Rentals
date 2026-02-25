const multer = require("multer");
const cloudinary = require("../config/cloudinary");
console.log("DEBUG cloudinary.v2.uploader exists:", !!cloudinary.v2?.uploader);

const CloudinaryStorage = require("multer-storage-cloudinary");

const storage = CloudinaryStorage({
  cloudinary, // ✅ ROOT object
  params: {
    folder: "party-rentals/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });
module.exports = upload;
