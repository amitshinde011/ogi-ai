
import React from 'react';

interface LocationGatewayInfoProps {
  userLocation: string;
  gateway: string;
}

export const LocationGatewayInfo: React.FC<LocationGatewayInfoProps> = ({
  userLocation,
  gateway
}) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Detected Location:</p>
          <p className="font-medium">{userLocation || 'Detecting...'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Payment Method:</p>
          <p className="font-medium capitalize">{gateway}</p>
        </div>
      </div>
    </div>
  );
};
