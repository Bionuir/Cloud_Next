'use client';
import { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, getIdToken } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';

const registerSchema = yup.object().shape({
  nombre: yup.string().trim().required('El nombre es obligatorio'),
  apellido: yup.string().trim().required('El apellido es obligatorio'),
  email: yup.string().email('Correo inválido').required('El correo es obligatorio'),
  password: yup
    .string()
    .transform(value => value === "" ? undefined : value)
    .min(6, 'Mínimo 6 caracteres')
    .notRequired(),
  direccion: yup
    .string()
    .trim()
    .transform(value => value === "" ? undefined : value)
    .notRequired(),
  sexo: yup.string().oneOf(['masculino', 'femenino', 'otro', ''], 'Valor inválido').notRequired(),
  telefono: yup
    .string()
    .transform(value => value === "" ? undefined : value)
    .matches(/^[0-9\-+()\s]*$/, 'Teléfono inválido')
    .min(9, 'El telefono debe tener al menos 9 caracteres')
    .max(9, 'El telefono no puede tener más de 9 caracteres')
    .notRequired(),
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

      router.push('/main');
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

      router.push('/main');
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
    <>
      <div className="page">
        <div className="register-card">
          <h1 className="register-heading">Registro</h1>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailRegister}>
            <div className="flex-row">
              <div className="half">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="half">
                <label className="form-label">Apellido *</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={e => setApellido(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo electrónico *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="flex-row">
              <div className="half">
                <label className="form-label">Sexo</label>
                <select
                  value={sexo}
                  onChange={e => setSexo(e.target.value)}
                  className="form-input"
                >
                  <option value="">No seleccionado</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="half">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" className="perfil-save-btn">
              Registrarse
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
            Registrarse con Google
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
          padding: 1rem;
        }
        .register-card {
          background-color: #F5EFFF;
          padding: 24px;
          border-radius: 1rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
          width: 100%;
          max-width: 512px;
        }
        .register-heading {
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
        .flex-row {
          display: flex;
          gap: 16px;
          margin-bottom: 1rem;
        }
        .half {
          flex: 1;
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
