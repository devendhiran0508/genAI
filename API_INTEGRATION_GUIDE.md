# API Integration Guide for TruthLens

## 🔧 How to Integrate Your Real API

### 1. **Environment Configuration**

Create a `.env` file in the `backend` directory:

```env
# Set to true to use real APIs, false for mock data
USE_REAL_API=true

# Your API endpoints
TEXT_ANALYSIS_API=https://your-api.com/analyze/text
IMAGE_ANALYSIS_API=https://your-api.com/analyze/image
VIDEO_ANALYSIS_API=https://your-api.com/analyze/video
DEEPFAKE_API=https://your-api.com/detect/deepfake

# Your API authentication key
API_KEY
```

### 2. **Expected API Response Format**

Your APIs should return data in this format:

#### **Text Analysis API Response:**
```json
{
  "credibility": 85,
  "explanation": [
    {
      "title": "Source Verification",
      "status": "Verified",
      "description": "The source has been verified as legitimate.",
      "confidence": 90
    }
  ],
  "sources": [
    {
      "name": "Reuters",
      "credibility": "High",
      "url": "https://reuters.com"
    }
  ],
  "factCheck": {
    "status": "Verified",
    "summary": "This information has been fact-checked.",
    "details": [
      "Claim verified by independent sources",
      "No contradictory evidence found"
    ]
  }
}
```

#### **Image/Video Analysis API Response:**
```json
{
  "credibility": 75,
  "explanation": [
    {
      "title": "Image Authenticity",
      "status": "Authentic",
      "description": "No signs of manipulation detected.",
      "confidence": 85
    }
  ],
  "sources": [
    {
      "name": "Google Images",
      "credibility": "High",
      "url": "https://images.google.com"
    }
  ],
  "factCheck": {
    "status": "Authentic",
    "summary": "Image appears to be authentic.",
    "details": [
      "No evidence of digital editing",
      "Metadata is consistent"
    ]
  }
}
```

#### **Deepfake Detection API Response:**
```json
{
  "isManipulated": false,
  "confidence": 88,
  "analysis": {
    "facialConsistency": 92,
    "audioSync": 85,
    "lightingConsistency": 90,
    "temporalConsistency": 88
  },
  "recommendations": [
    "Appears authentic",
    "No major red flags detected"
  ]
}
```

### 3. **API Endpoint Requirements**

#### **Text Analysis:**
- **Method**: POST
- **Content-Type**: application/json
- **Body**: 
  ```json
  {
    "content": "text to analyze",
    "url": "optional url",
    "timestamp": "2024-01-20T10:30:00.000Z"
  }
  ```

#### **Image Analysis:**
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: FormData with 'image' field containing the file

#### **Video Analysis:**
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: FormData with 'video' field containing the file

#### **Deepfake Detection:**
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: FormData with 'media' field containing the file

### 4. **Authentication**

The application supports Bearer token authentication:
```
Authorization: Bearer your-api-key-here
```

### 5. **Error Handling**

If your API fails, the application will:
1. Log the error to console
2. Fall back to mock data
3. Continue functioning normally

### 6. **Testing Your Integration**

1. **Set up your API endpoints**
2. **Create `.env` file with your configuration**
3. **Start the backend**: `npm start`
4. **Check console logs** for API call status
5. **Test through the web interface**

### 7. **Example API Implementations**

#### **Google Cloud AI Platform:**
```javascript
// Example for Google Cloud Natural Language API
const analyzeText = async (content) => {
  const response = await fetch('https://language.googleapis.com/v1/documents:analyzeSentiment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      document: {
        content: content,
        type: 'PLAIN_TEXT'
      }
    })
  });
  
  const result = await response.json();
  
  // Convert to TruthLens format
  return {
    credibility: Math.round(result.documentSentiment.score * 50 + 50),
    explanation: [{
      title: "Sentiment Analysis",
      status: result.documentSentiment.score > 0 ? "Positive" : "Negative",
      description: `Sentiment score: ${result.documentSentiment.score}`,
      confidence: Math.abs(result.documentSentiment.score) * 100
    }],
    sources: [],
    factCheck: {
      status: "Analyzed",
      summary: "Content analyzed using Google Cloud AI",
      details: ["Sentiment analysis completed"]
    }
  };
};
```

#### **OpenAI API:**
```javascript
// Example for OpenAI API
const analyzeText = async (content) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Analyze this text for credibility and misinformation: "${content}"`
      }]
    })
  });
  
  const result = await response.json();
  
  // Process OpenAI response and convert to TruthLens format
  // ... implementation details
};
```

### 8. **Monitoring and Debugging**

- **Console Logs**: Check backend console for API call status
- **API Source**: Each result includes `apiSource` field ('real', 'mock', 'mock-fallback')
- **Error Handling**: Failed API calls are logged with fallback to mock data

### 9. **Performance Considerations**

- **Timeout Handling**: APIs should respond within reasonable time
- **Rate Limiting**: Implement appropriate rate limiting
- **Caching**: Consider caching results for repeated requests
- **Error Recovery**: Graceful fallback to mock data

This integration allows you to use your real AI/ML APIs while maintaining the beautiful TruthLens interface and user experience!
