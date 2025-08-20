# 🤖 RAG (Retrieval Augmented Generation) Application

A modern, production-ready RAG application built with React frontend and Node.js backend, designed for intelligent document analysis and conversational AI.

## ✨ Features

### 🔐 **Authentication & Security**
- JWT-based authentication with refresh tokens
- Secure password hashing with bcryptjs
- Rate limiting and security headers
- User session management
- Production-ready security middleware

### 📄 **Document Management**
- **Multiple Input Types**: Text, File Upload (PDF, TXT, MD, CSV, JSON), Web URLs
- **Smart Processing**: Automatic content extraction and chunking
- **Vector Indexing**: Qdrant vector database for semantic search
- **Individual Control**: Index/deindex documents individually
- **Real-time Status**: Visual indicators for document states

### 💬 **Intelligent Chat Interface**
- **Context-Aware Responses**: Leverages indexed documents for accurate answers
- **Source Citations**: Shows which documents were used for responses
- **Chat History**: Persistent conversation management
- **Real-time Responses**: Streaming responses with loading states
- **Smart Suggestions**: Contextual question suggestions

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on all device sizes
- **Glass-morphism Effects**: Modern visual design
- **Custom Modals**: Better UX than browser alerts
- **Loading States**: Comprehensive user feedback
- **Error Handling**: Graceful error management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Node.js API    │    │   PostgreSQL    │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│   (Railway)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Qdrant Vector  │    │   OpenAI API    │
                       │   (Railway)     │    │                 │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Qdrant vector database
- OpenAI API key

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/majinbruce/Rag-assistant.git
cd rag-application

# Install server dependencies
cd server && npm install

# Install client dependencies  
cd ../client && npm install
```

### 2. Environment Setup

Create `server/.env`:
```env
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Database Configuration
DB_HOST=your-railway-postgres-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-railway-db-password

# Vector Database
QDRANT_URL=https://your-qdrant-instance.railway.app
QDRANT_COLLECTION_NAME=rag_documents

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# JWT Secrets (Generate with: openssl rand -hex 64)
JWT_SECRET=your-64-character-hex-string
JWT_REFRESH_SECRET=different-64-character-hex-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=another-64-character-hex-string
```

Create `client/.env`:
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### 3. Database Setup

```bash
cd server
npm run init-db
```

## 🚀 Deployment

### Backend (Railway)

1. **Create Railway Project**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Add PostgreSQL Service**
   - Go to Railway dashboard
   - Add PostgreSQL service
   - Note connection details

3. **Deploy Backend**
   ```bash
   cd server
   railway up
   ```

4. **Environment Variables** (Set in Railway dashboard)
   - All variables from `server/.env`
   - Railway will auto-provide DATABASE_URL

### Frontend (Vercel)

1. **Deploy to Vercel**
   ```bash
   cd client
   npm install -g vercel
   vercel
   ```

2. **Environment Variables** (Set in Vercel dashboard)
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```

### Database Services

**Option 1: Railway (Recommended)**
- ✅ PostgreSQL: Built-in Railway service
- ✅ Qdrant: Deploy as Railway service using Docker

**Option 2: Supabase**
- ✅ PostgreSQL: Supabase managed database
- ❌ Qdrant: Still need separate hosting (Railway/Docker)

**Recommendation**: Use Railway for both PostgreSQL and Qdrant for simplicity and cost-effectiveness.

## 📁 Project Structure

```
rag-application/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── AuthModal.js    # Authentication UI
│   │   │   ├── ChatInterface.js # Chat functionality
│   │   │   ├── DataSourcePanel.js # Document management
│   │   │   └── RAGStore.js     # Index management
│   │   ├── redux/              # State management
│   │   │   ├── slices/         # Redux slices
│   │   │   └── store.js        # Redux store
│   │   └── services/           # API services
│   ├── package.json
│   └── vercel.json            # Vercel deployment config
│
├── server/                     # Node.js Backend
│   ├── controllers/           # Route controllers
│   ├── middlewares/           # Auth, security, validation
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── utils/                # Helper functions
│   ├── database.sql          # Database schema
│   ├── package.json
│   ├── railway.json          # Railway deployment config
│   └── nixpacks.toml         # Railway build config
│
├── .gitignore                 # Security-focused gitignore
└── README.md                  # This file
```

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login  
POST /api/auth/refresh     # Refresh JWT token
POST /api/auth/logout      # User logout
```

### Documents
```
GET    /api/documents         # Get user documents
POST   /api/documents         # Add new document
DELETE /api/documents/:id     # Delete document
POST   /api/documents/:id/index    # Index document
DELETE /api/documents/:id/index    # Deindex document
GET    /api/documents/indexed      # Get indexed documents
DELETE /api/documents/index        # Clear entire index
```

### Chat
```
POST /api/chat              # Send message to RAG system
GET  /api/chat/history      # Get chat history
DELETE /api/chat/history    # Clear chat history
```

## 🛠️ Technologies Used

### Frontend
- **React 18** - Modern React with concurrent features
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Axios** - HTTP requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Qdrant** - Vector database
- **OpenAI API** - LLM integration
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **LangChain** - LLM framework

### Deployment
- **Vercel** - Frontend hosting
- **Railway** - Backend + databases
- **Docker** - Containerization

## 🔒 Security Features

- **Environment Protection**: Comprehensive .gitignore
- **Authentication**: JWT with refresh tokens
- **Authorization**: User-based data isolation
- **Input Validation**: express-validator middleware
- **Security Headers**: Helmet.js protection
- **Rate Limiting**: Request throttling
- **Password Security**: Bcrypt hashing (12 rounds)
- **CORS**: Configured for production
- **File Upload Security**: Type and size validation

## 🚀 Performance Optimizations

- **Vector Search**: Semantic similarity using Qdrant
- **Document Chunking**: Optimized text splitting
- **Connection Pooling**: Database connection management
- **Caching**: Strategic caching layers
- **Rate Limiting**: API protection
- **Lazy Loading**: Frontend optimization

## 📊 Monitoring & Analytics

- **Error Tracking**: Comprehensive error handling
- **Request Logging**: API request monitoring
- **Performance Metrics**: Response time tracking
- **User Analytics**: Usage statistics

## 🧪 Development

### Local Development

```bash
# Start backend (http://localhost:8000)
cd server && npm run dev

# Start frontend (http://localhost:3000)
cd client && npm start
```

### Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests  
cd client && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review error logs in Railway/Vercel dashboards

## 🎯 Roadmap

- [ ] Document versioning
- [ ] Advanced chat features (conversation branching)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] API rate limiting tiers
- [ ] Enterprise SSO integration