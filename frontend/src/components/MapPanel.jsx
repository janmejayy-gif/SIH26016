import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { stateSummary } from "../data/dashboardData.js";
import { riskColor } from "../utils/projectUtils.js";
import { useOutletContext } from "react-router-dom";

function MapEvents({ onStateClick }) {
  const map = useMap();
  useEffect(() => {
    map.on("click", () => onStateClick(null));
    return () => map.off("click", () => onStateClick(null));
  }, [map, onStateClick]);
  return null;
}

function StateLayer({ geojson, selectedState, onStateClick, riskData }) {
  const style = (feature) => {
    const stateName = feature.properties.NAME_1;
    const summary = riskData.find((s) => s.state === stateName);
    const tone = summary?.tone || "green";
    const isSelected = selectedState === stateName;
    return {
      fillColor: riskColor(tone === "green" ? "Low" : tone === "amber" ? "Medium" : tone === "orange" ? "High" : "Critical"),
      weight: isSelected ? 3 : 1.5,
      opacity: 1,
      color: isSelected ? "#1d4ed8" : "#ffffff",
      fillOpacity: isSelected ? 0.7 : 0.5,
      dashArray: "3",
    };
  };

  const highlight = {
    weight: 3,
    color: "#1d4ed8",
    fillOpacity: 0.8,
    bringToFront: true,
  };

  const onEachFeature = (feature, layer) => {
    const stateName = feature.properties.NAME_1;
    layer.on({
      click: (e) => {
        e.originalEvent.stopPropagation();
        onStateClick(stateName);
      },
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle(highlight);
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(style(feature));
      },
    });
    // Bind permanent tooltip with state name
    layer.bindTooltip(stateName, {
      permanent: true,
      direction: "center",
      className: "state-label-tooltip",
      offset: [0, 0],
      sticky: true,
    });
  };

  return (
    <GeoJSON
      data={geojson}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

function MapLegend() {
  const map = useMap();
  const legend = useRef(null);

  useEffect(() => {
    if (!legend.current) return;
    const div = legend.current;
    div.innerHTML = `
      <div style="padding: 8px 12px; font-size: 12px; line-height: 1.5;">
        <div style="font-weight: 600; margin-bottom: 6px; color: #10294b;">Risk Level</div>
        <div style="display: flex; align-items: center; gap: 6px; margin: 3px 0;">
          <span style="width: 14px; height: 14px; border-radius: 3px; background: #16a34a;"></span>
          <span style="color: #33475e;">Low</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; margin: 3px 0;">
          <span style="width: 14px; height: 14px; border-radius: 3px; background: #d97706;"></span>
          <span style="color: #33475e;">Medium</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; margin: 3px 0;">
          <span style="width: 14px; height: 14px; border-radius: 3px; background: #ea580c;"></span>
          <span style="color: #33475e;">High</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; margin: 3px 0;">
          <span style="width: 14px; height: 14px; border-radius: 3px; background: #dc2626;"></span>
          <span style="color: #33475e;">Critical</span>
        </div>
      </div>
    `;
    legend.current = div;
  }, []);

  return (
    <div ref={legend} className="leaflet-control leaflet-bar" style={{ background: "white", padding: "0", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
  );
}

export default function MapPanel({ selectedState, onSelectState }) {
  const { openProject } = useOutletContext();
  const [geojson, setGeojson] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    fetch("/data/india-states.geojson")
      .then((res) => res.json())
      .then((data) => {
        setGeojson(data);
        setMapReady(true);
      })
      .catch((err) => {
        console.error("Failed to load India states GeoJSON:", err);
        setMapReady(true);
      });
  }, []);

  const handleStateClick = (stateName) => {
    if (stateName) {
      onSelectState(stateName);
    }
  };

  const selectedProject = useMemo(() => {
    if (!selectedState) return null;
    const projects = window.__LADI_PROJECTS__ || [];
    const inState = projects.filter((p) => p.state === selectedState);
    if (inState.length === 0) return null;
    return [...inState].sort((a, b) => b.probability - a.probability)[0];
  }, [selectedState]);

  const summary = stateSummary.find((s) => s.state === selectedState);

  if (!mapReady) {
    return (
      <div className="map-canvas card" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="placeholder-panel">
          <h3>Loading map...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="map-canvas card" style={{ minHeight: "500px", position: "relative" }}>
      <div style={{ position: "relative", width: "100%", height: "480px", overflow: "hidden" }}>
        <MapContainer
          center={[22.5, 80]}
          zoom={4.5}
          minZoom={4}
          maxZoom={8}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geojson && (
            <StateLayer
              geojson={geojson}
              selectedState={selectedState}
              onStateClick={handleStateClick}
              riskData={stateSummary}
            />
          )}
          <MapEvents onStateClick={handleStateClick} />
          <MapLegend />
        </MapContainer>
      </div>
    </div>
  );
}