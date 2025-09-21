require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Debug logging
console.log('🔧 Environment Configuration:');
console.log('USE_REAL_API:', process.env.USE_REAL_API);
console.log('API_KEY:', process.env.API_KEY ? 'Set' : 'Not Set');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Mock database
let scans = [];
let reports = [];

// Configuration for real API integration
const API_CONFIG = {
  // Set to true to use real APIs, false for mock data
  USE_REAL_API: process.env.USE_REAL_API === 'true' || false,
  
  // Your API endpoints (Google Cloud AI by default)
  TEXT_ANALYSIS_API: process.env.TEXT_ANALYSIS_API || 'https://language.googleapis.com/v1/documents:analyzeSentiment',
  IMAGE_ANALYSIS_API: process.env.IMAGE_ANALYSIS_API || 'https://vision.googleapis.com/v1/images:annotate',
  VIDEO_ANALYSIS_API: process.env.VIDEO_ANALYSIS_API || 'https://videointelligence.googleapis.com/v1/videos:annotate',
  DEEPFAKE_API: process.env.DEEPFAKE_API || 'https://vision.googleapis.com/v1/images:annotate',
  
  // API authentication
  API_KEY: process.env.API_KEY || 'your-api-key-here',
  API_HEADERS: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.API_KEY || 'your-api-key-here'}`
  }
};

// Mock data generators (fallback when real API is not available)
const generateCredibilityScore = (content, type) => {
  // Generate more realistic scores based on content analysis
  let baseScore = 50; // Start with neutral score
  
  if (type === 'text') {
    // Analyze text content for credibility indicators
    const suspiciousWords = ['urgent', 'breaking', 'shocking', 'exclusive', 'you won\'t believe', 'doctors hate', 'one weird trick'];
    const credibleWords = ['according to', 'research shows', 'study published', 'official statement', 'verified', 'confirmed'];
    
    const hasSuspiciousWords = suspiciousWords.some(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );
    const hasCredibleWords = credibleWords.some(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );
    
    if (hasSuspiciousWords) baseScore -= 30;
    if (hasCredibleWords) baseScore += 25;
    
    // Check for URL patterns
    if (content.includes('http')) {
      if (content.includes('reuters.com') || content.includes('bbc.com') || content.includes('ap.org')) {
        baseScore += 20;
      } else if (content.includes('facebook.com') || content.includes('twitter.com')) {
        baseScore -= 15;
      }
    }
    
    // Length analysis (very short content might be less credible)
    if (content.length < 50) baseScore -= 10;
    if (content.length > 200) baseScore += 10;
  } else if (type === 'image') {
    // Images are generally more credible unless manipulated
    baseScore = 75;
  } else if (type === 'video') {
    // Videos have higher chance of being manipulated
    baseScore = 40;
  }
  
  // Add some randomness but keep it within realistic bounds
  const randomVariation = Math.floor(Math.random() * 20) - 10;
  const finalScore = Math.max(10, Math.min(95, baseScore + randomVariation));
  
  return finalScore;
};

const generateRandomId = () => uuidv4();

// Real API integration functions
const callRealAPI = async (endpoint, data, type) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: API_CONFIG.API_HEADERS,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Real API call successful for ${type}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Real API call failed for ${type}:`, error.message);
    throw error;
  }
};

