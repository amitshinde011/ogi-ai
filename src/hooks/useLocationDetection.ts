
import { useState, useEffect } from 'react';

interface LocationData {
  isIndiaUser: boolean;
  userLocation: string;
}

export const useLocationDetection = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    isIndiaUser: false,
    userLocation: ''
  });

  useEffect(() => {
    const detectUserLocation = async () => {
      try {
        // First try to get location from IP
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        console.log('Location detected:', data.country_name, data.country_code);
        
        const isIndia = data.country_code === 'IN';
        setLocationData({
          userLocation: data.country_name || 'Unknown',
          isIndiaUser: isIndia
        });
      } catch (error) {
        console.error('Failed to detect location:', error);
        // Default to non-India if detection fails
        setLocationData({
          userLocation: 'Unknown',
          isIndiaUser: false
        });
      }
    };

    detectUserLocation();
  }, []);

  return locationData;
};
