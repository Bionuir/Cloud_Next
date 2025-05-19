'use client';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      if (!u) return router.push('/login');
      setUser(u);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="p-4 max-w-xl mx-auto mt-10 bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-semibold">¡Bienvenido, {user.displayName || user.email}!</h1>
      <p className="text-gray-600">UID: {user.uid}</p>

      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
