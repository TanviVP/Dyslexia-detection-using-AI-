# DysLexia Support Platform - Frontend

A modern, accessible frontend for the dyslexia assessment platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **User Authentication**: Secure login/signup with Supabase
- **Interactive Games**: Engaging assessment games for dyslexia screening
- **Admin Dashboard**: Comprehensive analytics and user management
- **Accessibility**: Built with accessibility best practices
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Supabase** for backend services

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dyslexia-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   └── ui/             # Basic UI components
├── contexts/           # React contexts (Auth, etc.)
├── lib/               # Utility functions and configurations
├── pages/             # Page components
├── App.tsx            # Main app component
└── main.tsx           # App entry point
```

## 🎮 Available Games

1. **Word Recognition**: Test ability to quickly identify and match words
2. **Letter Sequencing**: Arrange letters in correct order to form words
3. **Reading Comprehension**: Read passages and answer questions

## 🔧 Development

- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint`

## 🌟 Key Features

### Authentication
- Secure user registration and login
- Password reset functionality
- Protected routes
- Admin role management

### Dashboard
- Interactive game selection
- Progress tracking
- User profile management
- Assessment history

### Games
- Scientifically validated assessments
- Real-time feedback
- Difficulty levels
- Detailed analytics

### Admin Panel
- User management
- Assessment analytics
- Performance monitoring
- Data export capabilities

## 🎨 Design System

The app uses a comprehensive design system with:
- **Colors**: Primary, secondary, success, warning, danger palettes
- **Typography**: Inter and Poppins font families
- **Components**: Consistent button, card, and form styles
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design approach

## 🔒 Security

- Environment variables for sensitive data
- Protected API routes
- Input validation with Zod
- XSS protection
- CSRF protection via Supabase

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## ♿ Accessibility

Built with accessibility in mind:
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast mode support
- Reduced motion preferences

## 🚀 Deployment

The app can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- Any static hosting service

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please contact the development team or create an issue in the repository.