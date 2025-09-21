import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import HomeDashboard from './components/HomeDashboard';
import ScanResult from './components/ScanResult';
import DeepfakeDetection from './components/DeepfakeDetection';
import LearnMore from './components/LearnMore';
import UserReporting from './components/UserReporting';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
        <Navbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <Routes>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/scan/:id" element={<ScanResult />} />
            <Route path="/deepfake" element={<DeepfakeDetection />} />
            <Route path="/learn" element={<LearnMore />} />
            <Route path="/report" element={<UserReporting />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;