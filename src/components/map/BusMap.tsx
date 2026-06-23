"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { BusMarker } from "@/components/map/BusMarker";
import type { BusLocation } from "@/types/bus";

const SEOUL_CITY_HALL = {
  latitude: 37.5663,
  longitude: 126.9779,
};

interface BusMapProps {
  location: BusLocation;
}

function MapPositionUpdater({ location }: BusMapProps) {
  const map = useMap();

  useEffect(() => {
    map.setView([location.latitude, location.longitude], map.getZoom(), {
      animate: true,
    });
  }, [location.latitude, location.longitude, map]);

  return null;
}

export default function BusMap({ location }: BusMapProps) {
  return (
    <div className="h-[420px] overflow-hidden rounded border border-slate-200 bg-white">
      <MapContainer
        center={[location.latitude, location.longitude]}
        className="h-full w-full"
        scrollWheelZoom
        zoom={14}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapPositionUpdater location={location} />
        <BusMarker location={location} />
      </MapContainer>
    </div>
  );
}

export { SEOUL_CITY_HALL };
