// Mock authentication service for development
let authStateCallback: ((event: string, session: any) => void) | null = null

export const mockAuth = {
  currentUser: null as any,
  
  signUp: async (email: string, _password: string, username: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = {
      id: 'mock-user-' + Date.now(),
      email,
      created_at: new Date().toISOString(),
      user_metadata: { username }
    }
    
    mockAuth.currentUser = user
    localStorage.setItem('mockUser', JSON.stringify(user))
    
    // Trigger auth state change
    if (authStateCallback) {
      setTimeout(() => {
        authStateCallback?.('SIGNED_IN', { user })
      }, 50)
    }
    
    return { data: { user }, error: null }
  },
  
  signIn: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Admin credentials check
    if (email === 'admin@dyslexia.com' && password !== 'admin123') {
      return { 
        data: { user: null }, 
        error: { message: 'Invalid admin credentials' }
      }
    }
    
    // Simple validation for regular users
    if (password.length < 6) {
      return { 
        data: { user: null }, 
        error: { message: 'Password must be at least 6 characters' }
      }
    }
    
    const user = {
      id: email === 'admin@dyslexia.com' ? 'admin-user-id' : 'mock-user-' + Date.now(),
      email,
      created_at: new Date().toISOString(),
      user_metadata: { 
        username: email === 'admin@dyslexia.com' ? 'admin' : email.split('@')[0],
        is_admin: email === 'admin@dyslexia.com'
      }
    }
    
    mockAuth.currentUser = user
    localStorage.setItem('mockUser', JSON.stringify(user))
    
    // Trigger auth state change
    if (authStateCallback) {
      setTimeout(() => {
        authStateCallback?.('SIGNED_IN', { user })
      }, 50)
    }
    
    return { data: { user }, error: null }
  },
  
  signOut: async () => {
    mockAuth.currentUser = null
    localStorage.removeItem('mockUser')
    
    // Trigger auth state change
    if (authStateCallback) {
      setTimeout(() => {
        authStateCallback?.('SIGNED_OUT', null)
      }, 50)
    }
    
    return { error: null }
  },
  
  getSession: async () => {
    const stored = localStorage.getItem('mockUser')
    if (stored) {
      const user = JSON.parse(stored)
      mockAuth.currentUser = user
      return { data: { session: { user } }, error: null }
    }
    return { data: { session: null }, error: null }
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // Store the callback for later use
    authStateCallback = callback
    
    // Initial call
    const stored = localStorage.getItem('mockUser')
    if (stored) {
      const user = JSON.parse(stored)
      callback('SIGNED_IN', { user })
    } else {
      callback('SIGNED_OUT', null)
    }
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authStateCallback = null
          }
        }
      }
    }
  }
}