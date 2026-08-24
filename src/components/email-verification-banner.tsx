'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MailWarning } from 'lucide-react';
import { useAuth } from '@/AuthProvider';
import Modal from '@/Components/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RESEND_COOLDOWN = 30;

export function EmailVerificationBanner() {
  const { user, sendEmailVerificationOtp, verifyEmailOtp } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const hasSentRef = useRef(false);

  const email = typeof user === 'object' && user ? user.email : undefined;

  const handleSend = useCallback(async () => {
    if (!email) return;
    setSending(true);
    try {
      await sendEmailVerificationOtp();
      toast.success(`Verification code sent to ${email}`);
      setCooldown(RESEND_COOLDOWN);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setSending(false);
    }
  }, [email, sendEmailVerificationOtp]);

  // Countdown ticker for the resend cooldown
  useEffect(() => {
    if (!isOpen || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  // Auto-send the first code when the modal opens
  useEffect(() => {
    if (isOpen && !hasSentRef.current) {
      hasSentRef.current = true;
      handleSend();
    }
  }, [isOpen, handleSend]);

  if (typeof user !== 'object' || !user || user.emailVerified) {
    return null;
  }

  const handleOpen = () => {
    setOtp('');
    hasSentRef.current = false;
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setOtp('');
    setCooldown(0);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }
    setVerifying(true);
    try {
      await verifyEmailOtp(otp);
      toast.success('Email verified successfully!');
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired code');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 px-4 py-3'>
        <div className='flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300'>
          <MailWarning className='w-4 h-4 shrink-0' />
          <span>
            Please verify your email address ({user.email}) to secure your
            account.
          </span>
        </div>
        <button
          type='button'
          onClick={handleOpen}
          className='shrink-0 text-sm font-medium bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-md transition-colors'
        >
          Verify now
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} closeOnBackdrop={!verifying}>
        <div className='p-6 sm:p-8 space-y-5'>
          <div>
            <h2 className='text-lg font-semibold text-foreground'>
              Verify your email
            </h2>
            <p className='text-sm text-muted-foreground mt-1'>
              We sent a 6-digit code to{' '}
              <span className='font-medium text-foreground'>
                {user.email}
              </span>
              .
            </p>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='otp'>Verification code</Label>
            <Input
              id='otp'
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

          <button
            type='button'
            onClick={handleVerify}
            disabled={verifying || otp.length !== 6}
            className='w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white h-10 rounded-lg font-medium transition-colors'
          >
            {verifying ? 'Verifying…' : 'Verify email'}
          </button>

          <p className='text-center text-sm text-muted-foreground'>
            Didn&apos;t get a code?{' '}
            <button
              type='button'
              onClick={handleSend}
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
        </div>
      </Modal>
    </>
  );
}
