'use client';
import React, { useState, useEffect, useContext, createContext } from 'react';
import { authClient } from '@/lib/auth-client';
import Spinner from '@/Components/Spinner';
import type { CompanyData, User } from '@/types/schema';

interface valueType {
  session: any | null;
  user: any | null | 'userNotFound';
  signUpUser: (email: string, password: string, name: string) => Promise<any>;
  loginUser: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUserCompanyInfo: (data: CompanyData) => Promise<void>;
  sendEmailVerificationOtp: () => Promise<void>;
  verifyEmailOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void> | void;
}

export const authContext = createContext({} as valueType);
export const useAuth = () => useContext(authContext);

export default function AuthProviderBetterAuth({
  children,
}: React.PropsWithChildren) {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<User | null | 'userNotFound'>(
    'userNotFound',
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: sessionData } = await authClient.getSession();
        setSession(sessionData);
        setUser(sessionData?.user || 'userNotFound');
      } catch (error) {
        console.error('Error getting session:', error);
        setUser('userNotFound');
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  if (loading) {
    return (
      <div className='h-screen w-full flex items-center justify-center bg-slate-50'>
        <Spinner size='lg' />
      </div>
    );
  }

  async function signUpUser(email: string, password: string, name: string) {
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        throw new Error(error.message || 'Sign up failed');
      }

      localStorage.setItem('token', JSON.stringify(data?.token));

      setTimeout(() => {
        window.location.href = '/welcome';
      }, 200);

      return data;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async function loginUser(email: string, password: string) {
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || 'Login failed');
      }

      localStorage.setItem('token', JSON.stringify(data?.token));

      setTimeout(() => {
        window.location.href = '/welcome';
      }, 200);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function signInWithGoogle(): Promise<void> {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/welcome`,
      });
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  async function updateUserCompanyInfo(data: CompanyData): Promise<void> {
    try {
      if (!user || user === 'userNotFound') {
        throw new Error('User not found');
      }
      await authClient.updateUser({
        // @ts-ignore
        companyId: data.id,
      });

      // Immediate session refresh to get updated user data from server
      const { data: sessionData } = await authClient.getSession();
      if (sessionData?.user) {
        setSession(sessionData);
        setUser(sessionData.user as User);
      }

      // console.log('Company info updated successfully:', data.id);
    } catch (error: any) {
      console.error('Error updating user company info:', error);
      // Attempt to refresh session even on error to ensure consistency
      try {
        const { data: sessionData } = await authClient.getSession();
        setSession(sessionData);
        setUser((sessionData?.user as User) || 'userNotFound');
      } catch (refreshError) {
        console.error(
          'Error refreshing session after update failure:',
          refreshError,
        );
      }
      throw error;
    }
  }

  async function sendEmailVerificationOtp(): Promise<void> {
    try {
      if (!user || user === 'userNotFound') {
        throw new Error('User not found');
      }
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: user.email,
        type: 'email-verification',
      });

      if (error) {
        throw new Error(error.message || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Send email verification OTP error:', error);
      throw error;
    }
  }

  async function verifyEmailOtp(otp: string): Promise<void> {
    try {
      if (!user || user === 'userNotFound') {
        throw new Error('User not found');
      }
      const { error } = await authClient.emailOtp.verifyEmail({
        email: user.email,
        otp,
      });

      if (error) {
        throw new Error(error.message || 'Invalid or expired code');
      }

      const { data: sessionData } = await authClient.getSession();
      if (sessionData?.user) {
        setSession(sessionData);
        setUser(sessionData.user as User);
      }
    } catch (error: any) {
      console.error('Verify email OTP error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await authClient.signOut();
      setUser('userNotFound');
      localStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
      setUser('userNotFound');
      localStorage.clear();
    }
  }

  const value: valueType = {
    session,
    user,
    signUpUser,
    loginUser,
    signInWithGoogle,
    updateUserCompanyInfo,
    sendEmailVerificationOtp,
    verifyEmailOtp,
    logout,
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}
