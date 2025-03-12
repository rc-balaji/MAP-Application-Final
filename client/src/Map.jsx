import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Haversine formula to calculate the distance between two latitude/longitude points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in kilometers
  return distance;
};

const Map = () => {
  const { routeId } = useParams();
  const [routeDetails, setRouteDetails] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(null); // State to store the total distance
  const [destinationDistance, setDestinationDistance] = useState(null); // State to store the distance from current location to destination

  // Fetch route details based on route ID
  useEffect(() => {
    axios
      .get(`http://localhost:5000/routes/${routeId}`)
      .then((response) => {
        setRouteDetails(response.data);
      })
      .catch((error) => {
        console.error("Error fetching route details:", error);
      });
  }, [routeId]);

  // Dynamically update map center and zoom based on route points
  const MapUpdater = ({ routePoints }) => {
    const map = useMap();

    useEffect(() => {
      if (routePoints && routePoints.length > 0) {
        // Create bounds for the route
        const bounds = L.latLngBounds(
          routePoints.map((point) => [point.lat, point.lng])
        );
        map.fitBounds(bounds); // Fit the map to the bounds of the markers
      }
    }, [routePoints, map]);

    return null;
  };

  // Calculate distance between source and destination
  useEffect(() => {
    if (routeDetails && routeDetails.points) {
      const source = routeDetails.points[0];
      const destination = routeDetails.points[routeDetails.points.length - 1];

      const distance = haversineDistance(
        source.lat,
        source.lng,
        destination.lat,
        destination.lng
      );

      setDistance(distance.toFixed(2)); // Set the total distance in kilometers with 2 decimal places
    }
  }, [routeDetails]);

  // Calculate distance from current location to destination
  useEffect(() => {
    if (currentLocation && routeDetails && routeDetails.points) {
      const destination = routeDetails.points[routeDetails.points.length - 1];

      const distanceToDestination = haversineDistance(
        currentLocation.lat,
        currentLocation.lng,
        destination.lat,
        destination.lng
      );

      setDestinationDistance(distanceToDestination.toFixed(2)); // Set the distance to destination
    }
  }, [currentLocation, routeDetails]);

  const getGoogleMapsUrl = () => {
    if (routeDetails && routeDetails.points && routeDetails.points.length > 1) {
      const points = routeDetails.points;

      // Calculate the intermediate stops
      const totalPoints = points.length;
      const stop1 = points[Math.floor(totalPoints * 0.25)]; // 25%
      const stop2 = points[Math.floor(totalPoints * 0.5)]; // 50%
      const stop3 = points[Math.floor(totalPoints * 0.75)]; // 75%
      const destination = points[totalPoints - 1]; // 100%

      // Format points for Google Maps URL
      const sourceLatLng = `${points[0].lat},${points[0].lng}`;
      const stop1LatLng = `${stop1.lat},${stop1.lng}`;
      const stop2LatLng = `${stop2.lat},${stop2.lng}`;
      const stop3LatLng = `${stop3.lat},${stop3.lng}`;
      const destinationLatLng = `${destination.lat},${destination.lng}`;

      // Construct Google Maps URL with multiple stops
      return `https://www.google.com/maps/dir/?api=1&origin=${sourceLatLng}&destination=${destinationLatLng}&waypoints=${stop1LatLng}|${stop2LatLng}|${stop3LatLng}&travelmode=driving`;
    }
    return "#"; // Return empty link if route details are not available
  };

  // Set random location every 2 seconds
  useEffect(() => {
    if (routeDetails && routeDetails.points) {
      const interval = setInterval(() => {
        const randomPoint =
          routeDetails.points[
            Math.floor(Math.random() * routeDetails.points.length)
          ];
        setCurrentLocation(randomPoint);
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval); // Clean up on unmount
    }
  }, [routeDetails]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2>{routeDetails ? routeDetails.name : "Loading route details..."}</h2>

      {/* Display Distance at the top */}
      {distance && (
        <div style={{ margin: "20px", fontSize: "20px", fontWeight: "bold" }}>
          Total Distance: {distance} km
        </div>
      )}

      {/* Display Distance from Current Location to Destination */}
      {destinationDistance && (
        <div
          style={{
            margin: "20px",
            fontSize: "20px",
            fontWeight: "bold",
            color: "red",
          }}
        >
          Distance to Destination: {destinationDistance} km
        </div>
      )}

      {/* Button to open Google Maps with travel directions */}
      <button
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
        onClick={() => window.open(getGoogleMapsUrl(), "_blank")}
      >
        Open in Google Maps
      </button>

      {routeDetails && (
        <MapContainer
          style={{ width: "100%", height: "100%" }}
          center={[12.9716, 77.5946]} // Default center, will be adjusted dynamically
          zoom={12} // Default zoom, will be adjusted dynamically
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {routeDetails.points && (
            <>
              {/* Marker for Source (First Point) */}
              <Marker
                key="source"
                position={[
                  routeDetails.points[0].lat,
                  routeDetails.points[0].lng,
                ]}
                icon={
                  new L.Icon({
                    iconUrl:
                      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", // Default marker icon for source
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })
                }
              >
                <Popup>
                  <strong>Source</strong>
                  <br />
                  Latitude: {routeDetails.points[0].lat}
                  <br />
                  Longitude: {routeDetails.points[0].lng}
                </Popup>
              </Marker>

              {/* Marker for Destination (Last Point) */}
              <Marker
                key="destination"
                position={[
                  routeDetails.points[routeDetails.points.length - 1].lat,
                  routeDetails.points[routeDetails.points.length - 1].lng,
                ]}
                icon={
                  new L.Icon({
                    iconUrl:
                      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", // Default marker icon for destination
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })
                }
              >
                <Popup>
                  <strong>Destination</strong>
                  <br />
                  Latitude:{" "}
                  {routeDetails.points[routeDetails.points.length - 1].lat}
                  <br />
                  Longitude:{" "}
                  {routeDetails.points[routeDetails.points.length - 1].lng}
                </Popup>
              </Marker>

              {/* Polyline for the route */}
              <Polyline
                positions={routeDetails.points.map((point) => [
                  point.lat,
                  point.lng,
                ])}
                color="blue" // Color for the route line
                weight={4} // Line thickness
                opacity={0.7} // Line opacity
              />
            </>
          )}

          {/* Marker for current random location */}
          {currentLocation && (
            <Marker
              key="current-location"
              position={[currentLocation.lat, currentLocation.lng]}
              icon={
                new L.Icon({
                  iconUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", // Default marker icon for current location
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
                })
              }
            >
              <Popup>
                <strong>Current Location</strong>
                <br />
                Latitude: {currentLocation.lat}
                <br />
                Longitude: {currentLocation.lng}
              </Popup>
            </Marker>
          )}

          <MapUpdater routePoints={routeDetails.points} />
        </MapContainer>
      )}
    </div>
  );
};

export default Map;
