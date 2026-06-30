"use client";

import { useEffect, useRef } from "react";
import type { Issue } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/types";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/constants";

interface IssueMapProps {
  issues: Issue[];
  selectedId?: string;
  onSelect?: (issue: Issue) => void;
  interactive?: boolean;
  height?: string;
}

export default function IssueMap({
  issues,
  selectedId,
  onSelect,
  interactive = true,
  height = "100%",
}: IssueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, {
        scrollWheelZoom: interactive,
        dragging: interactive,
        zoomControl: interactive,
      }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      }).addTo(map);

      mapInstance.current = map;
      updateMarkers(L, map);
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    import("leaflet").then((L) => {
      updateMarkers(L, mapInstance.current!);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issues, selectedId]);

  function updateMarkers(L: typeof import("leaflet"), map: L.Map) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    issues.forEach((issue) => {
      const isSelected = issue.id === selectedId;
      const color = CATEGORY_COLORS[issue.category];

      const marker = L.circleMarker([issue.location.lat, issue.location.lng], {
        radius: isSelected ? 12 : 8,
        fillColor: color,
        color: isSelected ? "#059669" : "#fff",
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-family:sans-serif;min-width:180px">
          <strong style="font-size:13px">${issue.title}</strong>
          <p style="font-size:11px;color:#64748b;margin:4px 0">${issue.status.replace("_", " ")}</p>
        </div>`
      );

      if (onSelect) {
        marker.on("click", () => onSelect(issue));
      }

      markersRef.current.push(marker);
    });

    if (selectedId) {
      const selected = issues.find((i) => i.id === selectedId);
      if (selected) {
        map.setView([selected.location.lat, selected.location.lng], 15, {
          animate: true,
        });
      }
    }
  }

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%" }}
      className="rounded-xl z-0"
    />
  );
}
