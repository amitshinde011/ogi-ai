
import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '@/constants/images';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="px-4 py-4">
        <div className="flex flex-col space-y-3">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <img 
              src={IMAGES.LOGO_MAIN} 
              alt="Yogi Logo" 
              className="h-6 w-auto"
            />
            <span className="text-slate-400 text-xs">© 2025 Yogi</span>
          </div>

          {/* Legal Links */}
          <nav aria-label="Legal" className="text-xs text-slate-400">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
              <li>
                <Link to="/privacy-policy" className="hover:text-slate-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-slate-600 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/cancellations-refunds" className="hover:text-slate-600 transition-colors">
                  Cancellations & Refunds
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-slate-600 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
