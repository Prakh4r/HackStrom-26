import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RiskMap.css';

// Fix Vite leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const getRiskIconUrl = (color) => `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;

const createIcon = (color) => new L.Icon({
  iconUrl: getRiskIconUrl(color),
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  high: createIcon('red'),
  medium: createIcon('orange'),
  low: createIcon('green')
};

export default function RiskMap({ destinationPort, destinationCoords, riskScore, weather, alternativeRoutes }) {
  // Use provided coords or fallback to default (e.g. Dubai)
  const coords = destinationCoords || [25.2048, 55.2708];
  
  // Determine risk level
  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
  
  return (
    <div className="risk-map-container">
      <h3 className="map-heading">🗺️ Global Risk Topology</h3>
      <div className="map-wrapper">
        <MapContainer 
          center={coords} 
          zoom={4} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        >
          {/* CartoDB Dark Matter base map for premium UI */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <Marker position={coords} icon={icons[riskLevel]}>
            <Popup className="dark-popup">
              <strong>{destinationPort || 'Destination'}</strong><br />
              Risk Level: {riskScore}/100<br />
              Weather: {weather?.description || 'Unknown'}
            </Popup>
          </Marker>

          {/* Simple visualization of an alternate node if alternatives exist */}
           {alternativeRoutes && alternativeRoutes.length > 0 && (
             <Marker position={[coords[0] + 5, coords[1] + 5]} icon={icons.low}>
               <Popup className="dark-popup">
                 <strong>Alternate Base Node</strong><br/>
                 Mode: {alternativeRoutes[0].mode}<br />
                 Reason: {alternativeRoutes[0].reason}
               </Popup>
             </Marker>
           )}

           {alternativeRoutes && alternativeRoutes.length > 0 && (
             <Polyline 
               positions={[coords, [coords[0] + 5, coords[1] + 5]]} 
               color="#c4fb6d" 
               dashArray="5, 10" 
             />
           )}
        </MapContainer>

        {/* Floating map statistics */}
        <div className="map-overlay-stats">
          <div className={`map-pulse-indicator ${riskLevel}`}></div>
          Live Geospatial Monitoring
        </div>
      </div>
    </div>
  );
}
