import React from 'react';
import { DoorState, SensorData, SystemConfig } from '../types';
import { Sun, Moon, Battery, AlertTriangle, MoveVertical, Timer } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
  doorState: DoorState;
  sensorData: SensorData;
  config: SystemConfig;
  setSensorData: React.Dispatch<React.SetStateAction<SensorData>>;
  toggleDoor: () => void;
  triggerFeed: () => void;
  isFeederRunning: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  doorState,
  sensorData,
  config,
  setSensorData,
  toggleDoor,
  triggerFeed,
  isFeederRunning
}) => {
  // Generate some dummy history data for the chart based on current light level
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    light: Math.max(0, Math.min(100, sensorData.lightLevel + Math.sin(i * 0.5) * 20 - 10))
  }));

  const getDoorStatusColor = (status: DoorState) => {
    switch (status) {
      case DoorState.OPEN: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case DoorState.CLOSED: return 'bg-slate-100 text-slate-700 border-slate-200';
      case DoorState.JAMMED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Overview</h2>
          <p className="text-slate-500">Real-time status of the coop controller.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
             <Battery className="w-5 h-5 text-emerald-500" />
             <span className="font-mono font-medium">{sensorData.batteryVoltage.toFixed(1)}V</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Door Control Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 p-3 rounded-bl-xl border-b border-l text-xs font-bold uppercase tracking-wider ${getDoorStatusColor(doorState)}`}>
            {doorState}
          </div>

          {/* Jam Detection Overlay */}
          {doorState === DoorState.JAMMED && (
            <div className="absolute inset-0 z-20 bg-red-50/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 border-2 border-red-200 m-2 rounded-lg animate-pulse">
               <AlertTriangle className="w-12 h-12 text-red-600 mb-2" />
               <h3 className="text-red-800 font-bold text-lg">DOOR JAMMED</h3>
               <p className="text-red-600 text-sm mb-3">Obstruction detected during movement.</p>
               <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-mono">Auto-Reversing...</span>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <MoveVertical className="w-5 h-5 text-slate-400" />
              Door Control
            </h3>
          </div>
          
          <div className="flex flex-col items-center justify-center py-6">
             <div className={`w-24 h-32 border-4 rounded-t-full relative transition-all duration-700 ${doorState === DoorState.OPEN ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 bg-slate-100'}`}>
                <div 
                  className={`absolute bottom-0 left-0 w-full bg-slate-800 transition-all duration-1000 ease-in-out border-t-2 border-slate-600`}
                  style={{ height: doorState === DoorState.OPEN ? '5%' : (doorState === DoorState.CLOSED ? '100%' : '50%') }}
                ></div>
             </div>
          </div>

          <button 
            onClick={toggleDoor}
            disabled={doorState === DoorState.OPENING || doorState === DoorState.CLOSING || doorState === DoorState.JAMMED}
            className="w-full mt-4 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {doorState === DoorState.CLOSED ? 'Force Open' : 'Force Close'}
          </button>
        </div>

        {/* Feeder Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="mb-4 flex justify-between items-start">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Timer className="w-5 h-5 text-slate-400" />
              Auto Feeder
            </h3>
            {isFeederRunning && <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-500">Next Feed</span>
              <span className="font-mono font-medium">{config.feedTimeEvening}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-500">Duration</span>
              <span className="font-mono font-medium">{config.feedDurationSec}s</span>
            </div>

            <button 
              onClick={triggerFeed}
              disabled={isFeederRunning}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                isFeederRunning 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:scale-95'
              }`}
            >
              {isFeederRunning ? 'Dispensing...' : 'Dispense Now'}
            </button>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2 lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Sun className="w-5 h-5 text-slate-400" />
              Light Simulation
            </h3>
            <p className="text-xs text-slate-400 mt-1">Simulate LDR readings to test logic.</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm font-medium text-slate-600">
              <span className="flex items-center gap-1"><Moon size={16}/> Night</span>
              <span className="text-slate-900 font-bold">{sensorData.lightLevel}%</span>
              <span className="flex items-center gap-1"><Sun size={16}/> Day</span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sensorData.lightLevel}
              onChange={(e) => setSensorData(prev => ({...prev, lightLevel: parseInt(e.target.value)}))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="p-2 bg-slate-50 rounded border border-slate-100 text-center">
                Close Threshold: &lt; {config.sunsetThreshold}%
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100 text-center">
                Open Threshold: &gt; {config.sunriseThreshold}%
              </div>
            </div>
          </div>
        </div>

        {/* Light Level History Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">24h Light Levels</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="light" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};