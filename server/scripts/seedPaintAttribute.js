const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const Attribute = require("../models/Attribute");

// Paint files in client/public/paint/ – option label (display) and filename
const PAINT_OPTIONS = [
  { label: "Black", file: "BLACK.png" },
  { label: "Blue", file: "BLUE.png" },
  { label: "Cream", file: "CREAM.png" },
  { label: "Gray", file: "GRAY.png" },
  { label: "Green", file: "GREEN.png" },
  { label: "Khaki", file: "KHAKI.png" },
  { label: "Lavender", file: "LAVENDER.png" },
  { label: "Light Blue", file: "LIGHT BLUE.png" },
  { label: "Light Pink", file: "LIGHT PINK.png" },
  { label: "Light Green", file: "LIGHTGREEN.png" },
  { label: "Orange", file: "ORANGE.png" },
  { label: "Pink", file: "PINK.png" },
  { label: "Red", file: "RED.png" },
  { label: "White", file: "WHITE.png" },
  { label: "Yellow", file: "YELLOW.png" },
];

const seedPaintAttribute = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    let paintGroup = await Attribute.findOne({ slug: "paint" });

    if (!paintGroup) {
      paintGroup = await Attribute.create({
        name: "Paint",
        slug: "paint",
        type: "paint",
        required: false,
        options: [],
      });
      console.log("✅ Created 'Paint' attribute group");
    } else {
      console.log("⚠️  Paint attribute group already exists.");
    }

    let added = 0;
    for (const { label, file } of PAINT_OPTIONS) {
      const exists = paintGroup.options.some(
        (o) => o.label.toLowerCase() === label.toLowerCase()
      );
      if (exists) continue;

      paintGroup.options.push({
        label,
        value: file,
        imageUrl: `/paint/${file}`,
        isActive: true,
        sortOrder: paintGroup.options.length,
      });
      added++;
    }

    if (added > 0) {
      await paintGroup.save();
      console.log(`✅ Added ${added} paint option(s) to Paint group`);
    } else {
      console.log("   All paint options already exist. Nothing to add.");
    }

    console.log("\n📝 Next steps:");
    console.log("   1. Go to Admin → Add Product (or edit a product)");
    console.log("   2. In Attributes, select the 'Paint' group and choose which paint options the product offers");
    console.log("   3. On the product page, customers will see paint options as image swatches");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

seedPaintAttribute();
