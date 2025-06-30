
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
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
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-slate-400">
            <Link to="/privacy-policy" className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/terms-and-conditions" className="hover:text-slate-600 transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/cancellations-refunds" className="hover:text-slate-600 transition-colors">
              Cancellations & Refunds
            </Link>
            <span className="text-slate-300">|</span>
            <a href="mailto:support@yogi.care" className="hover:text-slate-600 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
