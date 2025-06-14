
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Community from "./pages/Community";
import PostDetail from "./pages/PostDetail";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import SavedRecipes from "./pages/SavedRecipes";
import ProfileSetup from "./pages/ProfileSetup";
import ProfileEdit from "./pages/ProfileEdit";
import Subscriptions from "./pages/Subscriptions";
import IntroVideo from "./pages/IntroVideo";
import BeforeAssessment from "./pages/BeforeAssessment";
import JourneyStart from "./pages/JourneyStart";
import ProgramComplete from "./pages/ProgramComplete";
import FinalAssessment from "./pages/FinalAssessment";
import Comparison from "./pages/Comparison";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/post/:id" element={<PostDetail />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/saved-recipes" element={<SavedRecipes />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/intro-video" element={<IntroVideo />} />
          <Route path="/before-assessment" element={<BeforeAssessment />} />
          <Route path="/journey-start" element={<JourneyStart />} />
          <Route path="/program-complete" element={<ProgramComplete />} />
          <Route path="/final-assessment" element={<FinalAssessment />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
