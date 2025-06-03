'use client';
import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, getIdToken } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';

const loginSchema = yup.object().shape({
  email: yup.string().email('Correo inválido').required('El correo es obligatorio'),
  password: yup.string().required('La contraseña es obligatoria'),
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const cooldownExpiration = localStorage.getItem('cooldownExpiration');
    if (cooldownExpiration) {
      const expirationTime = Number(cooldownExpiration);
      const currentTime = Date.now();
      if (currentTime < expirationTime) {
        const timeLeft = Math.ceil((expirationTime - currentTime) / 1000);
        setCooldownTimeLeft(timeLeft);
        setCooldownActive(true);
        setError(`Intente de nuevo en ${timeLeft} segundo${timeLeft !== 1 ? 's' : ''}.`);
      } else {
        localStorage.removeItem('cooldownExpiration');
        localStorage.removeItem('failedAttempts');
      }
    }
  }, []);

  useEffect(() => {
    if (!cooldownActive) return;
    const interval = setInterval(() => {
      setCooldownTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          setCooldownActive(false);
          setError('');
          return 0;
        } else {
          setError(`Intente de nuevo en ${newTime} segundo${newTime !== 1 ? 's' : ''}.`);
          return newTime;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownActive]);

  async function handleEmailLogin(e) {
    e.preventDefault();
    if (cooldownActive) return;
    setError('');
    const formData = { email, password };

    try {
      await loginSchema.validate(formData, { abortEarly: false });
      await signInWithEmailAndPassword(auth, email, password);
      setFailedAttempts(0);
      localStorage.removeItem('cooldownExpiration');
      localStorage.removeItem('failedAttempts');
      localStorage.removeItem('lastFailure');
      router.push('/main');
    } catch (err) {
      if (err.name === 'ValidationError') {
        setError(err.errors[0]);
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem('lastFailure', Date.now());
        let lockout = 0;
        if (newAttempts === 5) {
          lockout = 5;
        } else if (newAttempts === 6) {
          lockout = 10;
        } else if (newAttempts >= 7) {
          lockout = 30;
        }
        if (lockout > 0) {
          const expiration = Date.now() + lockout * 1000;
          localStorage.setItem('cooldownExpiration', expiration);
          localStorage.setItem('failedAttempts', newAttempts);
          setCooldownTimeLeft(lockout);
          setCooldownActive(true);
          setError(`Intente de nuevo en ${lockout} segundo${lockout !== 1 ? 's' : ''}.`);
        } else {
          setError('Usuario o contraseña incorrectas');
        }
      }
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const lastFailure = localStorage.getItem('lastFailure');
      if (lastFailure && Date.now() - Number(lastFailure) >= 5 * 60 * 1000) {
        localStorage.removeItem('failedAttempts');
        localStorage.removeItem('cooldownExpiration');
        localStorage.removeItem('lastFailure');
        setFailedAttempts(0);
        setCooldownActive(false);
        setCooldownTimeLeft(0);
        setError('');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleGoogle() {
    setError('');
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const user = credential.user;
      const token = await getIdToken(user);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: user.displayName,
          email: user.email,
          googleId: user.uid
        })
      });
      setFailedAttempts(0);
      router.push('/main');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log('loginpopup cerrado');
      } else {
        console.error('Error con Google:', err);
        setError('No se pudo iniciar sesión con Google.');
      }
    }
  }

  return (
    <>
      <div className="page">
        <div className="login-card">
          <h1 className="login-heading">Iniciar Sesión</h1>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" disabled={cooldownActive} className="perfil-save-btn">
              Iniciar Sesion
            </button>
          </form>

          <div className="or-separator">
            <span>o</span>
          </div>

          <button onClick={handleGoogle} className="google-btn">
            <span className="google-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.66 0 6.965 1.23 9.54 3.27l7.2-7.2C36.485 2.36 30.09 0 24 0 14.48 0 5.8 5.74 2.12 13.95l8.28 6.44C12.64 13.08 17.86 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.92 24.36c0-1.57-.14-3.08-.39-4.54H24v8.6h12.67c-.54 2.9-2.1 5.38-4.47 7.02l7.26 5.64C44.12 36.04 46.92 30.84 46.92 24.36z"/>
                <path fill="#FBBC05" d="M10.4 28.16c-.84-2.5-1.32-5.18-1.32-7.89s.48-5.38 1.32-7.89L2.12 13.95C.84 17.5 0 21.34 0 25.27c0 3.93.84 7.77 2.12 11.32l8.28-8.43z"/>
                <path fill="#34A853" d="M24 48c6.09 0 11.24-2.01 15-5.47l-7.26-5.64c-2.04 1.37-4.68 2.16-7.74 2.16-5.94 0-10.98-4.02-12.78-9.42l-8.28 6.44C5.8 42.27 14.48 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            </span>
            Iniciar con Google
          </button>
        </div>
      </div>
      <style jsx>{`
        .page {
          background-color: #A294F9;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-card {
          background-color: #F5EFFF;
          padding: 24px;
          border-radius: 1rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
          width: 100%;
          max-width: 400px;
        }
        .login-heading {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          text-align: center;
          margin-bottom: 1rem;
        }
        .error-box {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 8px 16px;
          border-radius: 0.375rem;
          text-align: center;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }
        .form-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 1rem;
        }
        .perfil-save-btn {
          margin-top: 0.25rem;
          background-color: #A294F9;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.3s;
          width: 100%;
        }
        .perfil-save-btn:hover:enabled {
          background-color: #8A80E2;
        }
        .perfil-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background-color: #fff;
          color: #555;
          border: 1px solid #ccc;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.3s, border 0.3s;
          width: 100%;
        }
        .google-btn:hover {
          background-color: #f7f7f7;
          border-color: #aaa;
        }
        .google-icon {
          display: flex;
          align-items: center;
        }
        .or-separator {
          text-align: center;
          margin: 1rem 0;
          color: #718096;
        }
      `}</style>
    </>
  );
}