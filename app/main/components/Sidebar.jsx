'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import VistaTiposTerapeuta from './VistaTiposTerapeuta';
import VistaPerfil from './VistaPerfil';
import VistaUsuarios from './VistaUsuarios';
import VistaHorario from './VistaHorario';
import VistaHistorial from './VistaHistorial';
import VistaTerapeutas from './VistaTerapeutas';
import VistaSesiones from './VistaSesiones';
import VistaDiagnostico from './VistaDiagnostico';

export default function Sidebar({ vistaActiva, setVistaActiva, user }) {
  const [datosUsuario, setDatosUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user?.uid) return;

    const obtenerDatos = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${user.uid}`);
        if (!res.ok) throw new Error('No se pudo obtener el usuario');

        const data = await res.json();
        console.log('Datos del usuario cargados en Sidebar:', data);
        setDatosUsuario(data);
      } catch (error) {
        console.error('Error al obtener datos del backend:', error);
      }
    };

    obtenerDatos();
  }, [user]);

  const isAdmin = datosUsuario?.rol === 1;
  const isTerapeuta = datosUsuario?.rol === 4;

  if (!datosUsuario) return <p>Cargando datos del usuario...</p>;

  return (
    <div className="flex rounded-2xl shadow-lg overflow-hidden bg-white h-[calc(100vh-3rem)]">
      <aside className="w-72 bg-gray-50 border-r p-6 flex flex-col">
        <h2 className="text-xl font-semibold mb-6">Navegación</h2>
        <ul className="space-y-3">
          <li>
            <button onClick={() => setVistaActiva('tiposterapeuta')} className={`w-full text-left px-3 py-2 rounded-lg transition ${vistaActiva === 'tiposterapeuta' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200'}`}>🏠 Tipos de Terapeuta</button>
          </li>

          <li>
            <button onClick={() => setVistaActiva('terapeutas')} className={`w-full text-left px-3 py-2 rounded-lg transition ${vistaActiva === 'terapeutas' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200'}`}>👩‍⚕️ Terapeutas</button>
          </li>

          {isAdmin && (
            <li>
              <button onClick={() => setVistaActiva('usuarios')} className={`w-full text-left px-3 py-2 rounded-lg transition ${vistaActiva === 'usuarios' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200'}`}>🧑‍💼 Usuarios</button>
            </li>
          )}
          <li>
            <button onClick={() => setVistaActiva('sesiones')} className={`w-full text-left px-3 py-2 rounded-lg transition ${vistaActiva === 'sesiones' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200'}`}>🗓️ Sesiones</button>
          </li>
          {datosUsuario?.rol === 6 && (
            <li>
              <button onClick={() => setVistaActiva('diagnostico')} className={`w-full text-left px-3 py-2 rounded-lg transition ${vistaActiva === 'diagnostico' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200'}`}>💡 Diagnóstico</button>
            </li>
          )}
          {isTerapeuta && (
            <>
              <li>
                <button onClick={() => setVistaActiva('horario')} className={`w-full text-left px-3 py-2 rounded-lg transition ${vistaActiva === 'horario' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200'}`}>🕒 Horario</button>
              </li>
            </>
          )}
          <li>
            <button onClick={() => setVistaActiva('perfil')} className={`w-full text-left px-3 py-2 rounded-lg transition ${vistaActiva === 'perfil' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200'}`}>👤 Perfil</button>
          </li>
        </ul>
      </aside>

      <section className="flex-1 p-8 overflow-y-auto">
        {vistaActiva === 'tiposterapeuta' && <VistaTiposTerapeuta />}
        {vistaActiva === 'perfil' && <VistaPerfil user={user} datosUsuario={datosUsuario} />}
        {vistaActiva === 'usuarios' && isAdmin && <VistaUsuarios datosUsuario={datosUsuario} />}
        {vistaActiva === 'historial' && isTerapeuta && <VistaHistorial />}
        {vistaActiva === 'sesiones' && <VistaSesiones user={user} datosUsuario={datosUsuario} />}
        {vistaActiva === 'diagnostico' && datosUsuario?.rol === 6 && (
          <VistaDiagnostico user={user} datosUsuario={datosUsuario} />
        )}
        {vistaActiva === 'horario' && isTerapeuta && <VistaHorario />}
        {vistaActiva === 'terapeutas' && <VistaTerapeutas />}
      </section>
    </div>
  );
}