// Text analysis with Google Cloud Natural Language API
const analyzeTextWithRealAPI = async (content, url) => {
  const apiData = {
    document: {
      content: content,
      type: 'PLAIN_TEXT'
    },
    encodingType: 'UTF8'
  };
  
  const response = await fetch(`${API_CONFIG.TEXT_ANALYSIS_API}?key=${API_CONFIG.API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiData)
  });
  
  if (!response.ok) {
    throw new Error(`Google Cloud API call failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('✅ Google Cloud Text Analysis successful:', result);
  
  // Convert Google Cloud response to TruthLens format
  const sentimentScore = result.documentSentiment?.score || 0;
  const credibility = Math.max(10, Math.min(95, Math.round((sentimentScore + 1) * 50)));
  
  return {
    credibility: credibility,
    explanation: [
      {
        title: "Sentiment Analysis",
        status: sentimentScore > 0.1 ? "Positive" : sentimentScore < -0.1 ? "Negative" : "Neutral",
        description: `Google Cloud sentiment analysis: ${sentimentScore.toFixed(2)}`,
        confidence: Math.abs(sentimentScore) * 100
      },
      {
        title: "Content Quality",
        status: credibility >= 70 ? "High Quality" : credibility >= 50 ? "Medium Quality" : "Low Quality",
        description: `Content analyzed using Google Cloud Natural Language API`,
        confidence: credibility
      }
    ],
    sources: [
      { name: "Google Cloud Natural Language", credibility: "High", url: "https://cloud.google.com/natural-language" }
    ],
    factCheck: {
      status: credibility >= 70 ? "Analyzed" : "Requires Review",
      summary: `Content analyzed using Google Cloud AI. Sentiment score: ${sentimentScore.toFixed(2)}`,
      details: [
        "Analyzed using Google Cloud Natural Language API",
        `Sentiment magnitude: ${result.documentSentiment?.magnitude || 0}`,
        "Content processed for emotional tone and language patterns"
      ]
    }
  };
};

// Image analysis with Google Cloud Vision API
const analyzeImageWithRealAPI = async (imageBuffer, filename) => {
  const base64Image = imageBuffer.toString('base64');
  
  const apiData = {
    requests: [{
      image: {
        content: base64Image
      },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'TEXT_DETECTION', maxResults: 10 },
        { type: 'SAFE_SEARCH_DETECTION' }
      ]
    }]
  };
  
  const response = await fetch(`${API_CONFIG.IMAGE_ANALYSIS_API}?key=${API_CONFIG.API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiData)
  });
  
  if (!response.ok) {
    throw new Error(`Google Cloud Vision API call failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('✅ Google Cloud Vision Analysis successful:', result);
  
  // Convert Google Cloud response to TruthLens format
  const labels = result.responses?.[0]?.labelAnnotations || [];
  const textAnnotations = result.responses?.[0]?.textAnnotations || [];
  const safeSearch = result.responses?.[0]?.safeSearchAnnotation || {};
  
  // Calculate credibility based on safe search and content analysis
  let credibility = 80; // Start with high credibility for images
  if (safeSearch.adult === 'VERY_LIKELY' || safeSearch.violence === 'VERY_LIKELY') {
    credibility -= 40;
  } else if (safeSearch.adult === 'LIKELY' || safeSearch.violence === 'LIKELY') {
    credibility -= 20;
  }
  
  return {
    credibility: Math.max(10, Math.min(95, credibility)),
    explanation: [
      {
        title: "Content Safety",
        status: safeSearch.adult === 'VERY_LIKELY' || safeSearch.violence === 'VERY_LIKELY' ? "Unsafe" : "Safe",
        description: `Google Cloud safe search analysis completed`,
        confidence: 90
      },
      {
        title: "Image Analysis",
        status: labels.length > 0 ? "Analyzed" : "No Labels Detected",
        description: `Detected ${labels.length} content labels using Google Cloud Vision`,
        confidence: 85
      }
    ],
    sources: [
      { name: "Google Cloud Vision API", credibility: "High", url: "https://cloud.google.com/vision" }
    ],
    factCheck: {
      status: credibility >= 70 ? "Analyzed" : "Requires Review",
      summary: `Image analyzed using Google Cloud Vision API. Safety score: ${credibility}%`,
      details: [
        "Analyzed using Google Cloud Vision API",
        `Detected labels: ${labels.map(l => l.description).join(', ')}`,
        `Safe search: Adult=${safeSearch.adult}, Violence=${safeSearch.violence}`
      ]
    }
  };
};

