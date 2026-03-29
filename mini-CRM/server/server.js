import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import leadRoutes from "./routes/leadRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import authRoutes from "./routes/authRoutes.js";


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("CRM API Running...");
});
app.use("/api/leads", leadRoutes);
app.use("/api/leads", noteRoutes);

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.log(err));

  // Auth routes
app.use("/api/auth", authRoutes);
