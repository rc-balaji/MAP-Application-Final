import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { KEY } from "./Key";

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

const GoogleMapComponent = () => {
  const { routeId } = useParams();
  const [routeDetails, setRouteDetails] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [destinationDistance, setDestinationDistance] = useState(null);

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

  // Calculate the total route distance
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

  // Calculate the distance from the current location to the destination
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

  // Set random location every 2 seconds
  useEffect(() => {
    if (routeDetails && routeDetails.points) {
      const interval = setInterval(() => {
        const randomPoint =
          routeDetails.points[
            Math.floor(Math.random() * routeDetails.points.length)
          ];
        setCurrentLocation(randomPoint);
      }, 2000);

      return () => clearInterval(interval); // Clean up on unmount
    }
  }, [routeDetails]);

  const getGoogleMapsUrl = () => {
    if (routeDetails && routeDetails.points && routeDetails.points.length > 1) {
      const points = routeDetails.points;
      const totalPoints = points.length;
      const stop1 = points[Math.floor(totalPoints * 0.25)];
      const stop2 = points[Math.floor(totalPoints * 0.5)];
      const stop3 = points[Math.floor(totalPoints * 0.75)];
      const destination = points[totalPoints - 1];

      const sourceLatLng = `${points[0].lat},${points[0].lng}`;
      const stop1LatLng = `${stop1.lat},${stop1.lng}`;
      const stop2LatLng = `${stop2.lat},${stop2.lng}`;
      const stop3LatLng = `${stop3.lat},${stop3.lng}`;
      const destinationLatLng = `${destination.lat},${destination.lng}`;

      return `https://www.google.com/maps/dir/?api=1&origin=${sourceLatLng}&destination=${destinationLatLng}&waypoints=${stop1LatLng}|${stop2LatLng}|${stop3LatLng}&travelmode=driving`;
    }
    return "#";
  };

  const libraries = ["places"];
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
      <LoadScript googleMapsApiKey={KEY}>
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={
              routeDetails &&
              routeDetails.points &&
              routeDetails.points.length > 0
                ? {
                    lat: routeDetails.points[0].lat,
                    lng: routeDetails.points[0].lng,
                  }
                : { lat: 0, lng: 0 } // Fallback default coordinates
            }
            zoom={12}
          >
            {routeDetails && routeDetails.points && (
              <>
                {/* Marker for Source */}
                <Marker
                  position={{
                    lat: routeDetails.points[0].lat,
                    lng: routeDetails.points[0].lng,
                  }}
                >
                  <InfoWindow>
                    <div>
                      <strong>Source</strong>
                      <br />
                      Latitude: {routeDetails.points[0].lat}
                      <br />
                      Longitude: {routeDetails.points[0].lng}
                    </div>
                  </InfoWindow>
                </Marker>

                {/* Marker for Destination */}
                <Marker
                  position={{
                    lat: routeDetails.points[routeDetails.points.length - 1]
                      .lat,
                    lng: routeDetails.points[routeDetails.points.length - 1]
                      .lng,
                  }}
                >
                  <InfoWindow>
                    <div>
                      <strong>Destination</strong>
                      <br />
                      Latitude:{" "}
                      {routeDetails.points[routeDetails.points.length - 1].lat}
                      <br />
                      Longitude:{" "}
                      {routeDetails.points[routeDetails.points.length - 1].lng}
                    </div>
                  </InfoWindow>
                </Marker>

                {/* Polyline for the route */}
                <Polyline
                  path={routeDetails.points.map((point) => ({
                    lat: point.lat,
                    lng: point.lng,
                  }))}
                  options={{
                    strokeColor: "#0000FF",
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                  }}
                />
              </>
            )}

            {/* Marker for current random location */}
            {currentLocation && (
              <Marker
                position={{
                  lat: currentLocation.lat,
                  lng: currentLocation.lng,
                }}
              >
                <InfoWindow>
                  <div>
                    <strong>Current Location</strong>
                    <br />
                    Latitude: {currentLocation.lat}
                    <br />
                    Longitude: {currentLocation.lng}
                  </div>
                </InfoWindow>
              </Marker>
            )}
          </GoogleMap>
        </div>
      </LoadScript>
    </div>
  );
};

export default GoogleMapComponent;
