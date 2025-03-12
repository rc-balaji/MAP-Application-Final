const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
  name: String,
  source: String,
  destination: String,
  points: [
    {
      lat: Number,
      lng: Number,
    },
  ],
});

const Route = mongoose.model("Route", routeSchema);

module.exports = Route;
