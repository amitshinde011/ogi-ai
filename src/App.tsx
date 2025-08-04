import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeCapacitorPlugins } from "@/utils/capacitorConfig";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";

// Import all pages
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import PasswordChange from "./pages/PasswordChange";
import ProfileSetup from "./pages/ProfileSetup";
import ProfileEdit from "./pages/ProfileEdit";
import IntroVideo from "./pages/IntroVideo";
import BeforeAssessment from "./pages/BeforeAssessment";
import JourneyStart from "./pages/JourneyStart";
import Subscriptions from "./pages/Subscriptions";
import Payment from "./pages/Payment";
import Progress from "./pages/Progress";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import SavedRecipes from "./pages/SavedRecipes";
import AdminAutomation from "./pages/AdminAutomation";
import Community from "./pages/Community";
import PostDetail from "./pages/PostDetail";
import MyPosts from "./pages/MyPosts";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import Comparison from "./pages/Comparison";
import FinalAssessment from "./pages/FinalAssessment";
import ProgramComplete from "./pages/ProgramComplete";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CancellationsRefunds from "./pages/CancellationsRefunds";
import NotFound from "./pages/NotFound";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchInterval: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize Capacitor plugins
    initializeCapacitorPlugins().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <UserDataProvider>
              <Toaster />
              <Sonner />
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/index" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/cancellations-refunds" element={<CancellationsRefunds />} />

              {/* Protected routes */}
              <Route path="/home" element={<ProtectedRoute requiresActiveSubscription={true} showBlurOverlay={true}><Home /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/password-change" element={<ProtectedRoute><PasswordChange /></ProtectedRoute>} />
              <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
              <Route path="/profile-edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
              <Route path="/intro-video" element={<ProtectedRoute><IntroVideo /></ProtectedRoute>} />
              <Route path="/before-assessment" element={<ProtectedRoute><BeforeAssessment /></ProtectedRoute>} />
              <Route path="/journey-start" element={<ProtectedRoute><JourneyStart /></ProtectedRoute>} />
              <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
              <Route path="/recipes" element={<ProtectedRoute requiresActiveSubscription={true} showBlurOverlay={true}><Recipes /></ProtectedRoute>} />
              <Route path="/recipe/:id" element={<ProtectedRoute requiresActiveSubscription={true}><RecipeDetail /></ProtectedRoute>} />
              <Route path="/saved-recipes" element={<ProtectedRoute requiresActiveSubscription={true}><SavedRecipes /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
              <Route path="/my-posts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
              <Route path="/admin/automation" element={<ProtectedRoute><AdminRoute><AdminAutomation /></AdminRoute></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/comparison" element={<ProtectedRoute><Comparison /></ProtectedRoute>} />
              <Route path="/final-assessment" element={<ProtectedRoute><FinalAssessment /></ProtectedRoute>} />
              <Route path="/program-complete" element={<ProtectedRoute><ProgramComplete /></ProtectedRoute>} />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </UserDataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;