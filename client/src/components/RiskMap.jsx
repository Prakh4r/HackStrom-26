import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export default function RiskMap({ originName, originCoords, destinationName, destinationCoords, riskScore, weather, alternativeRoutes }) {
  const destCoords = destinationCoords || [51.9482, 4.0623];
  const startCoords = originCoords || [1.3521, 103.8198];

  const generateCurve = (start, end) => {
    const points = [];
    const midLat = (start[0] + end[0]) / 2 + 10;
    const midLng = (start[1] + end[1]) / 2;
    for (let t = 0; t <= 1; t += 0.05) {
      const lat = Math.pow(1 - t, 2) * start[0] + 2 * (1 - t) * t * midLat + Math.pow(t, 2) * end[0];
      const lng = Math.pow(1 - t, 2) * start[1] + 2 * (1 - t) * t * midLng + Math.pow(t, 2) * end[1];
      points.push([lat, lng]);
    }
    return points;
  };
  
  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
  const pathColor = riskLevel === 'high' ? '#EF4444' : riskLevel === 'medium' ? '#F97316' : '#14B8A6';
  
  const mapCenter = originCoords ? null : destCoords;
  const mapBounds = originCoords ? [originCoords, destCoords] : null;

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-2xl">
      <div className="absolute inset-0 z-0">
        <MapContainer 
          {...(mapBounds ? { bounds: mapBounds } : { center: mapCenter, zoom: 6 })}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#0F172A' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <TileLayer
            url="https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=6919c20a3dbd182173a492be7cbd0ae0"
            opacity={0.5}
          />
          <TileLayer
            url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=6919c20a3dbd182173a492be7cbd0ae0"
            opacity={0.6}
          />
          
          <Circle 
            center={destCoords} 
            radius={riskScore * 5000}
            pathOptions={{ color: pathColor, fillColor: pathColor, className: 'pulsing-radius' }}
          />
          
          <Marker position={startCoords} icon={icons.low}>
            <Popup>
              <strong>{originName || 'Origin Hub'}</strong><br />
              Dispatch Facility
            </Popup>
          </Marker>

          <Marker position={destCoords} icon={icons[riskLevel]}>
            <Popup>
              <strong>{destinationName || 'Destination Hub'}</strong><br />
              Status: {riskLevel === 'high' ? 'Heavy Congestion' : 'Open'}<br />
              Risk Level: {riskScore}/100<br />
              Weather: {weather?.description || 'Unknown'}
            </Popup>
          </Marker>

          <Polyline 
            positions={generateCurve(startCoords, destCoords)} 
            color={pathColor}
            weight={4}
            opacity={0.8}
            className="animated-path"
          />

           {alternativeRoutes && alternativeRoutes.length > 0 && (
             <>
               <Marker position={[destCoords[0] + 2, destCoords[1] + 2]} icon={icons.low}>
                 <Popup>
                   <strong>Alternate Route ({alternativeRoutes[0].mode})</strong><br/>
                   Reason: {alternativeRoutes[0].reason}
                 </Popup>
               </Marker>
               <Polyline 
                 positions={[[destCoords[0] + 2, destCoords[1] + 2], destCoords]} 
                 color="#14B8A6" 
                 weight={4}
                 className="animated-path"
               />
             </>
           )}
        </MapContainer>

        <div className="pointer-events-none absolute right-4 top-4 z-[400] flex flex-col gap-3 rounded-xl border border-slate-700/50 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
          <div className="flex justify-between gap-6 text-sm">
            <span className="font-semibold uppercase tracking-wider text-slate-500 text-[10px]">Journey</span>
            <span className="font-medium text-slate-200">{(originName || 'ORG').slice(0,3).toUpperCase()} ➝ {(destinationName || 'DST').slice(0,3).toUpperCase()}</span>
          </div>
          <div className="flex justify-between gap-6 text-sm border-t border-slate-700/50 pt-2">
            <span className="font-semibold uppercase tracking-wider text-slate-500 text-[10px]">Risk Profile</span>
            <span className="font-bold" style={{ color: pathColor }}>{riskScore}/100</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-3 rounded-full border border-slate-700/50 bg-slate-900/80 px-4 py-2 shadow-lg backdrop-blur-md">
          <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-orange-500' : 'bg-teal-500'}`} />
          <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">Live Geospatial Monitoring</span>
        </div>
      </div>
    </div>
  );
}
