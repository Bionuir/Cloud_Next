'use client';

import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { useEffect, useState } from 'react';

export default function VistaPerfil({ user, datosUsuario }) {
  const router = useRouter();
  const [terapeutas, setTerapeutas] = useState([]);
  const [tipoSel, setTipoSel] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Cargar lista de terapeutas si el usuario es terapeuta
  useEffect(() => {
    if (datosUsuario?.rol === 4) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terapeuta`)
        .then(res => res.json())
        .then(data => setTerapeutas(data))
        .catch(err => console.error('[VistaPerfil] Error al cargar terapeutas:', err));
    }
  }, [datosUsuario]);

  // Sincronizar tipoSel cuando se actualice tipo_terapeuta
  useEffect(() => {
    if (datosUsuario?.tipo_terapeuta) {
      setTipoSel(datosUsuario.tipo_terapeuta);
    }
  }, [datosUsuario?.tipo_terapeuta]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('[VistaPerfil] Error al cerrar sesión:', error);
    }
  };

  const handleSelect = (e) => {
    setTipoSel(e.target.value);
    setMsg('');
  };

  const handleSave = async () => {
    if (!tipoSel) {
      setMsg('Debes seleccionar un tipo de terapeuta.');
      return;
    }

    setLoading(true);
    setMsg('');

    const userId = user?.uid;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/terapeuta`;
    const body = { tipo_terapeuta: tipoSel };

    console.log('[VistaPerfil] PUT ->', url, body);

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log('[VistaPerfil] respuesta:', res.status, data);

      if (!res.ok) {
        throw new Error(data.error || `Status ${res.status}`);
      }

      setMsg('Tipo de terapeuta guardado correctamente');
    } catch (error) {
      console.error('[VistaPerfil] Error al actualizar tipo_terapeuta:', error);
      setMsg('No se pudo actualizar. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  if (!datosUsuario) return <p>Cargando perfil...</p>;

  const mostrarDato = (v) => (v || 'No establecido');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Perfil del Usuario</h1>
      <div className="bg-gray-50 border p-4 rounded-xl max-w-md space-y-3">
        <p><strong>Nombre:</strong> {mostrarDato(datosUsuario.nombre)}</p>
        <p><strong>Apellido:</strong> {mostrarDato(datosUsuario.apellido)}</p>
        <p><strong>Email:</strong> {mostrarDato(datosUsuario.correo)}</p>
        <p><strong>Dirección:</strong> {mostrarDato(datosUsuario.direccion)}</p>
        <p><strong>Sexo:</strong> {mostrarDato(datosUsuario.sexo)}</p>
        <p><strong>Teléfono:</strong> {mostrarDato(datosUsuario.telefono)}</p>

        {datosUsuario.rol === 4 && (
          <div className="mt-4 space-y-2">
            <label className="block font-medium mb-1">Tipo de terapeuta:</label>
            <select
              value={tipoSel}
              onChange={handleSelect}
              disabled={loading}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">-- Selecciona un tipo --</option>
              {terapeutas.map(t => (
                <option key={t._id} value={t.nombre}>
                  {t.nombre} ({t.tipo})
                </option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={loading || !tipoSel}
              className="mt-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            {msg && (
              <p className={`mt-2 text-sm ${msg.includes('correcto') ? 'text-green-600' : 'text-red-600'}`}>
                {msg}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
