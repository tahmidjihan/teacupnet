'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/AuthProvider';
import Modal from '@/Components/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RESEND_COOLDOWN = 30;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  initialEmail = '',
}: ForgotPasswordModalProps) {
  const { requestPasswordResetOtp, resetPasswordWithOtp } = useAuth();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setStep('email');
      setOtp('');
      setPassword('');
      setConfirmPassword('');
      setCooldown(0);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    if (!isOpen || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  const handleSendCode = async () => {
    if (!email) {
      toast.error('Enter your email address');
      return;
    }
    setSending(true);
    try {
      await requestPasswordResetOtp(email);
      toast.success(`Reset code sent to ${email}`);
      setStep('reset');
      setCooldown(RESEND_COOLDOWN);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset code');
    } finally {
      setSending(false);
    }
  };

  const handleReset = async () => {
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await resetPasswordWithOtp(email, otp, password);
      toast.success('Password reset — sign in with your new password');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnBackdrop={!submitting}>
      <div className='p-6 sm:p-8 space-y-5'>
        <div>
          <h2 className='text-lg font-semibold text-foreground'>
            Reset your password
          </h2>
          <p className='text-sm text-muted-foreground mt-1'>
            {step === 'email'
              ? "Enter your email and we'll send you a reset code."
              : (
                <>
                  We sent a 6-digit code to{' '}
                  <span className='font-medium text-foreground'>{email}</span>.
                </>
              )}
          </p>
        </div>

        {step === 'email' ? (
          <>
            <div className='space-y-1.5'>
              <Label htmlFor='reset-email'>Email address</Label>
              <Input
                id='reset-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
              />
            </div>

            <button
              type='button'
              onClick={handleSendCode}
              disabled={sending}
              className='w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white h-10 rounded-lg font-medium transition-colors'
            >
              {sending ? 'Sending…' : 'Send reset code'}
            </button>
          </>
        ) : (
          <>
            <div className='space-y-1.5'>
              <Label htmlFor='reset-otp'>Verification code</Label>
              <Input
                id='reset-otp'
                inputMode='numeric'
                autoComplete='one-time-code'
                maxLength={6}
                placeholder='123456'
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className='tracking-[0.5em] text-center text-lg font-medium'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='reset-password'>New password</Label>
              <Input
                id='reset-password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='reset-confirm-password'>Confirm password</Label>
              <Input
                id='reset-confirm-password'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='••••••••'
              />
            </div>

            <button
              type='button'
              onClick={handleReset}
              disabled={submitting || otp.length !== 6}
              className='w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white h-10 rounded-lg font-medium transition-colors'
            >
              {submitting ? 'Resetting…' : 'Reset password'}
            </button>

            <p className='text-center text-sm text-muted-foreground'>
              Didn&apos;t get a code?{' '}
              <button
                type='button'
                onClick={handleSendCode}
                disabled={sending || cooldown > 0}
                className='text-rose-500 hover:text-rose-600 font-medium disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {sending
                  ? 'Sending…'
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend code'}
              </button>
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
