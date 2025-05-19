'use client';
import { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, getIdToken } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';

const registerSchema = yup.object().shape({
  nombre: yup.string().trim().required('El nombre es obligatorio'),
  apellido: yup.string().trim(),
  email: yup.string().email('Correo inválido').required('El correo es obligatorio'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es obligatoria'),
  direccion: yup.string().trim(),
  sexo: yup.string().oneOf(['masculino', 'femenino', 'otro', ''], 'Valor inválido'),
  telefono: yup
    .string()
    .matches(/^[0-9\-+()\s]*$/, 'Teléfono inválido')
    .min(9, 'Mínimo 9 caracteres')
    .max(9, 'Máximo 9 caracteres'),
});

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [direccion, setDireccion] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleEmailRegister(e) {
    e.preventDefault();
    setError('');

    const formData = { nombre, apellido, email, password, direccion, sexo, telefono };

    try {
      await registerSchema.validate(formData, { abortEarly: false });

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await getIdToken(credential.user);

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, apellido, direccion, sexo, telefono })
      });

      router.push('/dashboard');
    } catch (err) {
      if (err.name === 'ValidationError') {
        setError(err.errors[0]); // Muestra solo el primer error
      } else {
        console.error('Error al registrar:', err);
        setError('Error al registrar usuario.');
      }
    }
  }

  async function handleGoogle() {
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
          googleId: user.uid,
          apellido,
          direccion,
          sexo,
          telefono
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
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-6 mt-10">
      <h1 className="text-2xl font-semibold text-center text-gray-800">Registro</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailRegister} className="space-y-4">
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              type="text"
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input
            type="text"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
            <select
              value={sexo}
              onChange={e => setSexo(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">No seleccionado</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Registrarse
        </button>
      </form>

      <div className="flex items-center justify-center space-x-2">
        <span className="text-gray-400">o</span>
      </div>

      <button
        onClick={handleGoogle}
        className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        Registrarse con Google
      </button>
    </div>
  );
}
