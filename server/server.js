const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Route = require("./models/Route.js");

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(
  "mongodb+srv://covailabs4:KRISHtec5747@cluster0.ny4i2.mongodb.net/routes?retryWrites=true&w=majority&appName=Cluster0"
);

app.post("/api/save-route", async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();
    res.status(200).send("Route saved successfully.");
  } catch (error) {
    res.status(400).send("Error saving route.");
  }
});

// API to get only route names (GET)
app.get("/routes/names", async (req, res) => {
  try {
    const routes = await Route.find().select("name _id"); // Only return the name and _id
    res.json(routes); // Send the list of route names
  } catch (error) {
    res.status(500).send("Error fetching route names.");
  }
});

// API to get the details of a particular route by ID (GET)
app.get("/routes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const route = await Route.findById(id);
    if (!route) {
      return res.status(404).send("Route not found.");
    }
    res.json(route); // Send the full route details (source, destination, points)
  } catch (error) {
    res.status(500).send("Error fetching route details.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
