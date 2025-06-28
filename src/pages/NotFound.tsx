
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-peaceful">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-sage rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
          <AlertCircle size={48} strokeWidth={1.5} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-stone">404</h1>
        <p className="text-xl text-stone/70 mb-4">Oops! Page not found</p>
        <a href="/" className="text-sage hover:text-sage/80 underline font-medium">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
