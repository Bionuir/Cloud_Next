'use client';
import { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Sidebar from './Sidebar';
import './main.css';

export default function MainPage() {
  const [vistaActiva, setVistaActiva] = useState('perfil');
  const [authView, setAuthView] = useState('login');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  if (!authChecked) return null;

  return (
    <div className="main-container">
      {
        !user
          ? (authView === 'login'
              ? <Login onRegisterClick={() => setAuthView('register')} />
              : <Register onLoginClick={() => setAuthView('login')} />
            )
          : <Sidebar
              vistaActiva={vistaActiva}
              setVistaActiva={setVistaActiva}
              user={user}
            />
      }
    </div>
  );
}
