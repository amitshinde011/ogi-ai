import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Community from "./pages/Community";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import PostDetail from "./pages/PostDetail";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import SavedRecipes from "./pages/SavedRecipes";
import ProfileSetup from "./pages/ProfileSetup";
import ProfileEdit from "./pages/ProfileEdit";
import Subscriptions from "./pages/Subscriptions";
import Payment from "./pages/Payment";
import IntroVideo from "./pages/IntroVideo";
import BeforeAssessment from "./pages/BeforeAssessment";
import JourneyStart from "./pages/JourneyStart";
import ProgramComplete from "./pages/ProgramComplete";
import FinalAssessment from "./pages/FinalAssessment";
import Comparison from "./pages/Comparison";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CancellationsRefunds from "./pages/CancellationsRefunds";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppWithAnalytics = () => {
  useAnalytics(); // This will track page views automatically
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Routes with blur overlay for inactive users */}
      <Route path="/home" element={
        <ProtectedRoute showBlurOverlay>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/recipes" element={
        <ProtectedRoute showBlurOverlay>
          <Recipes />
        </ProtectedRoute>
      } />
      
      {/* Protected routes that require active subscription */}
      <Route path="/before-assessment" element={
        <ProtectedRoute requiresActiveSubscription>
          <BeforeAssessment />
        </ProtectedRoute>
      } />
      <Route path="/final-assessment" element={
        <ProtectedRoute requiresActiveSubscription>
          <FinalAssessment />
        </ProtectedRoute>
      } />
      <Route path="/saved-recipes" element={
        <ProtectedRoute requiresActiveSubscription>
          <SavedRecipes />
        </ProtectedRoute>
      } />
      <Route path="/intro-video" element={
        <ProtectedRoute requiresActiveSubscription>
          <IntroVideo />
        </ProtectedRoute>
      } />
      <Route path="/journey-start" element={
        <ProtectedRoute requiresActiveSubscription>
          <JourneyStart />
        </ProtectedRoute>
      } />
      
      {/* Other routes that don't require active subscription */}
      <Route path="/upload" element={<Upload />} />
      <Route path="/community" element={<Community />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/messages/:conversationId" element={<Chat />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/community/post/:id" element={<PostDetail />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/recipes/:id" element={<RecipeDetail />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/profile-edit" element={<ProfileEdit />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/program-complete" element={<ProgramComplete />} />
      <Route path="/comparison" element={<Comparison />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/cancellations-refunds" element={<CancellationsRefunds />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppWithAnalytics />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