// Video analysis with real API
const analyzeVideoWithRealAPI = async (videoBuffer, filename) => {
  const formData = new FormData();
  formData.append('video', videoBuffer, filename);
  
  const response = await fetch(API_CONFIG.VIDEO_ANALYSIS_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_CONFIG.API_KEY}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Video API call failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('✅ Real Video API call successful:', result);
  return result;
};

// Deepfake detection with real API
const detectDeepfakeWithRealAPI = async (mediaBuffer, filename) => {
  const formData = new FormData();
  formData.append('media', mediaBuffer, filename);
  
  const response = await fetch(API_CONFIG.DEEPFAKE_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_CONFIG.API_KEY}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Deepfake API call failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('✅ Real Deepfake API call successful:', result);
  return result;
};

const generateAnalysisResult = (content, type) => {
  const credibility = generateCredibilityScore(content, type);
  
  const baseResult = {
    credibility,
    explanation: [],
    sources: [],
    factCheck: {}
  };

  if (type === 'text') {
    baseResult.explanation = [
      {
        title: "Source Verification",
        status: credibility >= 70 ? "Verified" : credibility >= 50 ? "Partially Verified" : "Unverified",
        description: credibility >= 70 ? 
          "The source has been verified as a legitimate news outlet with a good track record." :
          credibility >= 50 ?
          "The source shows some credibility indicators but requires further verification." :
          "The source appears unreliable or unverified.",
        confidence: Math.max(60, credibility - 10)
      },
      {
        title: "Factual Accuracy",
        status: credibility >= 70 ? "Mostly Accurate" : credibility >= 50 ? "Mixed Accuracy" : "Questionable",
        description: credibility >= 70 ?
          "Key facts in the content have been cross-referenced with multiple reliable sources." :
          credibility >= 50 ?
          "Some facts appear accurate while others require verification." :
          "Multiple inaccuracies or unverified claims detected.",
        confidence: Math.max(50, credibility - 15)
      },
      {
        title: "Bias Detection",
        status: credibility >= 70 ? "Minimal Bias" : credibility >= 50 ? "Moderate Bias" : "High Bias",
        description: credibility >= 70 ?
          "Content shows minimal political or ideological bias." :
          credibility >= 50 ?
          "Content shows some bias but presents multiple perspectives." :
          "Content shows significant bias and one-sided reporting.",
        confidence: Math.max(40, credibility - 20)
      }
    ];
    
    baseResult.sources = [
      { name: "Reuters", credibility: "High", url: "https://reuters.com" },
      { name: "Associated Press", credibility: "High", url: "https://ap.org" },
      { name: "BBC News", credibility: "High", url: "https://bbc.com" }
    ];
    
    baseResult.factCheck = {
      status: credibility >= 70 ? "Verified" : credibility >= 50 ? "Partially Verified" : "Unverified",
      summary: credibility >= 70 ?
        "This information has been fact-checked and verified by multiple independent sources." :
        credibility >= 50 ?
        "Some claims have been verified while others require further investigation." :
        "This information has not been verified and may contain inaccuracies.",
      details: credibility >= 70 ? [
        "Claim verified by 3 independent fact-checking organizations",
        "No contradictory evidence found",
        "Source material is publicly available and verifiable"
      ] : credibility >= 50 ? [
        "Partial verification by fact-checking organizations",
        "Some contradictory evidence found",
        "Source material partially verifiable"
      ] : [
        "No verification by independent fact-checkers",
        "Multiple contradictory sources found",
        "Source material difficult to verify"
      ]
    };
  } else if (type === 'image') {
    baseResult.explanation = [
      {
        title: "Image Authenticity",
        status: credibility >= 70 ? "Authentic" : credibility >= 50 ? "Likely Authentic" : "Suspicious",
        description: credibility >= 70 ?
          "No signs of digital manipulation detected in the image." :
          credibility >= 50 ?
          "Minor inconsistencies detected but image appears mostly authentic." :
          "Signs of potential digital manipulation detected.",
        confidence: Math.max(60, credibility - 5)
      },
      {
        title: "Metadata Analysis",
        status: credibility >= 70 ? "Consistent" : credibility >= 50 ? "Mostly Consistent" : "Inconsistent",
        description: credibility >= 70 ?
          "Image metadata appears consistent with the claimed source and date." :
          credibility >= 50 ?
          "Metadata shows some inconsistencies but overall appears legitimate." :
          "Metadata shows significant inconsistencies suggesting manipulation.",
        confidence: Math.max(50, credibility - 10)
      },
      {
        title: "Reverse Image Search",
        status: credibility >= 70 ? "Unique" : credibility >= 50 ? "Mostly Unique" : "Duplicates Found",
        description: credibility >= 70 ?
          "No duplicate images found in reverse search results." :
          credibility >= 50 ?
          "Some similar images found but no exact duplicates." :
          "Multiple duplicate or similar images found in reverse search.",
        confidence: Math.max(40, credibility - 15)
      }
    ];
    
    baseResult.sources = [
      { name: "Google Images", credibility: "High", url: "https://images.google.com" },
      { name: "TinEye", credibility: "High", url: "https://tineye.com" }
    ];
    
    baseResult.factCheck = {
      status: credibility >= 70 ? "Authentic" : credibility >= 50 ? "Likely Authentic" : "Suspicious",
      summary: credibility >= 70 ?
        "Image appears to be authentic with no signs of manipulation." :
        credibility >= 50 ?
        "Image appears mostly authentic with minor concerns." :
        "Image shows signs of potential manipulation or editing.",
      details: credibility >= 70 ? [
        "No evidence of digital editing found",
        "Metadata is consistent and unmodified",
        "Image has not been previously used in misleading contexts"
      ] : credibility >= 50 ? [
        "Minor evidence of potential editing",
        "Metadata shows some inconsistencies",
        "Image has been used in some questionable contexts"
      ] : [
        "Clear evidence of digital manipulation",
        "Metadata has been modified or is inconsistent",
        "Image has been used in multiple misleading contexts"
      ]
    };
  } else if (type === 'video') {
    baseResult.explanation = [
      {
        title: "Video Authenticity",
        status: credibility >= 70 ? "Authentic" : credibility >= 50 ? "Likely Authentic" : "Likely Manipulated",
        description: credibility >= 70 ?
          "No signs of deepfake or video manipulation detected." :
          credibility >= 50 ?
          "Minor inconsistencies detected but video appears mostly authentic." :
          "Signs of potential deepfake or video manipulation detected.",
        confidence: Math.max(50, credibility - 10)
      },
      {
        title: "Audio Analysis",
        status: credibility >= 70 ? "Natural" : credibility >= 50 ? "Mostly Natural" : "Suspicious",
        description: credibility >= 70 ?
          "Audio patterns appear natural and consistent." :
          credibility >= 50 ?
          "Audio shows some inconsistencies but appears mostly natural." :
          "Audio patterns suggest possible synthesis or editing.",
        confidence: Math.max(40, credibility - 15)
      },
      {
        title: "Frame Analysis",
        status: credibility >= 70 ? "Consistent" : credibility >= 50 ? "Mostly Consistent" : "Inconsistent",
        description: credibility >= 70 ?
          "Facial features and lighting appear consistent throughout." :
          credibility >= 50 ?
          "Minor inconsistencies in facial features and lighting." :
          "Inconsistencies detected in facial features and lighting.",
        confidence: Math.max(30, credibility - 20)
      }
    ];
    
    baseResult.sources = [
      { name: "Deepfake Detection AI", credibility: "High", url: "https://deepfake-detection.ai" },
      { name: "Video Forensics Lab", credibility: "High", url: "https://video-forensics.org" }
    ];
    
    baseResult.factCheck = {
      status: credibility >= 70 ? "Authentic" : credibility >= 50 ? "Likely Authentic" : "Likely Manipulated",
      summary: credibility >= 70 ?
        "Video appears to be authentic with no signs of manipulation." :
        credibility >= 50 ?
        "Video appears mostly authentic with minor concerns." :
        "This video shows signs of potential manipulation or deepfake technology.",
      details: credibility >= 70 ? [
        "No evidence of deepfake technology detected",
        "Audio-visual synchronization appears natural",
        "Facial features remain consistent throughout"
      ] : credibility >= 50 ? [
        "Minor evidence of potential manipulation",
        "Audio-visual synchronization mostly natural",
        "Some inconsistencies in facial features"
      ] : [
        "Facial features show inconsistencies typical of deepfake generation",
        "Audio-visual synchronization appears artificial",
        "Recommended to verify with original source"
      ]
    };
  }

  return baseResult;
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TruthLens API is running' });
});

