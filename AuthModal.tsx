



import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';
import { auth } from '../lib/firebase';
// FIX: Corrected Firebase import path for modular SDK to resolve 'has no exported member' errors.
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, UserCredential, sendPasswordResetEmail } from '@firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpSuccess: () => void;
}

type AuthView = 'login' | 'signup' | 'verify';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSignUpSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Verification-specific state
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [userCredentialForVerification, setUserCredentialForVerification] = useState<UserCredential | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setView('login');
      setEmail('');
      setPassword('');
      setUsername('');
      setError(null);
      setMessage(null);
      setLoading(false);
      setVerificationCode('');
      setSentCode(null);
      setUserCredentialForVerification(null);
      setResendCooldown(0);
      setShowForgotPassword(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendVerificationCode = (userEmail: string): string => {
      const code = generateCode();
      setSentCode(code);
      // In a real app, this would be an API call to a backend to send an email.
      // For now, we log it to the console for the user to see.
      console.log(`[Velora AI] Verification code for ${userEmail} is: ${code}`);
      return code;
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        // The onAuthStateChanged listener in App.tsx will handle success
      } else { // Sign Up
        if (username.trim().length < 3) {
            setError("Username must be at least 3 characters long.");
            setLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUserCredentialForVerification(userCredential);
        
        // Don't log in yet, start verification process
        sendVerificationCode(userCredential.user.email!);
        setMessage(`A 6-digit code was sent to ${userCredential.user.email}.`);
        setView('verify');
      }
    } catch (err: any) {
      let errorMessage = "An unknown error occurred.";
      switch (err.code) {
        case 'auth/configuration-not-found':
            errorMessage = 'Firebase configuration is missing or invalid. Please check your setup in lib/firebase.ts.';
            break;
        case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            errorMessage = 'Wrong password. Please Try Again.';
            if (view === 'login') {
                setShowForgotPassword(true);
            }
            break;
        case 'auth/email-already-in-use':
            errorMessage = 'An account already exists with this email address.';
            break;
        case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters long.';
            break;
        case 'auth/invalid-api-key':
            errorMessage = 'Invalid Firebase API Key. Please check your configuration in lib/firebase.ts.';
            break;
        default:
            errorMessage = err.message || 'Failed to authenticate. Please try again.';
            break;
      }
      setError(errorMessage);
    } finally {
      if (view !== 'verify') {
          setLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
        setError('Please enter your email to receive a password reset link.');
        return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
        await sendPasswordResetEmail(auth, email);
        setMessage(`Password reset link sent to ${email}. Check your inbox (and spam folder).`);
    } catch (err: any) {
        if (err.code === 'auth/invalid-email') {
            setError('Please enter a valid email address.');
        } else {
            // For other errors, including user-not-found, we show a success message
            // to prevent email enumeration attacks.
            setMessage(`Password reset link sent to ${email}. Check your inbox (and spam folder).`);
        }
    } finally {
        setLoading(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (verificationCode === sentCode) {
        if (!userCredentialForVerification) {
            setError("An unexpected error occurred. Please try signing up again.");
            setLoading(false);
            setView('signup');
            return;
        }
        await updateProfile(userCredentialForVerification.user, {
            displayName: username.trim()
        });
        onSignUpSuccess();
    } else {
        setError("Invalid verification code. Please try again.");
        setLoading(false);
    }
  };
  
  const handleResendCode = () => {
      if (resendCooldown > 0 || !userCredentialForVerification?.user?.email) return;
      sendVerificationCode(userCredentialForVerification.user.email);
      setMessage('A new verification code has been sent.');
      setResendCooldown(60);
  };

  const renderContent = () => {
    if (view === 'verify') {
        return (
            <>
                {message && !error && <p className="text-center text-sm text-green-300 mb-4">{message}</p>}
                <p className="text-center text-xs text-slate-400 mb-4">For demonstration purposes, the code has been logged to your browser's developer console.</p>
                {error && <div className="text-center p-3 mb-4 bg-red-500/20 text-red-300 rounded-lg"><p>{error}</p></div>}
                <form className="space-y-4" onSubmit={handleVerifyCode}>
                    <div>
                        <label htmlFor="code" className="sr-only">Verification Code</label>
                        <input
                          type="text"
                          name="code"
                          id="code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-400 text-center tracking-[0.5em]"
                          placeholder="______"
                          maxLength={6}
                          required
                          disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-transform transform hover:scale-105 duration-200 disabled:bg-sky-300 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>
            </>
        );
    }

    return (
        <>
            {error && <div className="text-center p-3 mb-4 bg-red-500/20 text-red-300 rounded-lg"><p>{error}</p></div>}
            {message && <div className="text-center p-3 mb-4 bg-green-500/20 text-green-300 rounded-lg"><p>{message}</p></div>}
            <form className="space-y-4" onSubmit={handleAuthAction}>
                {view === 'signup' && (
                  <div>
                      <label htmlFor="username" className="sr-only">Username</label>
                      <input
                      type="text"
                      name="username"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-400"
                      placeholder="Username (min. 3 characters)"
                      required
                      disabled={loading}
                      />
                  </div>
                )}
                <div>
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-400"
                    placeholder="Email address"
                    required
                    disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder:text-slate-400"
                        placeholder="Password"
                        required
                        disabled={loading}
                    />
                     {view === 'login' && showForgotPassword && (
                        <div className="text-right mt-2">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm font-medium text-sky-500 hover:text-sky-400"
                                disabled={loading}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-transform transform hover:scale-105 duration-200 disabled:bg-sky-300 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : (view === 'login' ? 'Log In' : 'Sign Up')}
                </button>
            </form>
        </>
    );
  };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-transform duration-300 scale-95 animate-modal-pop-in">
        <div className="p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close authentication modal"
          >
            <XIcon />
          </button>
          
          <h2 id="auth-modal-title" className="text-2xl font-bold text-center text-slate-100 mb-2">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup' && 'Create Account'}
            {view === 'verify' && 'Verify Your Email'}
          </h2>
          <p className="text-center text-slate-400 mb-8">
            {view === 'verify' ? 'Enter the code sent to your email' : 'to continue to Velora AI'}
          </p>

          {renderContent()}

          <div className="text-center text-sm text-slate-400 mt-8">
              {view === 'login' && (
                  <p>Don't have an account?{' '}
                      <button onClick={() => { setView('signup'); setError(null); setMessage(null); setShowForgotPassword(false); }} className="font-medium text-sky-500 hover:text-sky-400" disabled={loading}>Sign Up</button>
                  </p>
              )}
              {view === 'signup' && (
                   <p>Already have an account?{' '}
                       <button onClick={() => { setView('login'); setError(null); setMessage(null); }} className="font-medium text-sky-500 hover:text-sky-400" disabled={loading}>Log In</button>
                  </p>
              )}
              {view === 'verify' && (
                   <button onClick={handleResendCode} className="font-medium text-sky-500 hover:text-sky-400 disabled:text-slate-500 disabled:cursor-not-allowed" disabled={loading || resendCooldown > 0}>
                       {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                   </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};