import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Logs } from './components/Logs';
import { Firmware } from './components/Firmware';
import { DoorState, LogEntry, SensorData, SystemConfig } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // System State
  const [doorState, setDoorState] = useState<DoorState>(DoorState.CLOSED);
  const [feederRunning, setFeederRunning] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({
    lightLevel: 50,
    batteryVoltage: 12.4,
    lastUpdate: Date.now()
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [config, setConfig] = useState<SystemConfig>({
    sunriseThreshold: 60,
    sunsetThreshold: 20,
    feedTimeMorning: '08:00',
    feedTimeEvening: '16:00',
    feedDurationSec: 5
  });

  // Helper to add logs
  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [...prev.slice(-99), newLog]);
  }, []);

  // --- SIMULATION LOGIC ---

  // Shared door movement logic with Jam probability
  const simulateDoorAction = useCallback((targetState: DoorState.OPEN | DoorState.CLOSED) => {
    const isOpening = targetState === DoorState.OPEN;
    const transitState = isOpening ? DoorState.OPENING : DoorState.CLOSING;
    const reverseState = isOpening ? DoorState.CLOSED : DoorState.OPEN;

    setDoorState(transitState);

    // 20% chance of Jam for visibility in demo
    const isJamming = Math.random() < 0.2;

    if (isJamming) {
      setTimeout(() => {
        setDoorState(DoorState.JAMMED);
        addLog(`CRITICAL: High motor load! Door JAMMED during ${transitState}.`, 'ERROR');
        
        // Safety timeout to reset (Auto-Reverse)
        setTimeout(() => {
          setDoorState(reverseState);
          addLog(`SAFETY: Obstruction logic engaged. Reverted to ${reverseState}.`, 'WARN');
        }, 3000);
      }, 1500);
    } else {
      setTimeout(() => {
        setDoorState(targetState);
        addLog(`Door movement complete: ${targetState}`, 'INFO');
      }, 3000);
    }
  }, [addLog]);
  
  // Simulated Sensors Update Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small fluctuations
      setSensorData(prev => ({
        ...prev,
        lastUpdate: Date.now(),
        batteryVoltage: Math.max(10.5, prev.batteryVoltage - 0.001) // slow drain
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Door Control Logic (Simulating the ESP32 loop)
  useEffect(() => {
    if (doorState === DoorState.JAMMED || doorState === DoorState.OPENING || doorState === DoorState.CLOSING) return;

    if (doorState === DoorState.CLOSED && sensorData.lightLevel > config.sunriseThreshold) {
      addLog(`Light level ${sensorData.lightLevel}% > Threshold ${config.sunriseThreshold}%. Opening Door.`, 'INFO');
      simulateDoorAction(DoorState.OPEN);
    } 
    else if (doorState === DoorState.OPEN && sensorData.lightLevel < config.sunsetThreshold) {
      addLog(`Light level ${sensorData.lightLevel}% < Threshold ${config.sunsetThreshold}%. Closing Door.`, 'INFO');
      simulateDoorAction(DoorState.CLOSED);
    }
  }, [sensorData.lightLevel, doorState, config.sunriseThreshold, config.sunsetThreshold, addLog, simulateDoorAction]);

  // Manual Override Actions
  const toggleDoor = () => {
    if (doorState === DoorState.CLOSED) {
      addLog('Manual Override: Opening Door', 'WARN');
      simulateDoorAction(DoorState.OPEN);
    } else if (doorState === DoorState.OPEN) {
      addLog('Manual Override: Closing Door', 'WARN');
      simulateDoorAction(DoorState.CLOSED);
    }
  };

  const triggerFeed = () => {
    if (feederRunning) return;
    addLog('Manual Feed Triggered', 'INFO');
    setFeederRunning(true);
    setTimeout(() => {
      setFeederRunning(false);
      addLog('Feed cycle complete', 'INFO');
    }, config.feedDurationSec * 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <Dashboard 
            doorState={doorState}
            sensorData={sensorData}
            config={config}
            setSensorData={setSensorData}
            toggleDoor={toggleDoor}
            triggerFeed={triggerFeed}
            isFeederRunning={feederRunning}
          />
        )}
        
        {activeTab === 'settings' && (
          <Settings config={config} setConfig={setConfig} />
        )}
        
        {activeTab === 'logs' && (
          <Logs logs={logs} clearLogs={() => setLogs([])} />
        )}

        {activeTab === 'firmware' && (
          <Firmware />
        )}
      </main>
    </div>
  );
}

export default App;