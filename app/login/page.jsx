'use client';
import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, getIdToken, onAuthStateChanged } from 'firebase/auth';
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

  // Add session check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/main');
      }
    });
    return unsubscribe;
  }, []);

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
              Iniciar Sesión
            </button>
          </form>


          <button onClick={handleGoogle} className="google-btn">
            <span className="google-icon">
              <svg width="18px" height="18px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>
            </span>
            Iniciar con Google
          </button>

          {/* New registration section */}
          <div className="register-section">
            <p>¿Aun no tienes cuenta?</p>
            <button className="register-btn" onClick={() => router.push('/register')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
  <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
  <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
</svg>


              Registrarse
            </button>
          </div>
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
          margin-top: 1.0rem;
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
        /* New Styles for register button */
        .register-section {
          text-align: center;
          margin-top: 1rem;
        }
        .register-section p{
          opacity:0.8
        }
        .register-btn {
          border: 1px solid #A294F9;
          color: #A294F9;
          background-color: transparent;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.3s, color 0.3s;
          width: 100%;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .register-btn:hover,
        .register-btn:focus {
          background-color: #A294F9;
          color: white;
        }
      `}</style>
    </>
  );
}