import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, ExternalLink, Clock, FileText, Image, Video } from 'lucide-react';
import axios from 'axios';

const ScanResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScanData();
  }, [id]);

  const fetchScanData = async () => {
    try {
      // In a real app, you'd fetch by ID, but for demo we'll use the latest scan
      const response = await axios.get('http://localhost:5000/api/scans');
      const scan = response.data.find(s => s.id === id) || response.data[0];
      setScanData(scan);
    } catch (error) {
      setError('Failed to load scan results');
      console.error('Error fetching scan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCredibilityColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCredibilityGradient = (score) => {
    if (score >= 80) return 'success-gradient';
    if (score >= 60) return 'warning-gradient';
    return 'danger-gradient';
  };

  const getCredibilityIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    return <XCircle className="w-6 h-6 text-red-600" />;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return <FileText className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !scanData) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Results</h2>
        <p className="text-gray-600 mb-4">{error || 'Scan not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="gradient-bg text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center space-x-4"
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          {getTypeIcon(scanData.type)}
          <h1 className="text-3xl font-bold text-gray-800">Analysis Results</h1>
        </div>
      </motion.div>

      {/* Credibility Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
      >
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4">
            {getCredibilityIcon(scanData.credibility)}
            <h2 className="text-2xl font-bold text-gray-800">Credibility Score</h2>
          </div>
          
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 251.2' }}
                animate={{ strokeDasharray: `${(scanData.credibility / 100) * 251.2} 251.2` }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="100%" stopColor="#00f2fe" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-bold ${getCredibilityColor(scanData.credibility)}`}>
                {scanData.credibility}%
              </span>
            </div>
          </div>
          
          <div className={`inline-block px-6 py-3 rounded-full text-white font-medium ${getCredibilityGradient(scanData.credibility)}`}>
            {scanData.credibility >= 80 ? 'Highly Credible' : 
             scanData.credibility >= 60 ? 'Moderately Credible' : 'Low Credibility'}
          </div>
        </div>
      </motion.div>

      {/* Explanation Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        <h3 className="text-2xl font-bold text-gray-800">Analysis Breakdown</h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          {scanData.explanation.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">{item.title}</h4>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.status === 'Verified' || item.status === 'Authentic' ? 'bg-green-100 text-green-800' :
                  item.status === 'Mostly Accurate' || item.status === 'Consistent' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.status}
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{item.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Confidence</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${item.confidence}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">{item.confidence}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Source Credibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Source Verification</h3>
        
        <div className="space-y-4">
          {scanData.sources.map((source, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  source.credibility === 'High' ? 'bg-green-500' :
                  source.credibility === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium text-gray-800">{source.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  source.credibility === 'High' ? 'bg-green-100 text-green-800' :
                  source.credibility === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {source.credibility}
                </span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fact Check Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Fact-Check Summary</h3>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            scanData.factCheck.status === 'Verified' || scanData.factCheck.status === 'Authentic' ? 'bg-green-50 border border-green-200' :
            scanData.factCheck.status === 'Likely Manipulated' ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {scanData.factCheck.status === 'Verified' || scanData.factCheck.status === 'Authentic' ? 
                <CheckCircle className="w-5 h-5 text-green-600" /> :
                scanData.factCheck.status === 'Likely Manipulated' ?
                <XCircle className="w-5 h-5 text-red-600" /> :
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              }
              <span className="font-semibold text-gray-800">{scanData.factCheck.status}</span>
            </div>
            <p className="text-gray-700">{scanData.factCheck.summary}</p>
          </div>
          
          <div className="space-y-2">
            {scanData.factCheck.details.map((detail, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Timestamp */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center text-gray-500 text-sm"
      >
        <div className="flex items-center justify-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Analysis completed on {new Date(scanData.timestamp).toLocaleString()}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ScanResult;
