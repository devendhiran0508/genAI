import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, Search, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomeDashboard = () => {
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentScans();
  }, []);

  const fetchRecentScans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/scans');
      setRecentScans(response.data);
    } catch (error) {
      console.error('Error fetching recent scans:', error);
    }
  };

  const handleTextAnalysis = async () => {
    if (!textInput.trim() && !urlInput.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/analyze/text', {
        content: textInput,
        url: urlInput
      });
      
      navigate(`/scan/${response.data.id}`);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append(file.type.startsWith('image/') ? 'image' : 'video', file);

    try {
      const endpoint = file.type.startsWith('image/') 
        ? 'http://localhost:5000/api/analyze/image'
        : 'http://localhost:5000/api/analyze/video';
      
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      navigate(`/scan/${response.data.id}`);
    } catch (error) {
      console.error('Error analyzing file:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCredibilityColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCredibilityIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getCredibilityGradient = (score) => {
    if (score >= 80) return 'success-gradient';
    if (score >= 60) return 'warning-gradient';
    return 'danger-gradient';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <h1 className="text-5xl font-bold text-gradient">
          TruthLens
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI-Powered Misinformation Shield - Verify content authenticity and detect deepfakes with advanced AI technology
        </p>
      </motion.div>

      {/* Analysis Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
      >
        <div className="flex space-x-2 mb-6">
          {[
            { id: 'text', label: 'Text/URL', icon: LinkIcon },
            { id: 'file', label: 'Upload Media', icon: Upload }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'gradient-bg text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'text' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter text content or news URL
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your text content here or enter a news URL..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or enter a URL
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/news-article"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTextAnalysis}
              disabled={isAnalyzing || (!textInput.trim() && !urlInput.trim())}
              className="w-full gradient-bg text-white py-4 px-6 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Analyze Content</span>
                </>
              )}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Upload Image or Video
              </p>
              <p className="text-gray-500 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="gradient-bg text-white py-3 px-6 rounded-lg font-medium cursor-pointer inline-block hover:opacity-90 transition-opacity"
              >
                Choose File
              </label>
            </div>
            {selectedFile && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-800">Recent Scans</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentScans.slice(0, 6).map((scan) => (
              <motion.div
                key={scan.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/scan/${scan.id}`)}
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCredibilityGradient(scan.credibility)} text-white`}>
                    {scan.type.toUpperCase()}
                  </div>
                  {getCredibilityIcon(scan.credibility)}
                </div>
                
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {scan.content || scan.filename || 'Content analysis'}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-bold ${getCredibilityColor(scan.credibility)}`}>
                    {scan.credibility}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(scan.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomeDashboard;
