import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, RotateCcw, Lightbulb, Shield, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const LearnMore = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducationalContent();
  }, []);

  const fetchEducationalContent = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/learn');
      setTopics(response.data.topics);
      setSelectedTopic(response.data.topics[0]);
    } catch (error) {
      console.error('Error fetching educational content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (cardIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [cardIndex]: answerIndex
    }));
  };

  const checkQuizAnswer = (cardIndex) => {
    const card = selectedTopic.cards[cardIndex];
    const userAnswer = quizAnswers[cardIndex];
    const correctAnswer = card.quiz.correct;
    
    setShowQuizResult(true);
    return userAnswer === correctAnswer;
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowQuizResult(false);
  };

  const nextCard = () => {
    if (currentCard < selectedTopic.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowQuizResult(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowQuizResult(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Learn More</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Interactive educational content to help you identify and combat misinformation
        </p>
      </motion.div>

      {/* Topic Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Topic</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <motion.button
              key={topic.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedTopic(topic);
                setCurrentCard(0);
                resetQuiz();
              }}
              className={`p-6 rounded-xl text-left transition-all duration-200 ${
                selectedTopic?.id === topic.id
                  ? 'gradient-bg text-white shadow-lg'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <BookOpen className="w-6 h-6" />
                <h3 className="text-lg font-semibold">{topic.title}</h3>
              </div>
              <p className="text-sm opacity-90">{topic.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Educational Content */}
      {selectedTopic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Progress Bar */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedTopic.title}</h3>
              <span className="text-sm text-gray-600">
                {currentCard + 1} of {selectedTopic.cards.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="gradient-bg h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentCard + 1) / selectedTopic.cards.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Card */}
          <motion.div
            key={currentCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h4 className="text-2xl font-bold text-gray-800">
                  {selectedTopic.cards[currentCard].title}
                </h4>
              </div>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                {selectedTopic.cards[currentCard].content}
              </p>

              {/* Quiz Section */}
              {selectedTopic.cards[currentCard].quiz && (
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <h5 className="text-lg font-semibold text-gray-800">Quick Quiz</h5>
                  </div>
                  
                  <p className="text-gray-700 font-medium">
                    {selectedTopic.cards[currentCard].quiz.question}
                  </p>
                  
                  <div className="space-y-3">
                    {selectedTopic.cards[currentCard].quiz.options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuizAnswer(currentCard, index)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                          quizAnswers[currentCard] === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-gray-800">{option}</span>
                      </motion.button>
                    ))}
                  </div>

                  {quizAnswers[currentCard] !== undefined && (
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => checkQuizAnswer(currentCard)}
                        className="gradient-bg text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Check Answer</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetQuiz}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
                      </motion.button>
                    </div>
                  )}

                  {/* Quiz Result */}
                  {showQuizResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-lg flex items-center space-x-3 ${
                        checkQuizAnswer(currentCard)
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      {checkQuizAnswer(currentCard) ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        checkQuizAnswer(currentCard) ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {checkQuizAnswer(currentCard) 
                          ? 'Correct! Well done.' 
                          : 'Incorrect. The correct answer is: ' + selectedTopic.cards[currentCard].quiz.options[selectedTopic.cards[currentCard].quiz.correct]
                        }
                      </span>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prevCard}
              disabled={currentCard === 0}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Previous</span>
            </motion.button>

            <div className="flex space-x-2">
              {selectedTopic.cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentCard(index);
                    setShowQuizResult(false);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentCard ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextCard}
              disabled={currentCard === selectedTopic.cards.length - 1}
              className="gradient-bg text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Next</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h3 className="text-2xl font-bold text-gray-800">Quick Tips</h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            "Always verify information from multiple reliable sources",
            "Check the publication date and author credentials",
            "Look for inconsistencies in images and videos",
            "Be skeptical of content that triggers strong emotions",
            "Use fact-checking websites and tools",
            "Report suspicious content to help others"
          ].map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">{tip}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LearnMore;
