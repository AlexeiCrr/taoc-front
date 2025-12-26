import { Amplify } from 'aws-amplify'
import {
  signInWithRedirect,
  signOut as amplifySignOut,
  getCurrentUser,
  fetchAuthSession,
} from '@aws-amplify/auth'
import cognitoConfig from '../config/cognito'
import type { User } from '../types/auth.types'

Amplify.configure(cognitoConfig)

class AuthService {
  /**
   * Sign in with Cognito hosted UI (redirect flow)
   */
  async signIn(): Promise<void> {
    await signInWithRedirect()
  }

  /**
   * Sign out and redirect to sign out URL
   */
  async signOut(): Promise<void> {
    await amplifySignOut()
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser()
      return true
    } catch {
      return false
    }
  }

  /**
   * Get current authenticated user
   */
  async getUser(): Promise<User | null> {
    try {
      const currentUser = await getCurrentUser()
      const session = await fetchAuthSession()

      // Get claims from ID token instead of fetching user attributes
      const idToken = session.tokens?.idToken
      const claims = idToken?.payload || {}

      return {
        username: currentUser.username,
        email: (claims.email as string) || '',
        attributes: {
          sub: (claims.sub as string) || currentUser.userId,
          email: (claims.email as string) || '',
          email_verified: claims.email_verified === true || claims.email_verified === 'true',
          ...claims,
        },
      }
    } catch {
      return null
    }
  }

  /**
   * Get ID token for API requests
   */
  async getIdToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.idToken?.toString() || null
    } catch {
      return null
    }
  }

  /**
   * Get access token for API requests
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.accessToken?.toString() || null
    } catch {
      return null
    }
  }

  /**
   * Check if token is still valid
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const session = await fetchAuthSession()
      const expiresAt = session.tokens?.accessToken?.payload.exp
      if (!expiresAt) return false

      const now = Math.floor(Date.now() / 1000)
      return expiresAt > now
    } catch {
      return false
    }
  }
}

export const authService = new AuthService()
