import mongoose from "mongoose";
import { config } from "dotenv";
import Blog from "./src/models/blog.model.js";
import { v2 as cloudinary } from "cloudinary";
import { db } from "../mehndi/src/data.js";
import fs from "fs";
import path from "path";

config();

const MONGO_URI = "mongodb+srv://asaman9568:HwOnA7staK4qbWkR@mehndi-artistry.yqxra4o.mongodb.net/";
cloudinary.config({
  cloud_name: "doygze5gg",
  api_key: "191131639249343",
  api_secret: "G3d2A7z5psZDzgSF7bPziBR1W4Q",
});

const seedBlogs = async () => {
  try {
    if (!MONGO_URI) throw new Error("MongoDB URI is missing");
    await mongoose.connect(MONGO_URI);

    const imageBasePath = path.resolve("..", "mehndi", "mehndi", "public"); // Fixed

    for (const blog of db) {
      const imagePath = path.join(imageBasePath, blog.src); // Use imageBasePath here

      if (!fs.existsSync(imagePath)) {
        console.log(`Image not found: ${blog.title} -> ${imagePath}`);
        continue;
      }

      const fileData = fs.readFileSync(imagePath, { encoding: "base64" });

      const uploadResponse = await cloudinary.uploader.upload(
        `data:image/webp;base64,${fileData}`,
        { folder: "designs" }
      );

      if (!uploadResponse?.secure_url) {
        console.log(`Failed to upload: ${blog.title}`);
        continue;
      }

      await new Blog({
        title: blog.title,
        about: blog.about,
        time: blog.time,
        src: uploadResponse.secure_url,
      }).save();

      console.log(`Seeded: ${blog.title}`);
    }

    console.log("All blogs seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedBlogs();
