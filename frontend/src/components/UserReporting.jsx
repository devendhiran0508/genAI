import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, ThumbsDown, Send, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const UserReporting = () => {
  const [formData, setFormData] = useState({
    content: '',
    type: 'misinformation',
    description: '',
    rating: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRating = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim() || !formData.description.trim() || formData.rating === null) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post('https://genai-w0dh.onrender.com/api/reports', formData);
      setSubmitted(true);
      setFormData({
        content: '',
        type: 'misinformation',
        description: '',
        rating: null
      });
    } catch (error) {
      setError('Failed to submit report. Please try again.');
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError(null);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Report Submitted Successfully!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for helping us combat misinformation. Your report has been received and will be reviewed by our team.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetForm}
            className="gradient-bg text-white px-8 py-4 rounded-lg font-medium text-lg"
          >
            Submit Another Report
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Report & Feedback</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Help us improve TruthLens by reporting suspicious content and providing feedback
        </p>
      </motion.div>

      {/* Report Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content to Report *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Paste the suspicious content, URL, or describe what you found..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of Issue *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="misinformation">Misinformation</option>
              <option value="deepfake">Deepfake/Manipulated Media</option>
              <option value="bias">Bias or Incomplete Information</option>
              <option value="spam">Spam or Irrelevant Content</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Explain why you think this content is suspicious or problematic..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              How helpful is TruthLens? *
            </label>
            <div className="flex space-x-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRating('positive')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.rating === 'positive'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-400 text-gray-600'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span className="font-medium">Helpful</span>
              </motion.button>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRating('negative')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.rating === 'negative'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-red-400 text-gray-600'
                }`}
              >
                <ThumbsDown className="w-5 h-5" />
                <span className="font-medium">Not Helpful</span>
              </motion.button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="w-full gradient-bg text-white py-4 px-6 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Report</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <MessageSquare className="w-6 h-6 text-blue-500" />
          <h3 className="text-2xl font-bold text-gray-800">Reporting Guidelines</h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">What to Report</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>False or misleading information</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Manipulated images or videos</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Content with strong bias or agenda</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Spam or irrelevant content</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Tips for Effective Reports</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Provide specific details about why it's suspicious</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Include source URLs when possible</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Be objective and factual in your description</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Help us understand the context</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserReporting;
