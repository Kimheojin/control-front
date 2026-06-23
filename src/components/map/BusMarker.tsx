"use client";

import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { BusLocation } from "@/types/bus";
import { formatDateTime } from "@/lib/format";

const busIcon = L.divIcon({
  className: "",
  html: '<div class="bus-marker" aria-hidden="true"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface BusMarkerProps {
  location: BusLocation;
}

export function BusMarker({ location }: BusMarkerProps) {
  return (
    <Marker
      icon={busIcon}
      position={[location.latitude, location.longitude]}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-semibold">현재 위치</p>
          <p>{formatDateTime(location.recordedAt)}</p>
        </div>
      </Popup>
    </Marker>
  );
}
