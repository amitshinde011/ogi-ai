// ✅ Header.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

const Header = ({ title, showBack = false, rightElement }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-200/80 backdrop-blur-xl bg-white/95 pt-[env(safe-area-inset-top)] md:pl-64">
      <div className="flex items-center justify-between max-w-md mx-auto px-4 py-3">
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 interactive"
            >
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
          )}
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
        {rightElement && (
          <div className="flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;