// Get recent scans
app.get('/api/scans', (req, res) => {
  res.json(scans.slice(-10).reverse()); // Return last 10 scans
});

// Get specific scan by ID
app.get('/api/scans/:id', (req, res) => {
  const scanId = req.params.id;
  const scan = scans.find(s => s.id === scanId);
  
  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  
  res.json(scan);
});

// Analyze text content
app.post('/api/analyze/text', async (req, res) => {
  const { content, url } = req.body;
  
  if (!content && !url) {
    return res.status(400).json({ error: 'Content or URL is required' });
  }

  const scanId = generateRandomId();
  const analysisContent = content || `URL: ${url}`;
  
  try {
    let analysisResult;
    
    if (API_CONFIG.USE_REAL_API) {
      console.log('🔄 Using real API for text analysis...');
      analysisResult = await analyzeTextWithRealAPI(analysisContent, url);
    } else {
      console.log('🔄 Using mock data for text analysis...');
      analysisResult = generateAnalysisResult(analysisContent, 'text');
    }
    
    const result = {
      ...analysisResult,
      id: scanId,
      type: 'text',
      content: analysisContent,
      timestamp: new Date().toISOString(),
      status: 'completed',
      apiSource: API_CONFIG.USE_REAL_API ? 'real' : 'mock'
    };

    scans.push(result);
    
    // Log analysis details to console
    console.log('\n=== ANALYSIS COMPLETED ===');
    console.log(`Scan ID: ${scanId}`);
    console.log(`Type: ${result.type}`);
    console.log(`API Source: ${result.apiSource}`);
    console.log(`Content: ${result.content.substring(0, 100)}...`);
    console.log(`Credibility Score: ${result.credibility}%`);
    console.log(`Status: ${result.factCheck.status}`);
    console.log('========================\n');

    // Simulate processing delay
    setTimeout(() => {
      res.json(result);
    }, 1500);
    
  } catch (error) {
    console.error('❌ Text analysis failed:', error.message);
    
    // Fallback to mock data if real API fails
    console.log('🔄 Falling back to mock data...');
    const analysisResult = generateAnalysisResult(analysisContent, 'text');
    
    const result = {
      ...analysisResult,
      id: scanId,
      type: 'text',
      content: analysisContent,
      timestamp: new Date().toISOString(),
      status: 'completed',
      apiSource: 'mock-fallback',
      error: error.message
    };

    scans.push(result);
    
    setTimeout(() => {
      res.json(result);
    }, 1500);
  }
});

