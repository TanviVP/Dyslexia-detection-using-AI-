
# DysLexia Support Platform

A comprehensive web platform designed to support individuals with dyslexia, their families, educators, and healthcare professionals. Built with React.js frontend and Node.js backend.

## 🌟 Features

### 🔐 User Authentication
- **Multi-user Registration** - Support for different user types (individuals, parents, educators, healthcare professionals, researchers)
- **Social Media Login** - Google, Facebook, Microsoft, Apple, GitHub, LinkedIn integration
- **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- **Admin Dashboard** - Comprehensive user management system

### 👥 User Types Supported
- **Individuals with Dyslexia** - Personal support and resources
- **Parents/Guardians** - Family support and guidance
- **Educators/Teachers** - Teaching tools and strategies
- **Healthcare Professionals** - Clinical resources and tools
- **Researchers** - Research data and collaboration tools

### 🎨 Accessibility Features
- **Dyslexia-Friendly Design** - High contrast, readable fonts, reduced motion options
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **ARIA Compliance** - Screen reader compatible
- **Keyboard Navigation** - Full keyboard accessibility support

### 📊 Admin Features
- **Database Viewer** - View and manage all registered users
- **User Analytics** - Statistics and insights about user base
- **User Type Filtering** - Organize users by categories
- **Real-time Updates** - Live user registration tracking

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dyslexia-support-platform.git
   cd dyslexia-support-platform
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp .env.example .env
   ```

5. **Start the application**
   
   **Option 1: Two terminals (Recommended)**
   ```bash
   # Terminal 1 - Backend
   cd backend
   node server.js
   
   # Terminal 2 - Frontend
   npm start
   ```
   
   **Option 2: Using the start script**
   ```bash
   # Windows
   start.bat
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/database
   - Backend API: http://localhost:5000/api

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

**Backend (backend/.env)**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dyslexia-support
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret-key
FRONTEND_URL=http://localhost:3000

# OAuth Credentials (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

## 🏗️ Project Structure

```
dyslexia-support-platform/
├── public/                 # Static files
├── src/                   # React frontend source
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   ├── services/         # API services
│   └── App.js            # Main app component
├── backend/              # Node.js backend
│   ├── routes/           # API routes
│   ├── models/           # Database models
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration files
│   ├── data/             # Fallback JSON database
│   └── server.js         # Express server
├── package.json          # Frontend dependencies
└── README.md            # This file
```

## 🔑 Admin Access

**Default Admin Credentials:**
- Email: `admin@dyslexia-support.com`
- Password: `admin123`

Access the admin dashboard at: http://localhost:3000/database

## 🗄️ Database

The application supports both MongoDB and a fallback JSON file system:

- **MongoDB** (Primary) - For production use
- **JSON Files** (Fallback) - Located in `backend/data/users.json` for development

The system automatically falls back to JSON storage if MongoDB is unavailable.

## 🎨 Customization

### Accessibility Settings
Users can customize their experience with:
- Font size options (small, medium, large, extra-large)
- High contrast mode
- Reduced motion preferences
- Dyslexia-friendly fonts

### Theming
The application uses CSS custom properties for easy theming. Modify `src/App.css` to customize colors and styles.

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test
```

## 📦 Building for Production

```bash
# Build frontend
npm run build

# The build folder will contain the production-ready files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/dyslexia-support-platform/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Built with accessibility and inclusivity in mind
- Designed for the dyslexia community
- Special thanks to all contributors and testers

---

**Made with ❤️ for the dyslexia support community**
=======

