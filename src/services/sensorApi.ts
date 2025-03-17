import { create } from "zustand";

export interface SensorData {
  pH: number;
  tds: number; // Total Dissolved Solids in ppm
  turbidity: number; // Turbidity in NTU
  temperature: number; // Temperature in Celsius
  timestamp: number;
}

// Initial mock data
const initialData: SensorData = {
  pH: 7.0,
  tds: 150,
  turbidity: 5,
  temperature: 25,
  timestamp: Date.now(),
};

// Store for sensor data
interface SensorStore {
  data: SensorData;
  status: 'idle' | 'loading' | 'success' | 'error';
  lastUpdated: number | null;
  fetchData: () => Promise<void>;
  updateData: (newData: SensorData) => void;
}

// Mock API call - in production this would connect to your real data source
const fetchSensorData = async (): Promise<SensorData> => {
  // For demo purposes, we're returning random values
  return {
    pH: 6.5 + Math.random(),
    tds: 100 + Math.random() * 200,
    turbidity: 1 + Math.random() * 10,
    temperature: 20 + Math.random() * 10,
    timestamp: Date.now(),
  };
};

// Create store with Zustand
export const useSensorStore = create<SensorStore>((set) => ({
  data: initialData,
  status: 'idle',
  lastUpdated: null,
  fetchData: async () => {
    set({ status: 'loading' });
    try {
      const data = await fetchSensorData();
      set({ data, status: 'success', lastUpdated: Date.now() });
    } catch (error) {
      console.error("Failed to fetch sensor data:", error);
      set({ status: 'error' });
    }
  },
  updateData: (newData) => {
    set({ data: newData, lastUpdated: Date.now() });
  }
}));

// Function to determine water quality status based on sensor data
export const getWaterQualityStatus = (data: SensorData): 'good' | 'moderate' | 'poor' => {
  // Basic water quality analysis logic - can be refined with more detailed rules
  let score = 0;
  
  // pH should be between 6.5 and 8.5 for good water quality
  if (data.pH >= 6.5 && data.pH <= 8.5) {
    score += 3;
  } else if ((data.pH >= 6.0 && data.pH < 6.5) || (data.pH > 8.5 && data.pH <= 9.0)) {
    score += 1;
  }
  
  // TDS ideally below 300 ppm
  if (data.tds < 300) {
    score += 3;
  } else if (data.tds >= 300 && data.tds < 600) {
    score += 1;
  }
  
  // Turbidity ideally below 5 NTU
  if (data.turbidity < 5) {
    score += 3;
  } else if (data.turbidity >= 5 && data.turbidity < 10) {
    score += 1;
  }
  
  // Temperature ideally between 20-25°C
  if (data.temperature >= 20 && data.temperature <= 25) {
    score += 3;
  } else if ((data.temperature >= 15 && data.temperature < 20) || 
            (data.temperature > 25 && data.temperature <= 30)) {
    score += 1;
  }
  
  // Determine overall status based on score
  if (score >= 10) return 'good';
  if (score >= 6) return 'moderate';
  return 'poor';
};
