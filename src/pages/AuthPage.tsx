import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Brain, Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'parent', 'teacher']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type SignInForm = z.infer<typeof signInSchema>
type SignUpForm = z.infer<typeof signUpSchema>
type ResetForm = z.infer<typeof resetSchema>

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, resetPassword, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isAdminMode = new URLSearchParams(location.search).get('admin') === 'true'
  const roleParam = new URLSearchParams(location.search).get('role')
  // const from = location.state?.from?.pathname || (isAdminMode ? '/admin' : '/games')

  // Redirect when user becomes authenticated
  React.useEffect(() => {
    if (user && !loading) {
      const redirectPath = user.email === 'admin@dyslexia.com' ? '/admin' : '/games'
      console.log('User authenticated, redirecting to:', redirectPath)
      navigate(redirectPath, { replace: true })
    }
  }, [user, loading, navigate])

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: isAdminMode ? {
      email: 'admin@dyslexia.com',
      password: 'admin123'
    } : undefined
  })

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: (roleParam as 'student' | 'parent' | 'teacher') || 'student'
    }
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const handleSignIn = async (data: SignInForm) => {
    setLoading(true)
    const { error } = await signIn(data.email, data.password)
    setLoading(false)
    
    // The useEffect will handle redirection when user state changes
    if (error) {
      console.error('Sign in failed:', error)
    }
  }

  const handleSignUp = async (data: SignUpForm) => {
    setLoading(true)
    // Modify email based on role for easy identification
    let email = data.email
    if (data.role === 'teacher' && !email.includes('teacher')) {
      email = email.replace('@', '.teacher@')
    } else if (data.role === 'parent' && !email.includes('parent')) {
      email = email.replace('@', '.parent@')
    }
    
    const { error } = await signUp(email, data.password, data.username, data.role)
    setLoading(false)
    
    // The useEffect will handle redirection when user state changes
    if (error) {
      console.error('Sign up failed:', error)
    }
  }

  const handleReset = async (data: ResetForm) => {
    setLoading(true)
    await resetPassword(data.email)
    setLoading(false)
    setMode('signin')
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="floating-shapes">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex justify-center">
              <Brain className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {mode === 'signin' && (isAdminMode ? 'Admin Sign In' : 'Sign in to your account')}
              {mode === 'signup' && 'Create your account'}
              {mode === 'reset' && 'Reset your password'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {mode === 'signin' && (isAdminMode ? 'Access the admin dashboard with your credentials.' : 'Welcome back! Please sign in to continue.')}
              {mode === 'signup' && (roleParam ? `Create your ${roleParam} account to get started.` : 'Join thousands of users improving reading skills.')}
              {mode === 'reset' && 'Enter your email to receive reset instructions.'}
            </p>
            {isAdminMode && mode === 'signin' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Admin credentials:</strong> admin@dyslexia.com / admin123
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {mode === 'signin' && (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...signInForm.register('email')}
                    type="email"
                    className={`input pl-10 ${signInForm.formState.errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {signInForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-danger-600">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...signInForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-10 ${signInForm.formState.errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signInForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-danger-600">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Forgot your password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...signUpForm.register('username')}
                    type="text"
                    className={`input pl-10 ${signUpForm.formState.errors.username ? 'input-error' : ''}`}
                    placeholder="Choose a username"
                  />
                </div>
                {signUpForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-danger-600">
                    {signUpForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...signUpForm.register('email')}
                    type="email"
                    className={`input pl-10 ${signUpForm.formState.errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-danger-600">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...signUpForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-10 ${signUpForm.formState.errors.password ? 'input-error' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-danger-600">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...signUpForm.register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    className={`input pl-10 ${signUpForm.formState.errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                  />
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-danger-600">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  I am a...
                </label>
                <select
                  {...signUpForm.register('role')}
                  className={`input ${signUpForm.formState.errors.role ? 'input-error' : ''}`}
                >
                  <option value="student">Student (Learning Games)</option>
                  <option value="parent">Parent (Monitor Children)</option>
                  <option value="teacher">Teacher (Monitor Students)</option>
                </select>
                {signUpForm.formState.errors.role && (
                  <p className="mt-1 text-sm text-danger-600">
                    {signUpForm.formState.errors.role.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...resetForm.register('email')}
                    type="email"
                    className={`input pl-10 ${resetForm.formState.errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {resetForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-danger-600">
                    {resetForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Email'}
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {mode === 'signin' ? "Don't have an account?" : 
                   mode === 'signup' ? 'Already have an account?' : 
                   'Remember your password?'}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              {mode === 'signin' && (
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create a new account
                </button>
              )}
              {mode === 'signup' && (
                <button
                  onClick={() => setMode('signin')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in to existing account
                </button>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => setMode('signin')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPage