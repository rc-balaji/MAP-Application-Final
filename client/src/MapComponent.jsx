import React, { useState, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsService,
  DirectionsRenderer,
  Autocomplete,
} from "@react-google-maps/api";
import axios from "axios";
import { KEY } from "./Key";

const libraries = ["places"];
const mapContainerStyle = { width: "100vw", height: "100vh" };
const center = { lat: 12.9716, lng: 77.5946 }; // Default location (Bangalore)

const MapComponent = () => {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [marker, setMarker] = useState(null);
  const [userInput, setUserInput] = useState({
    name: "",
    source: "",
    destination: "",
  });

  const sourceRef = useRef(null);
  const destinationRef = useRef(null);
  const mapInstance = useRef(null);

  const handleStart = () => {
    if (source && destination) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: source,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const routePoints = result.routes[0].overview_path.map((point) => ({
              lat: point.lat(),
              lng: point.lng(),
            }));
            console.log("Route Points:", routePoints);
          } else {
            console.error("Error fetching directions", status);
          }
        }
      );
    }
  };

  const handlePlaceChange = (place, isSource) => {
    if (place.geometry) {
      const location = place.geometry.location;
      if (isSource) {
        setSource(location);
        setUserInput({ ...userInput, source: place.name });
      } else {
        setDestination(location);
        setUserInput({ ...userInput, destination: place.name });
      }

      if (marker) {
        marker.setMap(null); // Remove previous marker
      }
      const newMarker = new google.maps.Marker({
        position: location,
        map: mapInstance.current,
      });
      setMarker(newMarker);
    } else {
      window.alert("No details available for input: " + place.name);
    }
  };

  const handleSave = async () => {
    const data = {
      name: userInput.name,
      source: userInput.source,
      destination: userInput.destination,
      points: directions
        ? directions.routes[0].overview_path.map((point) => ({
            lat: point.lat(),
            lng: point.lng(),
          }))
        : [],
    };

    try {
      await axios.post("http://localhost:5000/api/save-route", data);
      alert("Route saved successfully!");
    } catch (error) {
      console.error("Error saving route:", error);
      alert("Error saving route.");
    }
  };

  return (
    <LoadScript googleMapsApiKey={KEY} libraries={libraries}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "10px",
        }}
      >
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) =>
              setUserInput({ ...userInput, name: e.target.value })
            }
            value={userInput.name}
          />
          <div>
            <Autocomplete
              onLoad={(ref) => (sourceRef.current = ref)}
              onPlaceChanged={() =>
                handlePlaceChange(sourceRef.current.getPlace(), true)
              }
            >
              <input type="text" placeholder="Enter Source" />
            </Autocomplete>
            <Autocomplete
              onLoad={(ref) => (destinationRef.current = ref)}
              onPlaceChanged={() =>
                handlePlaceChange(destinationRef.current.getPlace(), false)
              }
            >
              <input type="text" placeholder="Enter Destination" />
            </Autocomplete>
          </div>
          <button onClick={handleStart}>Start</button>
          <button onClick={handleSave}>Save</button>
        </div>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={center}
          onLoad={(map) => {
            mapInstance.current = map;
          }}
        >
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default MapComponent;
