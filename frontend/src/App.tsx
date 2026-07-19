import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TripProvider, useTrip } from "./context/TripContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ToastContainer } from "./components/common/Toast";
import { AILoading } from "./components/planner/AILoading";

// Page Views
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Planner } from "./pages/Planner";
import { Results } from "./pages/Results";
import { Profile } from "./pages/Profile";
import { Vendors } from "./pages/Vendors";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";

const AppContent: React.FC = () => {
  const { isGenerating } = useTrip();

  return (
    <>
      {/* Dynamic AI Loading cover screen */}
      {isGenerating && <AILoading />}

      {/* Global Toast Alert toaster */}
      <ToastContainer />

      {/* Header element */}
      <Navbar />

      {/* Scrollable Layout main content */}
      <main className="flex-1 flex flex-col min-h-[75vh]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/results" element={<Results />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer Element */}
      <Footer />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <TripProvider>
        <AppContent />
      </TripProvider>
    </BrowserRouter>
  );
};
export default App;
