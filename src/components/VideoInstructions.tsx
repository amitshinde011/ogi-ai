
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const VideoInstructions = () => {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-amber-100 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
          <div className="space-y-2 sm:space-y-3 md:space-y-4 flex-1 min-w-0">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-amber-900">Important Instructions</h3>
            <p className="text-amber-800 leading-relaxed text-xs sm:text-sm md:text-base">
              This comprehensive guide contains essential information for maximizing your wellness transformation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <span className="text-amber-800 font-medium text-xs sm:text-sm md:text-base">Daily diet tracking techniques</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <span className="text-amber-800 font-medium text-xs sm:text-sm md:text-base">Water consumption monitoring</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <span className="text-amber-800 font-medium text-xs sm:text-sm md:text-base">Yoga routine guidance</span>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <span className="text-amber-800 font-medium text-xs sm:text-sm md:text-base">Community engagement tips</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <span className="text-amber-800 font-medium text-xs sm:text-sm md:text-base">Program optimization strategies</span>
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
