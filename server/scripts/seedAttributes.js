const mongoose = require("mongoose");
require("dotenv").config({ path: "server/.env" });

const Attribute = require("../models/Attribute");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Attribute.deleteMany();

  await Attribute.insertMany([
    { type: "color", name: "Gold", value: "#FFD700" },
    { type: "color", name: "White", value: "#FFFFFF" },
    { type: "color", name: "Black", value: "#000000" },
    { type: "color", name: "Pastel Pink", value: "#FADADD" },

    { type: "tag", name: "Indoor" },
    { type: "tag", name: "Outdoor" },
    { type: "tag", name: "Luxury" },
    { type: "tag", name: "Minimal" },

    { type: "size", name: "Small" },
    { type: "size", name: "Medium" },
    { type: "size", name: "Large" },
  ]);

  console.log("✅ Attributes seeded");
  process.exit();
};

seed();
