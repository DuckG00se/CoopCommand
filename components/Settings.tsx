import React from 'react';
import { SystemConfig } from '../types';
import { Save } from 'lucide-react';

interface SettingsProps {
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
}

export const Settings: React.FC<SettingsProps> = ({ config, setConfig }) => {
  const handleChange = (key: keyof SystemConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">System Configuration</h2>
        
        <div className="space-y-6">
          {/* Light Thresholds */}
          <div className="pb-6 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Door Logic (LDR)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sunrise Threshold (%)</label>
                <input 
                  type="number" 
                  value={config.sunriseThreshold} 
                  onChange={(e) => handleChange('sunriseThreshold', parseInt(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-slate-400 mt-1">Light level to OPEN door</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sunset Threshold (%)</label>
                <input 
                  type="number" 
                  value={config.sunsetThreshold} 
                  onChange={(e) => handleChange('sunsetThreshold', parseInt(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-slate-400 mt-1">Light level to CLOSE door</p>
              </div>
            </div>
          </div>

          {/* Feed Schedule */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Feeding Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Morning Feed (HH:MM)</label>
                <input 
                  type="time" 
                  value={config.feedTimeMorning}
                  onChange={(e) => handleChange('feedTimeMorning', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Evening Feed (HH:MM)</label>
                <input 
                  type="time" 
                  value={config.feedTimeEvening} 
                  onChange={(e) => handleChange('feedTimeEvening', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Feed Duration (Seconds)</label>
                <input 
                  type="number" 
                  value={config.feedDurationSec} 
                  onChange={(e) => handleChange('feedDurationSec', parseInt(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};