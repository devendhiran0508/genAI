import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Video, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const DeepfakeDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('media', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/deepfake/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error analyzing media:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setResult(null);
  };

  const getFileIcon = (file) => {
    if (!file) return <Camera className="w-8 h-8" />;
    return file.type.startsWith('video/') ? 
      <Video className="w-8 h-8" /> : 
      <Camera className="w-8 h-8" />;
  };

  const getResultColor = (isManipulated) => {
    return isManipulated ? 'text-red-600' : 'text-green-600';
  };

  const getResultGradient = (isManipulated) => {
    return isManipulated ? 'danger-gradient' : 'success-gradient';
  };

  const getResultIcon = (isManipulated) => {
    return isManipulated ? 
      <XCircle className="w-6 h-6 text-red-600" /> : 
      <CheckCircle className="w-6 h-6 text-green-600" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Deepfake Detection</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upload images or videos to detect potential deepfake manipulation using advanced AI analysis
        </p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
      >
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : selectedFile 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                {getFileIcon(selectedFile)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedFile.name}</h3>
                <p className="text-sm text-gray-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                </p>
              </div>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleFileUpload}
                  disabled={isAnalyzing}
                  className="gradient-bg text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Detect Deepfake</span>
                    </>
                  )}
                </button>
                <button
                  onClick={resetAnalysis}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Upload Image or Video
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your file here, or click to browse
                </p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
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
            </div>
          )}
        </div>
      </motion.div>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Main Result */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-4">
                {getResultIcon(result.isManipulated)}
                <h2 className="text-3xl font-bold text-gray-800">Detection Result</h2>
              </div>
              
              <div className={`inline-block px-8 py-4 rounded-full text-white font-bold text-xl ${getResultGradient(result.isManipulated)}`}>
                {result.isManipulated ? 'LIKELY MANIPULATED' : 'AUTHENTIC'}
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 mb-2">Confidence Level</p>
                <div className="w-64 h-64 mx-auto relative">
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
                      stroke={result.isManipulated ? "#ef4444" : "#10b981"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 251.2' }}
                      animate={{ strokeDasharray: `${(result.confidence / 100) * 251.2} 251.2` }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-4xl font-bold ${getResultColor(result.isManipulated)}`}>
                      {result.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Breakdown */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Analysis Breakdown</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(result.analysis).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Score</span>
                      <span className="font-medium">{value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          value >= 80 ? 'bg-green-500' :
                          value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {value >= 80 ? 'Excellent' :
                       value >= 60 ? 'Good' :
                       value >= 40 ? 'Fair' : 'Poor'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Recommendations</h3>
            
            <div className="space-y-4">
              {result.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    result.isManipulated ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-gray-700">{recommendation}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>File: {result.filename}</span>
              <span>Analyzed: {new Date(result.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DeepfakeDetection;
