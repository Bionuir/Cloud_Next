'use client';
import { useState } from 'react';
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
  const router = useRouter();

  async function handleEmailLogin(e) {
    e.preventDefault();
    setError('');

    const formData = { email, password };

    try {
      await loginSchema.validate(formData, { abortEarly: false });
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err) {
      if (err.name === 'ValidationError') {
        setError(err.errors[0]);
      } else {
        console.error('Error al iniciar sesión:', err);
        setError('Correo o contraseña incorrectos.');
      }
    }
  }

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

    router.push('/dashboard');
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') {
      console.log('Popup cerrado por el usuario.');
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
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
