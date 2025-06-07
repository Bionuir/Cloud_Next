'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Sidebar from './Sidebar';
import './main.css';

export default function MainPage() {
  const [vistaActiva, setVistaActiva] = useState('perfil');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <div className="main-container">
      <Sidebar
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        user={user}
      />
    </div>
  );
}
