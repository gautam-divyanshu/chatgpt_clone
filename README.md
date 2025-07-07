# ChatGPT Clone

A pixel-perfect ChatGPT clone built with Next.js 15, featuring real-time chat, memory capabilities, file uploads, and seamless mobile responsiveness. This project replicates the exact ChatGPT UI/UX while adding advanced features like conversation memory isolation and comprehensive file support.

![ChatGPT Clone](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-4.3.16-orange)

## ✨ Features

### 💬 **Advanced Chat Functionality**
- **Message Streaming**: Real-time message streaming with graceful UI updates
- **Edit Messages**: Users can edit previously submitted messages with seamless regeneration
- **Context Window Handling**: Intelligent message segmentation for models with limited context size
- **Conversation History**: Persistent chat history stored in MongoDB
- **Loading States**: Animated typing indicators and smooth transitions

### 🧠 **Memory & Intelligence**
- **Mem0 AI Integration**: Advanced memory capabilities using [Mem0.ai](https://mem0.ai/)
- **Memory Isolation**: Each conversation maintains separate memory context
- **Contextual Responses**: AI remembers conversation context and user preferences
- **Smart Context Management**: Automatic context window optimization

### 📁 **File Upload Support**
- **Image Uploads**: JPEG, PNG, GIF, WebP support with preview
- **Document Processing**: PDF, DOCX, TXT, CSV file analysis
- **Cloudinary Integration**: Optimized file storage and delivery
- **File Type Validation**: Secure file type checking and size limits

### ⚡ **Performance & Scalability**
- **Vercel AI SDK**: Optimized AI response handling
- **MongoDB Atlas**: Scalable conversation storage
- **Next.js 15**: Latest framework features with Turbo mode
- **Edge Runtime**: Fast response times with edge computing

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **AI Integration**: Vercel AI SDK, Google Generative AI
- **Memory**: Mem0 AI for conversation memory
- **File Storage**: Cloudinary
- **Styling**: Tailwind CSS with custom ChatGPT theme
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account
- Cloudinary account
- Mem0 AI account
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatgpt-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Google AI Configuration
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key

   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatgptClone?retryWrites=true&w=majority

   # Cloudinary Configuration (for file uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Mem0 AI Configuration (for memory)
   MEM0_API_KEY=your_mem0_api_key
   MEM0_BASE_URL=https://api.mem0.ai
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key for chat responses | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for file uploads | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `MEM0_API_KEY` | Mem0 AI API key for memory features | ✅ |
| `MEM0_BASE_URL` | Mem0 AI base URL | ✅ |

### Getting API Keys

1. **Google AI API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Enable Generative AI API

2. **MongoDB Atlas**:
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get connection string from Connect → Drivers

3. **Cloudinary**:
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Get credentials from Dashboard

4. **Mem0 AI**:
   - Register at [Mem0.ai](https://mem0.ai/)
   - Get API key from your dashboard


## 🗂️ Project Structure

```
chatgpt-clone/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── chat/          # Chat API endpoint
│   │   │   ├── conversations/ # Conversation management
│   │   │   ├── memory/        # Memory API endpoints
│   │   │   └── upload/        # File upload handling
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── chat/              # Chat-related components
│   │   ├── layout/            # Layout components
│   │   ├── providers/         # Context providers
│   │   └── sidebar/           # Sidebar components
│   ├── lib/                   # Utility functions
│   ├── models/                # MongoDB models
│   └── config/                # Configuration files
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── package.json              # Dependencies
└── README.md                 # This file
```
