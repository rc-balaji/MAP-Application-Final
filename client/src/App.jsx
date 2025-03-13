// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RouteList from "./RouteList"; // Import the RouteList component
import Map from "./Map"; // Import the MapComponent to show the route
import MapComponent from "./MapComponent";
import GoogleMapComponent from "./GCPMap";

const App = () => {
  return (
    <Router>
      <div>
        <h1>Route Planner</h1>
        <Routes>
          <Route path="/" element={<RouteList />} /> {/* RouteList component */}
          <Route path="/map/:routeId" element={<Map />} /> {/* Map component */}
          <Route
            path="/map/:routeId/gcp"
            element={<GoogleMapComponent />}
          />{" "}
          {/* Map component */}
          <Route path="/createmap" element={<MapComponent />} />{" "}
          {/* Map component */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
