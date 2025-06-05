
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
    <header className="bg-white/95 backdrop-blur-md border-b-2 border-gray-200 px-4 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-dark" />
            </button>
          )}
          <h1 className="text-lg font-bold text-dark">{title}</h1>
        </div>
        {rightElement && (
          <div>{rightElement}</div>
        )}
      </div>
    </header>
  );
};

export default Header;
