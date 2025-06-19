
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const VideoInstructions = () => {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          </div>
          <div className="space-y-3 sm:space-y-4 flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-amber-900">Important Instructions</h3>
            <p className="text-amber-800 leading-relaxed text-sm sm:text-base">
              This comprehensive guide contains essential information for maximizing your wellness transformation.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-amber-800 font-medium text-sm sm:text-base">Daily diet tracking techniques</span>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-amber-800 font-medium text-sm sm:text-base">Water consumption monitoring</span>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-amber-800 font-medium text-sm sm:text-base">Yoga routine guidance</span>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-amber-800 font-medium text-sm sm:text-base">Community engagement tips</span>
                </div>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-amber-800 font-medium text-sm sm:text-base">Program optimization strategies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoInstructions;
