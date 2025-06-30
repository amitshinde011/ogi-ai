
import React from 'react';

interface ContactInfoProps {
  appName: string;
  email: string;
  responseTime?: string;
  businessHours?: string;
  note?: string;
}

const ContactInfo = ({ 
  appName, 
  email, 
  responseTime = "Within 24 hours", 
  businessHours = "Monday-Friday, 9 AM - 6 PM IST",
  note 
}: ContactInfoProps) => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg">
      <p className="font-medium">{appName} Support</p>
      <p>Email: {email}</p>
      <p>Response Time: {responseTime}</p>
      <p>Business Hours: {businessHours}</p>
      {note && (
        <p className="mt-4 text-sm text-slate-600">
          <strong>Note:</strong> {note}
        </p>
      )}
    </div>
  );
};

export default ContactInfo;
