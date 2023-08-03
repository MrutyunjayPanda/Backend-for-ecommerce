const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(express.json());

const SECRET = "TRIVEOUS";

// Define mongoose schemas

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageLink: String,
  price: Number,
});

// // Define mongoose models
const Admin = mongoose.model("Admin", adminSchema);
const Product = mongoose.model("Product", productSchema);

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

mongoose.connect(
  "mongodb+srv://pandatechnology:21l8BWOQk1hnqbus@cluster0.t1g0bj7.mongodb.net/E-commerce-API",
  { useNewUrlParser: true, useUnifiedTopology: true, dbName: "E-commerce-API" }
);

app.post("/admin/signup", (req, res) => {
  const { username, password } = req.body;
  function callback(admin) {
    if (admin) {
      res.status(403).json({ message: "Admin already exists" });
    } else {
      const obj = { username: username, password: password };
      const newAdmin = new Admin(obj);
      newAdmin.save();
      const token = jwt.sign({ username, role: "admin" }, SECRET, {
        expiresIn: "1h",
      });
      res.json({ message: "Admin created successfully", token });
    }
  }
  Admin.findOne({ username }).then(callback);
});

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.headers;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});

app.post("/admin/products", authenticateJwt, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json({
    message: "New product added successfully",
    productId: product.id,
  });
});

app.put("/admin/products/:productId", authenticateJwt, async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.productId,
    req.body,
    {
      new: true,
    }
  );
  if (product) {
    res.json({ message: "Product updated successfully" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

app.get("/admin/products", authenticateJwt, async (req, res) => {
  const products = await Product.find({});
  res.json({ products });
});

app.listen(3000, () => console.log("Server running on port 3000"));
