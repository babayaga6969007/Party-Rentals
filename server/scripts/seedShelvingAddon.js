const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const Attribute = require("../models/Attribute");
const slugify = require("../utils/slugify");

const seedShelvingAddon = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find or create "Add-ons" group
    let addonGroup = await Attribute.findOne({ 
      type: "addon",
      slug: "add-ons"
    });

    if (!addonGroup) {
      // Try to find any addon group
      addonGroup = await Attribute.findOne({ type: "addon" });
      
      if (!addonGroup) {
        // Create new "Add-ons" group
        const slug = slugify("Add-ons");
        addonGroup = await Attribute.create({
          name: "Add-ons",
          slug: slug,
          type: "addon",
          required: false,
          options: []
        });
        console.log("✅ Created 'Add-ons' attribute group");
      }
    }

    // Check if "Shelving" option already exists
    const existingOption = addonGroup.options.find(
      opt => opt.label.toLowerCase() === "shelving" || 
             (opt.label.toLowerCase().includes("shelving") && !opt.label.toLowerCase().includes("tier"))
    );

    if (existingOption) {
      console.log(`⚠️  Shelving addon already exists: "${existingOption.label}"`);
      console.log("   Skipping creation.");
      process.exit(0);
    }

    // Add single "Shelving" option to the group
    addonGroup.options.push({
      label: "Shelving",
      priceDelta: 0, // Base price, actual price calculated in frontend based on tier/size/quantity
      isActive: true,
      sortOrder: addonGroup.options.length
    });

    await addonGroup.save();
    console.log("✅ Added 'Shelving' addon option to the Add-ons group");
    console.log(`   Group ID: ${addonGroup._id}`);
    console.log(`   Option ID: ${addonGroup.options[addonGroup.options.length - 1]._id}`);
    console.log("\n📋 Shelving Addon Features:");
    console.log("   • Tier A: 6 size options ($20-$43/shelf, up to 8 shelves)");
    console.log("   • Tier B: Single option ($29/shelf, up to 8 shelves)");
    console.log("   • Tier C: Single option ($50/shelf, max 1 shelf)");
    console.log("\n📝 Next steps:");
    console.log("   1. Go to Admin → Add Product (or edit existing product)");
    console.log("   2. In the Attributes section, find 'Add-ons' group");
    console.log("   3. Check the 'Shelving' checkbox to add it to the product");
    console.log("   4. Optionally set an override price (or leave 0 to use base price)");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

seedShelvingAddon();
