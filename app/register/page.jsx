'use client';
import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, getIdToken, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import './register.css';

const registerSchema = yup.object().shape({
  nombre: yup
    .string()
    .trim()
    .test('allowed-chars', '', function (value) {
      if (!value) return true;
      const forbidden = value.match(/[^\p{L}\p{N}\s]/gu);
      if (forbidden) {
        const unique = [...new Set(forbidden)].join(', ');
        return this.createError({ message: `El nombre contiene caracteres no permitidos: ${unique}` });
      }
      return true;
    })
    .required('El nombre es obligatorio'),
  apellido: yup
    .string()
    .trim()
    .test('allowed-chars', '', function (value) {
      if (!value) return true;
      const forbidden = value.match(/[^\p{L}\p{N}\s]/gu);
      if (forbidden) {
        const unique = [...new Set(forbidden)].join(', ');
        return this.createError({ message: `El apellido contiene caracteres no permitidos: ${unique}` });
      }
      return true;
    })
    .required('El apellido es obligatorio'),
  email: yup
    .string()
    .trim()
    .email('Correo inválido')
    .test('complete-email', '', function (value) {
      if (!value) return true;
      let missing = [];
      if (!value.includes('@')) {
        missing.push('la "@"');
      } else {
        const [local, domain] = value.split('@');
        if (!local) missing.push('la parte local');
        if (!domain) {
          missing.push('la parte de dominio');
        } else if (!domain.includes('.')) {
          missing.push('determina el dominio');
        }
      }
      if (missing.length > 0) {
        return this.createError({ message: `El correo está incompleto, falta: ${missing.join(', ')}` });
      }
      return true;
    })
    .required('El correo es obligatorio'),
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
  sexo: yup
    .string()
    .oneOf(['masculino', 'femenino', 'otro', ''], 'Valor inválido')
    .notRequired(),
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

  // Add session check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/main');
      }
    });
    return unsubscribe;
  }, []);

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
          <h1 className="register-heading">Registrarse</h1>

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

          <button onClick={handleGoogle} className="google-btn">
            <span className="google-icon">
              <svg width="18px" height="18px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>
            </span>
            Registrarse con Google
          </button>

          {/* New login section */}
          <div className="login-section">
            <p>¿Ya tienes una cuenta?</p>
            <button type="button" className="login-btn" onClick={() => router.push('/login')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
              </svg>
              Iniciar sesion
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