// Analyze image
app.post('/api/analyze/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  const scanId = generateRandomId();
  const analysisResult = generateAnalysisResult(req.file.originalname, 'image');
  
  const result = {
    ...analysisResult,
    id: scanId,
    type: 'image',
    filename: req.file.originalname,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };

  scans.push(result);
  
  // Log analysis details to console
  console.log('\n=== IMAGE ANALYSIS COMPLETED ===');
  console.log(`Scan ID: ${scanId}`);
  console.log(`Filename: ${result.filename}`);
  console.log(`Credibility Score: ${result.credibility}%`);
  console.log(`Status: ${result.factCheck.status}`);
  console.log('================================\n');
  
  setTimeout(() => {
    res.json(result);
  }, 2000);
});

// Analyze video
app.post('/api/analyze/video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Video file is required' });
  }

  const scanId = generateRandomId();
  const analysisResult = generateAnalysisResult(req.file.originalname, 'video');
  
  const result = {
    ...analysisResult,
    id: scanId,
    type: 'video',
    filename: req.file.originalname,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };

  scans.push(result);
  
  // Log analysis details to console
  console.log('\n=== VIDEO ANALYSIS COMPLETED ===');
  console.log(`Scan ID: ${scanId}`);
  console.log(`Filename: ${result.filename}`);
  console.log(`Credibility Score: ${result.credibility}%`);
  console.log(`Status: ${result.factCheck.status}`);
  console.log('================================\n');
  
  setTimeout(() => {
    res.json(result);
  }, 3000);
});

