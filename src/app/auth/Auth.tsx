import { useEffect, useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/AuthProvider';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ForgotPasswordModal } from '@/components/forgot-password-modal';

export default function AuthPage({ isLogin }: { isLogin: boolean }) {
  const { signUpUser, loginUser, user, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useRouter();
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  const redirectPath = searchParams?.get('redirect') || '/';

  useEffect(() => {
    if (user !== 'userNotFound' && user !== null) {
      navigate.push(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        await signUpUser(formData.email, formData.password, formData.name);
        toast.success('Account created successfully!');
      } else {
        await loginUser(formData.email, formData.password);
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed');
    }
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4 transition-colors'>
      <div className='w-full max-w-sm'>
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-semibold text-foreground'>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            {isLogin
              ? 'Sign in to keep building with Teacup'
              : 'Start building your site with Teacup'}
          </p>
        </div>

        <div className='bg-card border border-border rounded-2xl shadow-lg p-6 sm:p-8 space-y-5'>
          <button
            type='button'
            onClick={handleGoogleSignIn}
            className='w-full flex items-center justify-center cursor-pointer gap-3 px-4 h-10 border border-border rounded-lg bg-background hover:bg-muted transition-colors text-sm font-medium text-foreground'
          >
            <svg className='w-4 h-4' viewBox='0 0 24 24'>
              <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            Continue with Google
          </button>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='px-3 bg-card text-muted-foreground tracking-wide'>
                Or continue with email
              </span>
            </div>
          </div>

          <div className='space-y-4'>
            {!isLogin && (
              <div className='space-y-1.5'>
                <Label htmlFor='name'>Full name</Label>
                <Input
                  id='name'
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='John Doe'
                />
              </div>
            )}

            <div className='space-y-1.5'>
              <Label htmlFor='email'>Email address</Label>
              <Input
                id='email'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='you@example.com'
              />
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                {isLogin && (
                  <button
                    type='button'
                    onClick={() => setForgotPasswordOpen(true)}
                    className='text-xs text-rose-500 hover:text-rose-600 font-medium'
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='••••••••'
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className='space-y-1.5'>
                <Label htmlFor='confirmPassword'>Confirm password</Label>
                <Input
                  id='confirmPassword'
                  type={showPassword ? 'text' : 'password'}
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder='••••••••'
                />
              </div>
            )}

            {isLogin && (
              <div className='flex items-center gap-2'>
                <Checkbox id='remember' />
                <Label
                  htmlFor='remember'
                  className='text-sm font-normal text-muted-foreground cursor-pointer'
                >
                  Remember me
                </Label>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className='w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white h-10 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group'
            >
              {submitting
                ? 'Please wait…'
                : isLogin
                  ? 'Sign in'
                  : 'Create account'}
              {!submitting && (
                <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              )}
            </button>
          </div>

          <p className='text-center text-sm text-muted-foreground'>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type='button'
              onClick={() =>
                navigate.push(isLogin ? '/auth/signup' : '/auth/login')
              }
              className='text-rose-500 hover:text-rose-600 font-medium'
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className='text-center mt-6 text-xs text-muted-foreground'>
          By continuing, you agree to our{' '}
          <button className='text-rose-500 hover:text-rose-600 underline underline-offset-2'>
            Terms of Service
          </button>{' '}
          and{' '}
          <button className='text-rose-500 hover:text-rose-600 underline underline-offset-2'>
            Privacy Policy
          </button>
        </p>
      </div>

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        initialEmail={formData.email}
      />
    </div>
  );
}
