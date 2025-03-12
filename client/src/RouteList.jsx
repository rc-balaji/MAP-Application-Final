import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RouteList = () => {
  const [routeNames, setRouteNames] = useState([]);
  const navigate = useNavigate();

  // Fetch the list of route names
  useEffect(() => {
    axios
      .get("http://localhost:5000/routes/names") // API to fetch only route names
      .then((response) => {
        setRouteNames(response.data); // Assuming response.data is an array of route names
      })
      .catch((error) => {
        console.error("Error fetching route names:", error);
      });
  }, []);

  // Redirect to the Map component with the selected route ID
  const handleRedirect = (routeId) => {
    navigate(`/map/${routeId}`); // Pass the route ID as a URL parameter
  };

  return (
    <div>
      <h2>Saved Routes</h2>
      <ul>
        {routeNames.map((route) => (
          <li key={route._id}>
            <div>
              <h3>{route.name}</h3>
              <button onClick={() => handleRedirect(route._id)}>
                View Route on Map
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RouteList;
