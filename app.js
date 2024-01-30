// app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const { config } = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

config();

const app = express();

// Middleware
app.use(
	cors({
		origin: "http://localhost:3000", // Replace with your frontend's domain
		credentials: true,
	})
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Routes
app.use("/auth", authRoutes);

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
