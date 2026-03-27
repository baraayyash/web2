const express = require("express");
const path = require("path");
const chalk = require("chalk");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse JSON
app.use(express.json());

// HTML view: must be registered before static so it wins over public/products/
app.get("/products", (req, res) => {
  console.log(products);
  res.render("products", { products });
});

// Serve static HTML files
app.use(express.static(path.join(__dirname, "public")));

// In-memory product store
let products = [
  { id: 1, name: "Laptop", price: 1000 },
  { id: 2, name: "Phone", price: 500 }
];

let nextId = 3;

/* ------------------------
   CRUD API
-------------------------*/

// Get all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// Get one product
app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

// Create product
app.post("/api/products", (req, res) => {
  const { name, price } = req.body;

  const product = {
    id: nextId++,
    name,
    price
  };

  products.push(product);
  res.status(201).json(product);
});

// Update product
app.put("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const { name, price } = req.body;

  product.name = name ?? product.name;
  product.price = price ?? product.price;

  res.json(product);
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const deleted = products.splice(index, 1);
  res.json(deleted[0]);
});

/* ------------------------ */

app.listen(PORT, () => {
  console.log(chalk.green(`Server running on http://localhost:${PORT}`));
});
