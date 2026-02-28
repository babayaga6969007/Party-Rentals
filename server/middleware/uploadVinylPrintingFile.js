const multer = require("multer");
const path = require("path");
const os = require("os");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `vinyl-printing-${Date.now()}${ext}`);
  },
});

// Image/artwork file only: AI, SVG, PNG, JPG, PDF
const allowedMimes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "application/postscript", // .ai
  "application/illustrator",
];
const allowedExt = /\.(pdf|png|jpe?g|svg|ai)$/i;

function fileFilter(req, file, cb) {
  const ok = file.mimetype && allowedMimes.includes(file.mimetype);
  const extOk = path.extname(file.originalname || "").match(allowedExt);
  if (ok || extOk) {
    cb(null, true);
  } else {
    cb(new Error("Image file only. Allowed: AI, SVG, PNG, JPG, PDF."), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

module.exports = upload;
