import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import { configurePassport } from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in .env");
}
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required in .env");
}
if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
  throw new Error(
    "FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are required in .env",
  );
}

await mongoose.connect(process.env.MONGODB_URI);
configurePassport();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (_req, res) => {
  res.json({ message: "Facebook Login Backend is running" });
});

app.use("/auth", authRoutes);
app.use("/api", userRoutes);

app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  res.status(500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
