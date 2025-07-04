
import { useState, useEffect } from 'react';

interface LocationData {
  isIndiaUser: boolean;
  userLocation: string;
}

// Test flag - set to true to simulate India location, false to simulate non-India
const TEST_SIMULATE_INDIA = false;

export const useLocationDetection = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    isIndiaUser: false,
    userLocation: ''
  });

  useEffect(() => {
    const detectUserLocation = async () => {
      // If test flag is enabled, use simulated location
      /*if (TEST_SIMULATE_INDIA !== null) {
        console.log('🧪 TEST MODE: Simulating location -', TEST_SIMULATE_INDIA ? 'India' : 'International');
        setLocationData({
          userLocation: TEST_SIMULATE_INDIA ? 'India (Test)' : 'International (Test)',
          isIndiaUser: TEST_SIMULATE_INDIA
        });
        return;
      }*/

      try {
        // Try multiple methods to get location
        
        // Method 1: Try ipapi.co first
        try {
          const response = await fetch('https://ipapi.co/json/', {
            headers: {
              'Accept': 'application/json',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Location detected via ipapi.co:', data.country_name, data.country_code);
            
            const isIndia = data.country_code === 'IN';
            setLocationData({
              userLocation: data.country_name || 'Unknown',
              isIndiaUser: isIndia
            });
            return;
          }
        } catch (error) {
          console.log('ipapi.co failed, trying alternative...', error);
        }

        // Method 2: Try ip-api.com as backup
        try {
          const response = await fetch('http://ip-api.com/json/', {
            headers: {
              'Accept': 'application/json',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Location detected via ip-api.com:', data.country, data.countryCode);
            
            const isIndia = data.countryCode === 'IN';
            setLocationData({
              userLocation: data.country || 'Unknown',
              isIndiaUser: isIndia
            });
            return;
          }
        } catch (error) {
          console.log('ip-api.com failed, trying final method...', error);
        }

        // Method 3: Try using browser's timezone as fallback
        try {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          console.log('Detected timezone:', timezone);
          
          // Basic timezone to country mapping
          const isIndiaTimezone = timezone.includes('Asia/Kolkata') || 
                                 timezone.includes('Asia/Calcutta') ||
                                 timezone.includes('Asia/Delhi');
          
          setLocationData({
            userLocation: isIndiaTimezone ? 'India' : 'International',
            isIndiaUser: isIndiaTimezone
          });
          return;
        } catch (error) {
          console.log('Timezone detection failed:', error);
        }

        // Final fallback
        throw new Error('All location detection methods failed');
        
      } catch (error) {
        console.error('Failed to detect location:', error);
        // Default to international if all detection fails
        setLocationData({
          userLocation: 'International',
          isIndiaUser: false
        });
      }
    };

    detectUserLocation();
  }, []);

  return locationData;
};
