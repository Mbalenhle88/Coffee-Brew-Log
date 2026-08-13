const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database using Sequelize ORM
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "coffee_brew.sqlite",
  logging: false
});

// Brew model
const Brew = sequelize.define("Brew", {
  bean_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brew_method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coffee_grams: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  water_grams: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  brew_time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// GET all brews + optional filter
app.get("/api/brews", async (req, res) => {
  try {
    const { method } = req.query;

    const where = method ? { brew_method: method } : {};

    const brews = await Brew.findAll({
      where,
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json(brews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brews" });
  }
});

// GET one brew
app.get("/api/brews/:id", async (req, res) => {
  try {
    const brew = await Brew.findByPk(req.params.id);

    if (!brew) {
      return res.status(404).json({ error: "Brew not found" });
    }

    res.status(200).json(brew);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brew" });
  }
});

// CREATE brew
app.post("/api/brews", async (req, res) => {
  try {
    const {
      bean_name,
      brew_method,
      coffee_grams,
      water_grams,
      brew_time,
      rating,
      notes
    } = req.body;

    if (
      !bean_name ||
      !brew_method ||
      coffee_grams === undefined ||
      water_grams === undefined ||
      !brew_time ||
      rating === undefined
    ) {
      return res.status(400).json({
        error: "All required fields must be supplied"
      });
    }

    const brew = await Brew.create({
      bean_name,
      brew_method,
      coffee_grams,
      water_grams,
      brew_time,
      rating,
      notes
    });

    res.status(201).json(brew);
  } catch (error) {
    res.status(500).json({ error: "Failed to create brew" });
  }
});

// UPDATE brew
app.put("/api/brews/:id", async (req, res) => {
  try {
    const brew = await Brew.findByPk(req.params.id);

    if (!brew) {
      return res.status(404).json({ error: "Brew not found" });
    }

    const {
      bean_name,
      brew_method,
      coffee_grams,
      water_grams,
      brew_time,
      rating,
      notes
    } = req.body;

    if (
      !bean_name ||
      !brew_method ||
      coffee_grams === undefined ||
      water_grams === undefined ||
      !brew_time ||
      rating === undefined
    ) {
      return res.status(400).json({
        error: "All required fields must be supplied"
      });
    }

    await brew.update({
      bean_name,
      brew_method,
      coffee_grams,
      water_grams,
      brew_time,
      rating,
      notes
    });

    res.status(200).json(brew);
  } catch (error) {
    res.status(500).json({ error: "Failed to update brew" });
  }
});

// DELETE brew
app.delete("/api/brews/:id", async (req, res) => {
  try {
    const brew = await Brew.findByPk(req.params.id);

    if (!brew) {
      return res.status(404).json({ error: "Brew not found" });
    }

    await brew.destroy();

    res.status(200).json({
      message: "Brew deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete brew" });
  }
});

// Start database and server
sequelize.sync().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error("Database error:", error);
});