// Deepfake detection
app.post('/api/deepfake/detect', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Media file is required' });
  }

  const isManipulated = Math.random() > 0.6; // 40% chance of being manipulated
  const confidence = Math.floor(Math.random() * 40) + 60; // 60-100% confidence

  const result = {
    id: generateRandomId(),
    filename: req.file.originalname,
    isManipulated,
    confidence,
    analysis: {
      facialConsistency: Math.floor(Math.random() * 100),
      audioSync: Math.floor(Math.random() * 100),
      lightingConsistency: Math.floor(Math.random() * 100),
      temporalConsistency: Math.floor(Math.random() * 100)
    },
    timestamp: new Date().toISOString(),
    recommendations: isManipulated 
      ? ["Verify with original source", "Check multiple angles", "Look for inconsistencies"]
      : ["Appears authentic", "No major red flags detected", "Consider source verification"]
  };

  setTimeout(() => {
    res.json(result);
  }, 2500);
});

// Submit report
app.post('/api/reports', (req, res) => {
  const { content, type, description, rating } = req.body;
  
  const report = {
    id: generateRandomId(),
    content,
    type,
    description,
    rating,
    timestamp: new Date().toISOString(),
    status: 'submitted'
  };

  reports.push(report);
  
  res.json({ message: 'Report submitted successfully', reportId: report.id });
});

// Get reports
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

// Educational content
app.get('/api/learn', (req, res) => {
  const content = {
    topics: [
      {
        id: 1,
        title: "Understanding Misinformation",
        description: "Learn how to identify and combat false information",
        cards: [
          {
            title: "Types of Misinformation",
            content: "Misinformation can be classified into several categories: disinformation (intentionally false), misinformation (unintentionally false), and malinformation (true information used to harm).",
            quiz: {
              question: "What is the difference between disinformation and misinformation?",
              options: [
                "Disinformation is always false, misinformation is sometimes true",
                "Disinformation is intentional, misinformation is unintentional",
                "There is no difference",
                "Disinformation is digital, misinformation is analog"
              ],
              correct: 1
            }
          },
          {
            title: "Source Verification",
            content: "Always check the source of information. Look for author credentials, publication date, and whether the source has a history of accuracy.",
            quiz: {
              question: "What should you check when verifying a source?",
              options: [
                "Only the publication date",
                "Author credentials and publication history",
                "Only the website design",
                "The number of social media shares"
              ],
              correct: 1
            }
          }
        ]
      },
      {
        id: 2,
        title: "Deepfake Detection",
        description: "Learn to identify manipulated media content",
        cards: [
          {
            title: "Visual Cues",
            content: "Look for inconsistencies in facial features, lighting, shadows, and reflections. Deepfakes often have subtle artifacts around the face and eyes.",
            quiz: {
              question: "What are common signs of deepfake videos?",
              options: [
                "Perfect lighting and shadows",
                "Inconsistencies in facial features",
                "High video quality",
                "Professional editing"
              ],
              correct: 1
            }
          }
        ]
      }
    ]
  };

  res.json(content);
});

// Start server
app.listen(PORT, () => {
  console.log(`TruthLens API server running on port ${PORT}`);
});
