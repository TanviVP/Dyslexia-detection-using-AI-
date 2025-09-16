# Dyslexia Support Backend

A Node.js/Express backend with MongoDB for the Dyslexia Support website.

## Features

- **Authentication**: JWT-based auth with social login support
- **User Management**: Complete user profiles with accessibility settings
- **Social OAuth**: Google, Facebook, GitHub, LinkedIn integration
- **Security**: Rate limiting, helmet, input validation
- **Accessibility**: Built-in accessibility preference storage

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- OAuth app credentials (optional, for social login)

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Add OAuth credentials for social login (optional)

3. **Start MongoDB:**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud database

4. **Run the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Social Authentication
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth
- `GET /api/auth/github` - GitHub OAuth
- `GET /api/auth/linkedin` - LinkedIn OAuth

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/accessibility` - Update accessibility settings
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Delete account
- `GET /api/users/stats` - Get user statistics

## Database Schema

### User Model
- Basic info: firstName, lastName, email, password
- User type: individual, parent, educator, professional, researcher
- Social accounts: OAuth provider data
- Accessibility settings: font size, contrast, motion preferences
- Account status: verification, login attempts, locks

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Account lockout after failed attempts
- Helmet.js security headers
- CORS configuration

## OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set redirect URI: `http://localhost:5000/api/auth/facebook/callback`

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set callback URL: `http://localhost:5000/api/auth/github/callback`

### LinkedIn OAuth
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create new app
3. Add Sign In with LinkedIn product
4. Set redirect URL: `http://localhost:5000/api/auth/linkedin/callback`

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/dyslexia-support

# JWT
JWT_SECRET=your-super-secret-jwt-key

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Session
SESSION_SECRET=your-session-secret

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run tests
npm test

# Check API health
curl http://localhost:5000/api/health
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set secure JWT_SECRET and SESSION_SECRET
4. Configure OAuth redirect URLs for production domain
5. Use HTTPS in production
6. Consider using PM2 for process management

## API Testing

You can test the API using tools like Postman or curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123","userType":"individual"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```