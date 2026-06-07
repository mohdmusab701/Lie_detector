import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Pricing from "./pages/Pricing.jsx";
import Signup from "./pages/Signup.jsx";
import Trending from "./pages/Trending.jsx";

const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.35, ease: "easeOut" },
};

function AnimatedPage({ children }) {
  return <motion.main {...pageMotion}>{children}</motion.main>;
}

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return <section className="container-shell min-h-[calc(100vh-5rem)] py-16 sm:py-24" />;
  if (!isLoggedIn) {
    const message = location.pathname === "/trending" ? "Please login to access Trending AI News." : undefined;
    return <Navigate to="/login" replace state={{ from: location.pathname, message }} />;
  }

  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black/75 text-[#f5f5f5]">
      <div className="fixed inset-0 -z-10 bg-radial-grid" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <Navbar />
      <div className="pt-20">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
            <Route path="/trending" element={<AnimatedPage><ProtectedRoute><Trending /></ProtectedRoute></AnimatedPage>} />
            <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
            <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
            <Route path="/signup" element={<AnimatedPage><Signup /></AnimatedPage>} />
            <Route path="/pricing" element={<AnimatedPage><Pricing /></AnimatedPage>} />
            <Route path="/dashboard" element={<AnimatedPage><ProtectedRoute><Dashboard /></ProtectedRoute></AnimatedPage>} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
