
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
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        console.log('Location detected:', data.country_name, data.country_code);
        setLocationData({
          userLocation: data.country_name,
          isIndiaUser: data.country_code === 'IN'
        });
      } catch (error) {
        console.error('Failed to detect location:', error);
        setLocationData({
          userLocation: '',
          isIndiaUser: false
        });
      }
    };

    detectUserLocation();
  }, []);

  return locationData;
};
