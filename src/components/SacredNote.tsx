
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const SacredNote = () => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mt-0.5 sm:mt-1" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2 sm:mb-3">
            A Note Before You Begin
          </h3>
          <div className="prose prose-amber text-amber-800 leading-relaxed text-sm sm:text-base">
            <p className="mb-3 sm:mb-4">
              You are about to receive profound knowledge from the sacred science of yoga. 
              To honor these teachings and absorb them fully, we ask that you watch with 
              your complete, undivided attention.
            </p>
            <p className="mb-3 sm:mb-4">
              These transmissions are designed to be experienced once, as a direct and 
              focused learning moment.
            </p>
            <p className="font-semibold text-amber-900">
              Please be aware that once you proceed to the next step of your journey, 
              you will not be able to return to this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SacredNote;
