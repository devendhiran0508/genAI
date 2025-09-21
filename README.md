# TruthLens – AI-Powered Misinformation Shield

A functional prototype of an AI-powered misinformation detection and deepfake analysis application built with React and Node.js/Express.

## Features

### 🏠 Home Dashboard
- Text content and URL analysis input
- File upload for images and videos
- Recent scans display with credibility scores
- Color-coded results (High/Medium/Low credibility)

### 🔍 Scan Results
- Interactive credibility score visualization
- Detailed analysis breakdown with confidence levels
- Source verification with credibility ratings
- Fact-check aggregation results

### 🎥 Deepfake Detection
- Media upload (images/videos)
- AI-powered manipulation detection
- Detailed analysis metrics
- Confidence scoring and recommendations

### 📚 Learn More
- Interactive educational content
- Quiz system for knowledge testing
- Multiple topics covering misinformation and deepfakes
- Progress tracking through content

### 📝 User Reporting
- Report suspicious content
- Feedback system with ratings
- Comprehensive reporting guidelines

## Tech Stack

### Frontend
- **React 19** with modern hooks
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with **Express**
- **Multer** for file uploads
- **CORS** for cross-origin requests
- **UUID** for unique identifiers

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd genAI
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The API will be available at `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### API Endpoints

#### Analysis
- `POST /api/analyze/text` - Analyze text content or URLs
- `POST /api/analyze/image` - Analyze uploaded images
- `POST /api/analyze/video` - Analyze uploaded videos
- `GET /api/scans` - Get recent scan results

#### Deepfake Detection
- `POST /api/deepfake/detect` - Detect deepfake manipulation

#### Reporting
- `POST /api/reports` - Submit user reports
- `GET /api/reports` - Get submitted reports

#### Educational Content
- `GET /api/learn` - Get educational content and quizzes

## Project Structure

```
genAI/
├── backend/
│   ├── server.js          # Express server with mock APIs
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── HomeDashboard.jsx
│   │   │   ├── ScanResult.jsx
│   │   │   ├── DeepfakeDetection.jsx
│   │   │   ├── LearnMore.jsx
│   │   │   ├── UserReporting.jsx
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # Custom styles
│   │   ├── index.css      # Tailwind CSS imports
│   │   └── main.jsx       # React entry point
│   ├── tailwind.config.js # Tailwind configuration
│   └── package.json       # Frontend dependencies
└── README.md
```

## Design Features

### UI/UX
- **Modern gradient design** with blue, purple, and green color schemes
- **Glass morphism effects** with backdrop blur
- **Smooth animations** using Framer Motion
- **Responsive design** for mobile and desktop
- **Interactive elements** with hover and click animations

### Mock Data
- **Realistic credibility scores** (0-100%)
- **Detailed analysis explanations** with confidence levels
- **Source verification** with credibility ratings
- **Fact-check results** with status and details
- **Educational content** with interactive quizzes

## Development Notes

### Mock APIs
The application uses mock APIs that simulate Google Cloud AI services:
- **Vertex AI** for text analysis
- **Vision AI** for image analysis
- **Speech-to-Text** for video analysis

### File Upload
- Supports images (JPG, PNG, GIF, etc.)
- Supports videos (MP4, AVI, MOV, etc.)
- 10MB file size limit
- In-memory storage for prototype

### Data Storage
- In-memory arrays for scans and reports
- Data persists during server session
- No database required for prototype

## Future Enhancements

- Real AI service integration
- Database persistence
- User authentication
- Advanced deepfake detection
- Real-time fact-checking
- Social sharing features
- Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes.
