import { CloudLightning, CloudRain, Sun, Wind, CloudFog, Cloud, Droplets } from 'lucide-react';

export default function WeatherCard({ weather }) {
  if (!weather || weather.error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-slate-600">
        <Cloud className="h-10 w-10 opacity-20 mb-3" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Signal Unavailable</p>
      </div>
    );
  }

  const getIcon = (description) => {
    const c = description?.toLowerCase() || '';
    if (c.includes('rain')) return <CloudRain className="h-10 w-10 text-cyan-400" />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className="h-10 w-10 text-amber-500" />;
    if (c.includes('clear') || c.includes('sun')) return <Sun className="h-10 w-10 text-yellow-400" />;
    if (c.includes('cloud')) return <Cloud className="h-10 w-10 text-slate-400" />;
    if (c.includes('fog') || c.includes('mist')) return <CloudFog className="h-10 w-10 text-slate-300" />;
    if (c.includes('wind')) return <Wind className="h-10 w-10 text-teal-400" />;
    if (c.includes('drizzle')) return <Droplets className="h-10 w-10 text-cyan-300" />;
    return <Cloud className="h-10 w-10 text-slate-400" />;
  };

  const { temp, description, wind_speed, humidity } = weather;

  return (
    <div className="flex h-full w-full flex-col relative">
      <h4 className="mb-6 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Atmospheric Signal</h4>
      
      <div className="flex flex-1 items-center gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-inner">
          {getIcon(description)}
        </div>
        <div>
          <div className="text-4xl font-black tracking-tighter text-white">{Math.round(temp)}°C</div>
          <div className="text-xs font-bold capitalize text-teal-400/80 tracking-wide mt-1">{description}</div>
        </div>
      </div>

      <div className="mt-8 flex gap-8 border-t border-white/5 pt-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-1">Velocity</span>
          <span className="text-base font-black text-white">{wind_speed} <small className="text-[10px] font-bold text-slate-500">KM/H</small></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 mb-1">Humidity</span>
          <span className="text-base font-black text-white">{humidity}<small className="text-[10px] font-bold text-slate-500">%</small></span>
        </div>
      </div>
    </div>
  );
}
