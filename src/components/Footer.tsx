
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="px-4 py-4">
        <div className="flex flex-col space-y-3">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/5a8e66be-fe3c-4a0b-a827-6a2e891e4d04.png" 
              alt="Yogi Logo" 
              className="h-6 w-auto"
            />
            <span className="text-slate-400 text-xs">© 2025 Yogi</span>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col space-y-2 text-xs text-slate-400">
            <Link to="/privacy-policy" className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-slate-600 transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/cancellations-refunds" className="hover:text-slate-600 transition-colors">
              Cancellations & Refunds
            </Link>
            <Link to="/contact" className="hover:text-slate-600 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
