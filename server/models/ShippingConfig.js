const mongoose = require("mongoose");

const shippingConfigSchema = new mongoose.Schema(
  {
    // Distance-based pricing tiers
    distanceRanges: [
      {
        minDistance: { type: Number, required: true, min: 0 }, // Minimum distance in miles
        maxDistance: { 
          type: Number, 
          required: false, 
          default: null,
          validate: {
            validator: function(v) {
              // Allow null for unlimited, or a number >= 0
              return v === null || (typeof v === 'number' && v >= 0);
            },
            message: 'maxDistance must be null or a non-negative number'
          }
        }, // Maximum distance in miles (null for unlimited)
        label: { type: String, required: true }, // Display label (e.g., "0-25 miles")
        price: { type: Number, required: true, min: 0 }, // Round trip price
      },
    ],

    // Warehouse location for distance calculation
    warehouse: {
      address: { type: String, default: "2031 Via Burton Street, Suite A, USA" },
      lat: { type: Number, default: 34.0522 },
      lng: { type: Number, default: -118.2437 },
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure only one config document exists
shippingConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    // Create default config with distance ranges
    config = await this.create({
      distanceRanges: [
        { minDistance: 0, maxDistance: 25, label: "0-25 miles", price: 35 },
        { minDistance: 25, maxDistance: 50, label: "25-50 miles", price: 45 },
        { minDistance: 50, maxDistance: 100, label: "50-100 miles", price: 60 },
        { minDistance: 100, maxDistance: 200, label: "100-200 miles", price: 100 },
        { minDistance: 200, maxDistance: 300, label: "200-300 miles", price: 170 },
        { minDistance: 300, maxDistance: 500, label: "300-500 miles", price: 250 },
        { minDistance: 500, maxDistance: null, label: "500+ miles", price: 0 },
      ],
      warehouse: {
        address: "2031 Via Burton Street, Suite A, USA",
        lat: 34.0522,
        lng: -118.2437,
      },
      isActive: true,
    });
  } else {
    // Fix any existing documents with invalid maxDistance values
    // If maxDistance is undefined or invalid, set it to null for ranges that should be unlimited
    let needsUpdate = false;
    if (config.distanceRanges && Array.isArray(config.distanceRanges)) {
      config.distanceRanges = config.distanceRanges.map((range) => {
        // If maxDistance is undefined or invalid, and it's the last range or has a high minDistance, set to null
        if (range.maxDistance === undefined || (range.maxDistance !== null && range.maxDistance < range.minDistance)) {
          needsUpdate = true;
          // If it's a high range (500+), set to null for unlimited
          if (range.minDistance >= 500) {
            return { ...range, maxDistance: null };
          }
          // Otherwise, try to infer a reasonable maxDistance or set to null
          return { ...range, maxDistance: range.maxDistance || null };
        }
        return range;
      });
      
      if (needsUpdate) {
        try {
          await config.save();
        } catch (err) {
          // If save fails due to validation, delete and recreate
          console.warn("Failed to update existing config, recreating...", err);
          await this.deleteOne({ _id: config._id });
          return await this.getConfig(); // Recursive call to create new config
        }
      }
    }
  }
  return config;
};

module.exports = mongoose.model("ShippingConfig", shippingConfigSchema);
