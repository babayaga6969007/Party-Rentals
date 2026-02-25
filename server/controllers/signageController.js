const Signage = require("../models/Signage");
const { uploadImagesToCloudinary } = require("../utils/upload");
const cloudinary = require("../config/cloudinary");

// Create signage
exports.createSignage = async (req, res) => {
  try {
    const {
      productId,
      name,
      texts,
      backgroundType,
      backgroundColor,
      canvasWidth,
      canvasHeight,
      backgroundImageUrl,
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    let backgroundImage = null;

    // Handle background image upload
    if (backgroundType === "image") {
      if (req.files && req.files.length > 0) {
        // Upload new image file
        const uploaded = await uploadImagesToCloudinary(req.files);
        backgroundImage = uploaded[0] || null;
      } else if (backgroundImageUrl) {
        // Use base64 URL (for client-side generated images)
        // Convert base64 to Cloudinary upload
        try {
          const uploadResult = await cloudinary.uploader.upload(
            backgroundImageUrl,
            {
              folder: "signage-backgrounds",
            }
          );
          backgroundImage = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
          };
        } catch (err) {
          console.error("Failed to upload background image:", err);
          // Continue without image if upload fails
        }
      }
    }

    const signage = await Signage.create({
      productId,
      name: name || "",
      texts: JSON.parse(texts || "[]"),
      backgroundType,
      backgroundColor: backgroundColor || "#FFFFFF",
      backgroundImage,
      canvasWidth: Number(canvasWidth) || 800,
      canvasHeight: Number(canvasHeight) || 600,
    });

    res.json({
      message: "Signage created successfully",
      signage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all signages
exports.getAllSignages = async (req, res) => {
  try {
    const { productId } = req.query;
    const query = productId ? { productId } : {};

    const signages = await Signage.find(query)
      .populate("productId", "title images")
      .sort({ createdAt: -1 });

    res.json({ signages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get single signage
exports.getSignage = async (req, res) => {
  try {
    const signage = await Signage.findById(req.params.id).populate(
      "productId",
      "title images pricePerDay"
    );

    if (!signage) {
      return res.status(404).json({ message: "Signage not found" });
    }

    // Increment view count if shared
    if (signage.metadata.shareable) {
      signage.metadata.viewCount += 1;
      await signage.save();
    }

    res.json({ signage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get signage by share token
exports.getSignageByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const signage = await Signage.findOne({
      "metadata.shareToken": token,
      "metadata.shareable": true,
    }).populate("productId", "title images pricePerDay");

    if (!signage) {
      return res.status(404).json({ message: "Signage not found or not shareable" });
    }

    // Increment view count
    signage.metadata.viewCount += 1;
    await signage.save();

    res.json({ signage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Update signage
exports.updateSignage = async (req, res) => {
  try {
    const {
      name,
      texts,
      backgroundType,
      backgroundColor,
      backgroundImageUrl,
    } = req.body;

    const signage = await Signage.findById(req.params.id);

    if (!signage) {
      return res.status(404).json({ message: "Signage not found" });
    }

    if (name) signage.name = name;
    if (texts) signage.texts = JSON.parse(texts);
    if (backgroundType) signage.backgroundType = backgroundType;
    if (backgroundColor) signage.backgroundColor = backgroundColor;

    // Handle background image update
    if (backgroundType === "image") {
      if (req.files && req.files.length > 0) {
        // Delete old image if exists
        if (signage.backgroundImage?.public_id) {
          await cloudinary.uploader.destroy(signage.backgroundImage.public_id);
        }
        // Upload new image
        const uploaded = await uploadImagesToCloudinary(req.files);
        signage.backgroundImage = uploaded[0] || null;
      } else if (backgroundImageUrl && !req.files) {
        // Update with base64 URL
        try {
          if (signage.backgroundImage?.public_id) {
            await cloudinary.uploader.destroy(signage.backgroundImage.public_id);
          }
          const uploadResult = await cloudinary.uploader.upload(
            backgroundImageUrl,
            {
              folder: "signage-backgrounds",
            }
          );
          signage.backgroundImage = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
          };
        } catch (err) {
          console.error("Failed to upload background image:", err);
        }
      }
    } else if (backgroundType === "color") {
      // Remove image if switching to color
      if (signage.backgroundImage?.public_id) {
        await cloudinary.uploader.destroy(signage.backgroundImage.public_id);
      }
      signage.backgroundImage = null;
    }

    await signage.save();

    res.json({
      message: "Signage updated successfully",
      signage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Delete signage
exports.deleteSignage = async (req, res) => {
  try {
    const signage = await Signage.findById(req.params.id);

    if (!signage) {
      return res.status(404).json({ message: "Signage not found" });
    }

    // Delete background image from Cloudinary
    if (signage.backgroundImage?.public_id) {
      await cloudinary.uploader.destroy(signage.backgroundImage.public_id);
    }

    await Signage.findByIdAndDelete(req.params.id);

    res.json({ message: "Signage deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Generate share token
exports.generateShareToken = async (req, res) => {
  try {
    const signage = await Signage.findById(req.params.id);

    if (!signage) {
      return res.status(404).json({ message: "Signage not found" });
    }

    const token = signage.generateShareToken();
    await signage.save();

    res.json({
      message: "Share token generated",
      shareToken: token,
      shareUrl: `/signage/share/${token}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Disable sharing
exports.disableSharing = async (req, res) => {
  try {
    const signage = await Signage.findById(req.params.id);

    if (!signage) {
      return res.status(404).json({ message: "Signage not found" });
    }

    signage.metadata.shareable = false;
    signage.metadata.shareToken = null;
    await signage.save();

    res.json({ message: "Sharing disabled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
