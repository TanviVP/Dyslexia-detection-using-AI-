import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { mockAuth } from '../lib/mockAuth'
import { toast } from 'sonner'

const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  isTeacher: boolean
  isParent: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isTeacher, setIsTeacher] = useState(false)
  const [isParent, setIsParent] = useState(false)

  useEffect(() => {
    if (isDevelopment) {
      // Use mock auth in development
      const getInitialSession = async () => {
        const { data: { session } } = await mockAuth.getSession()
        setUser(session?.user ?? null)
        const email = session?.user?.email || ''
        setIsAdmin(email === 'admin@dyslexia.com')
        setIsTeacher(email.startsWith('teacher@') || email.includes('.teacher@'))
        setIsParent(email.startsWith('parent@') || email.includes('.parent@'))
        setLoading(false)
      }

      getInitialSession()

      const { data: { subscription } } = mockAuth.onAuthStateChange(
        async (_event, session) => {
          setUser(session?.user ?? null)
          const email = session?.user?.email || ''
          setIsAdmin(email === 'admin@dyslexia.com')
          setIsTeacher(email.startsWith('teacher@') || email.includes('.teacher@'))
          setIsParent(email.startsWith('parent@') || email.includes('.parent@'))
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } else {
      // Use real Supabase auth in production
      const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await checkAdminStatus(session.user.id)
          const email = session.user.email || ''
          setIsTeacher(email.startsWith('teacher@'))
          setIsParent(email.startsWith('parent@'))
        }
        
        setLoading(false)
      }

      getInitialSession()

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await checkAdminStatus(session.user.id)
            const email = session.user.email || ''
            setIsTeacher(email.startsWith('teacher@') || email.includes('.teacher@'))
            setIsParent(email.startsWith('parent@') || email.includes('.parent@'))
          } else {
            setIsAdmin(false)
            setIsTeacher(false)
            setIsParent(false)
          }
          
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [])

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()
      
      setIsAdmin(profile?.is_admin || false)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('Attempting to sign up with:', { email, username })
      
      const { data, error } = isDevelopment 
        ? await mockAuth.signUp(email, password, username)
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: username,
              },
            },
          })

      console.log('Signup response:', { data, error })

      if (error) {
        console.error('Signup error:', error)
        toast.error('Sign up failed', {
          description: error.message,
        })
        return { error }
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id)
        
        if (!isDevelopment) {
          // Only try to create profile in real Supabase
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert([
                {
                  id: data.user.id,
                  username: username,
                  email: email,
                  is_admin: email === 'admin@dyslexia.com',
                },
              ], {
                onConflict: 'id'
              })

            if (profileError) {
              console.warn('Profile creation warning (might be handled by trigger):', profileError)
            } else {
              console.log('Profile created successfully')
            }
          } catch (profileError) {
            console.warn('Profile creation failed (might be handled by trigger):', profileError)
          }
        }

        toast.success('Account created successfully!', {
          description: 'Welcome to DysLexia Support Platform',
        })
      }

      return { error: null }
    } catch (error: any) {
      console.error('Unexpected signup error:', error)
      toast.error('Sign up failed', {
        description: error.message || 'An unexpected error occurred',
      })
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = isDevelopment
        ? await mockAuth.signIn(email, password)
        : await supabase.auth.signInWithPassword({
            email,
            password,
          })

      if (error) {
        toast.error('Sign in failed', {
          description: error.message,
        })
        return { error }
      }

      toast.success('Welcome back!', {
        description: 'Successfully signed in',
      })

      return { error: null }
    } catch (error: any) {
      toast.error('Sign in failed', {
        description: error.message || 'An unexpected error occurred',
      })
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = isDevelopment
        ? await mockAuth.signOut()
        : await supabase.auth.signOut()
      
      if (error) {
        toast.error('Sign out failed', {
          description: error.message,
        })
      } else {
        toast.success('Signed out successfully')
        setUser(null)
        setIsAdmin(false)
        setIsTeacher(false)
        setIsParent(false)
      }
    } catch (error: any) {
      toast.error('Sign out failed', {
        description: error.message || 'An unexpected error occurred',
      })
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      })

      if (error) {
        toast.error('Password reset failed', {
          description: error.message,
        })
        return { error }
      }

      toast.success('Password reset email sent!', {
        description: 'Check your email for reset instructions',
      })

      return { error: null }
    } catch (error: any) {
      toast.error('Password reset failed', {
        description: error.message || 'An unexpected error occurred',
      })
      return { error }
    }
  }

  const value = {
    user,
    loading,
    isAdmin,
    isTeacher,
    isParent,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}