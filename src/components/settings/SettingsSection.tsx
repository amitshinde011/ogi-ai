
import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SettingsItem {
  icon: LucideIcon;
  label: string;
  action?: () => void;
  hasArrow?: boolean;
  component?: React.ReactNode;
}

interface SettingsSectionProps {
  title: string;
  items: SettingsItem[];
}

const SettingsSection = ({ title, items }: SettingsSectionProps) => {
  return (
    <div className="space-y-3">
      <h4 className="font-bold text-lg text-slate-900 px-1">{title}</h4>
      <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardContent className="p-0">
          {items.map((item, itemIndex) => (
            <div key={itemIndex}>
              <div
                className={`flex items-center justify-between p-4 transition-colors ${
                  item.action ? 'cursor-pointer hover:bg-slate-50 active:bg-slate-100' : ''
                }`}
                onClick={item.action}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <item.icon className="text-indigo-600" size={20} />
                  </div>
                  <span className="font-semibold text-slate-900">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.component}
                  {item.hasArrow && (
                    <ChevronRight className="text-slate-400" size={20} />
                  )}
                </div>
              </div>
              {itemIndex < items.length - 1 && (
                <div className="border-b border-slate-100 ml-16" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
