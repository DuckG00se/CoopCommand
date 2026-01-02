export enum DoorState {
  CLOSED = 'CLOSED',
  OPENING = 'OPENING',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  JAMMED = 'JAMMED',
  UNKNOWN = 'UNKNOWN'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

export interface SystemConfig {
  sunriseThreshold: number; // 0-100%
  sunsetThreshold: number; // 0-100%
  feedTimeMorning: string; // HH:MM
  feedTimeEvening: string; // HH:MM
  feedDurationSec: number;
}

export interface SensorData {
  lightLevel: number; // 0-4095 raw or 0-100%
  batteryVoltage: number;
  lastUpdate: number;
}
