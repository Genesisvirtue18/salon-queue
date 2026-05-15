import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";

// 🔥 THIS WILL MOVE MAP WHEN LAT/LNG CHANGE
function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 13);
    }
  }, [lat, lng]);

  return null;
}

function LocationPicker({ editedData, setEditedData }) {

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        setEditedData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
      }
    });

    return null;
  };

  const lat = parseFloat(editedData.latitude) || 28.6139;
  const lng = parseFloat(editedData.longitude) || 77.2090;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      className="w-full h-64 rounded-lg"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 🔥 THIS FIXES MAP MOVEMENT */}
      <RecenterMap lat={lat} lng={lng} />

      <Marker position={[lat, lng]} />

      <LocationMarker />
    </MapContainer>
  );
}

export default LocationPicker;