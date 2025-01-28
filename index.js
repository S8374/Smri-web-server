require('dotenv').config(); // Load environment variables from .env file
const express = require("express");
const knex = require("knex");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Configure Knex
const db = knex({
  client: 'mysql2',
  connection: {
    connectionLimit: 10,
    host: '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Fetch all products
app.get("/products", async (req, res) => {
  try {
    const products = await db("products");
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Add a product to "added_Items" table
app.post("/add-product", async (req, res) => {
  const { addedID, title, userEmail, price, image_url, userName, size } = req.body;

  try {
    await db.schema.hasTable("added_Items").then(async (exists) => {
      if (!exists) {
        await db.schema.createTable("added_Items", (table) => {
          table.increments("id").primary();
          table.integer("addedID").notNullable();
          table.string("title").notNullable();
          table.string("userEmail").notNullable();
          table.decimal("price", 10, 2).notNullable();
          table.text("image_url").notNullable();
          table.string("userName").notNullable();
          table.string("size").notNullable();
          table.timestamps(true, true);
        });
        console.log('Table "added_Items" created successfully');
      }
    });

    const existingItem = await db("added_Items").where({ addedID, userEmail }).first();
    if (existingItem) {
      return res.status(400).json({ message: "This product is already added to your cart.", addedID });
    }

    await db("added_Items").insert({ addedID, title, userEmail, price, image_url, userName, size });
    res.status(201).json({ message: "Product added successfully", addedID });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Fetch all items from "added_Items"
app.get("/added-items", async (req, res) => {
  try {
    const addedItems = await db("added_Items");
    res.json(addedItems);
  } catch (err) {
    console.error("Error fetching added items:", err);
    res.status(500).json({ error: "Failed to fetch added items" });
  }
});

// Fetch user-specific items
app.get("/added-items/:userEmail", async (req, res) => {
  const { userEmail } = req.params;

  try {
    const userItems = await db("added_Items").where({ userEmail }).select();
    res.json(userItems);
  } catch (err) {
    console.error("Error fetching user-specific items:", err);
    res.status(500).json({ error: "Failed to fetch items for the user" });
  }
});

// Delete item by ID from "added_Items"
app.delete("/added-items/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCount = await db("added_Items").where({ id }).del();
    if (deletedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Item deleted successfully", id });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// Add a product to "WishList"
app.post("/wishlist", async (req, res) => {
  const { addedID, title, userEmail, price, image_url, userName, size } = req.body;

  try {
    await db.schema.hasTable("WishList").then(async (exists) => {
      if (!exists) {
        await db.schema.createTable("WishList", (table) => {
          table.increments("id").primary();
          table.integer("addedID").notNullable();
          table.string("title").notNullable();
          table.string("userEmail").notNullable();
          table.decimal("price", 10, 2).notNullable();
          table.text("image_url").notNullable();
          table.string("userName").notNullable();
          table.string("size").notNullable();
          table.timestamps(true, true);
        });
        console.log('Table "WishList" created successfully');
      }
    });

    const existingItem = await db("WishList").where({ addedID, userEmail }).first();
    if (existingItem) {
      return res.status(400).json({ message: "This product is already added to your wishlist.", addedID });
    }

    await db("WishList").insert({ addedID, title, userEmail, price, image_url, userName, size });
    res.status(201).json({ message: "Product added successfully", addedID });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Fetch all items from "WishList"
app.get("/wishlist", async (req, res) => {
  try {
    const wishlistItems = await db("WishList");
    res.json(wishlistItems);
  } catch (err) {
    console.error("Error fetching wishlist items:", err);
    res.status(500).json({ error: "Failed to fetch wishlist items" });
  }
});

// Fetch user-specific items from "WishList"
app.get("/wishlist/:userEmail", async (req, res) => {
  const { userEmail } = req.params;

  try {
    const favItems = await db("WishList").where({ userEmail }).select();
    res.json(favItems);
  } catch (err) {
    console.error("Error fetching user-specific wishlist items:", err);
    res.status(500).json({ error: "Failed to fetch items for the user" });
  }
});

// Delete item by ID from "WishList"
app.delete("/wishlist/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCount = await db("WishList").where({ id }).del();
    if (deletedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Item deleted successfully", id });
  } catch (err) {
    console.error("Error deleting wishlist item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// Test MySQL Connection and Start Server
(async function testConnection() {
  try {
    await db.raw("SELECT 1");
    console.log("Connected to the MySQL server");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Error connecting to the MySQL server:", err);
  }
})();
