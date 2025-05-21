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

  // Agregar este useEffect para restaurar el cooldown al cargar la página:
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
    if (cooldownActive) return; // evita envío durante el cooldown
    setError('');
    const formData = { email, password };

    try {
      await loginSchema.validate(formData, { abortEarly: false });
      await signInWithEmailAndPassword(auth, email, password);
      // En login exitoso: reiniciar conteos y limpiar localStorage
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
        // Guardar la marca de tiempo del último fallo
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

  // Nuevo useEffect para reiniciar el contador de fallos tras 5 minutos de inactividad
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

      // Enviar datos a tu backend
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

      // Reiniciar contador y redirigir
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
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6 mt-20">
      <h1 className="text-2xl font-semibold text-center text-gray-800">Iniciar Sesión</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={cooldownActive}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Entrar
        </button>
      </form>

      <div className="flex items-center justify-center space-x-2">
        <span className="text-gray-400">o</span>
      </div>

      <button
        onClick={handleGoogle}
        className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        Iniciar con Google
      </button>
    </div>
  );
}