# 🚀 Startup Idea Validator AI

A premium AI-powered chatbot designed to provide brutally honest, data-driven feedback on your startup ideas. Built with a focus on "Frontend Thinking," it features a modern glassmorphic UI, smooth animations, and a seamless user experience.

![Demo Screenshot](https://via.placeholder.com/800x450?text=Startup+Idea+Validator+UI)

## ✨ Features

- **💡 Instant Validation:** Get immediate feedback on any startup pitch.
- **📊 Structured Analysis:** 
    - Market Potential (Size, Trends)
    - Target Audience (Pain Points)
    - Competition (Moats)
    - Monetization (Revenue Models)
    - Risks & Challenges
- **✅ Verdict:** Clear "Promising" or "Needs Refinement" status.
- **🎨 Premium UI:** Built with Material UI (MUI) v6, featuring glassmorphism, gradients, and custom animations.
- **📱 Responsive:** Optimized for desktop, tablet, and mobile views.
- **Markdown Support:** Clean, easy-to-read AI responses.

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **UI Framework:** Material UI (MUI)
- **Styling:** Emotion + Vanilla CSS
- **API:** OpenRouter (GPT-3.5) / Mock Fallback
- **Markdown:** React Markdown

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-link>

# Navigate to the project
cd startup-idea-validator

# Install dependencies
npm install
```

### 3. API Configuration
Create a `.env` file in the root directory and add your OpenRouter API key:
```env
VITE_OPENROUTER_API_KEY=your_key_here
```
*Note: If no API key is provided, the app will automatically switch to **Mock Mode** for demonstration purposes.*

### 4. Run Development Server
```bash
npm run dev
```

## 📂 Project Structure

- `src/components/ChatInterface.jsx`: The heart of the UI.
- `src/services/api.js`: AI integration and mock logic.
- `src/App.jsx`: Theme configuration and global layout.
- `src/index.css`: Global styles and background gradients.

## 📝 Assignment Brief Implementation

This project was built for the **Thinkly Labs Frontend Intern** role. Key focuses included:
- **Empty States:** Interactive prompts to help users get started.
- **Loading States:** Smooth progress indicators during AI processing.
- **Error Handling:** Graceful alerts for API or network issues.
- **Frontend Thinking:** Prioritizing aesthetic excellence and micro-interactions.

---
Built by Amit Kumar Yadav for Thinkly Labs.
