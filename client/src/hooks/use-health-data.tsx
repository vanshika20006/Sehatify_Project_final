// file: src/hooks/use-health-data.ts

import { useEffect, useState } from "react";

interface Vitals {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
}

export function useHealthData() {
  const [currentVitals, setCurrentVitals] = useState<Vitals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRandomValue = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // ✅ Generate stable random data for one session
  const generateVitals = (): Vitals => ({
    heartRate: getRandomValue(72, 88),
    bloodPressureSystolic: getRandomValue(110, 125),
    bloodPressureDiastolic: getRandomValue(70, 85),
    oxygenSaturation: getRandomValue(95, 100),
    bodyTemperature: parseFloat((getRandomValue(971, 994) / 10).toFixed(1)),
  });

  useEffect(() => {
    try {
      // Check if data is already stored for this session
      const savedVitals = sessionStorage.getItem("fixedVitals");

      if (savedVitals) {
        // If present, use saved stable data
        setCurrentVitals(JSON.parse(savedVitals));
        setIsLoading(false);
      } else {
        // Else, generate new data for this session
        const newVitals = generateVitals();
        sessionStorage.setItem("fixedVitals", JSON.stringify(newVitals));
        setCurrentVitals(newVitals);
        setIsLoading(false);
      }

      // ⏱ Update every 15 seconds (simulate slow real-time data refresh)
      const interval = setInterval(() => {
        const updatedVitals = generateVitals();
        setCurrentVitals(updatedVitals);
        sessionStorage.setItem("fixedVitals", JSON.stringify(updatedVitals));
      }, 15000); // 15 sec = 15000 ms

      return () => clearInterval(interval);
    } catch (err: any) {
      setError("Failed to load vitals");
      setIsLoading(false);
    }
  }, []);

  return { currentVitals, isLoading, error };
}
