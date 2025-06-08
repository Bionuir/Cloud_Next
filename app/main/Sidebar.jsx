'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import VistaTiposTerapeuta from './components/VistaTiposTerapeuta';
import VistaPerfil from './components/VistaPerfil';
import VistaUsuarios from './components/VistaUsuarios';
import VistaHorario from './components/VistaHorario';
import VistaHistorial from './components/VistaHistorial';
import VistaTerapeutas from './components/VistaTerapeutas';
import VistaSesiones from './components/VistaSesiones';
import VistaDiagnostico from './components/VistaDiagnostico';
import './sidebar.css';

export default function Sidebar({ vistaActiva, setVistaActiva, user }) {
  const [datosUsuario, setDatosUsuario] = useState(null);
  const router = useRouter();

  const obtenerDatos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${user.uid}`);
      if (!res.ok) throw new Error('No se pudo obtener el usuario');

      const data = await res.json();
      console.log('Datos del usuario cargados en Sidebar:', data);
      setDatosUsuario(data);
    } catch (error) {
      console.error('Error al obtener datos del backend:', error);
      setTimeout(obtenerDatos, 1000); // Reintentar en 1 segundo
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    obtenerDatos();
  }, [user]);

  const isAdmin = datosUsuario?.rol === 1;
  const isTerapeuta = datosUsuario?.rol === 4;

  if (!datosUsuario) return <p>Cargando datos del usuario...</p>;

  return (
    <>
      <div className="sidebar-container">
        <aside className="sidebar-aside">
          <h2 className="sidebar-title">CLINOVA</h2>
          <ul className="sidebar-list">
            <li>
              <div className="sidebar-menu-item">
                <button onClick={() => setVistaActiva('tiposterapeuta')}
                  className={vistaActiva === 'tiposterapeuta' ? 'active' : ''}
                >🏠 Tipos de Terapeuta</button>
              </div>
            </li>
            <li>
              <div className="sidebar-menu-item">
                <button onClick={() => setVistaActiva('terapeutas')}
                  className={vistaActiva === 'terapeutas' ? 'active' : ''}
                >👩‍⚕️ Terapeutas</button>
              </div>
            </li>
            {isAdmin && (
              <li>
                <div className="sidebar-menu-item">
                  <button onClick={() => setVistaActiva('usuarios')}
                    className={vistaActiva === 'usuarios' ? 'active' : ''}
                  >🧑‍💼 Usuarios</button>
                </div>
              </li>
            )}
            <li>
              <div className="sidebar-menu-item">
                <button onClick={() => setVistaActiva('sesiones')}
                  className={vistaActiva === 'sesiones' ? 'active' : ''}
                >🗓️ Sesiones</button>
              </div>
            </li>
            {datosUsuario?.rol === 6 && (
              <li>
                <div className="sidebar-menu-item">
                  <button onClick={() => setVistaActiva('diagnostico')}
                    className={vistaActiva === 'diagnostico' ? 'active' : ''}
                  >💡 Diagnóstico</button>
                </div>
              </li>
            )}
            {isTerapeuta && (
              <li>
                <div className="sidebar-menu-item">
                  <button onClick={() => setVistaActiva('horario')}
                    className={vistaActiva === 'horario' ? 'active' : ''}
                  >🕒 Horario</button>
                </div>
              </li>
            )}
            <li>
              <div className="sidebar-menu-item">
                <button onClick={() => setVistaActiva('perfil')}
                  className={vistaActiva === 'perfil' ? 'active' : ''}
                >👤 Perfil</button>
              </div>
            </li>
          </ul>
        </aside>

        <section className="sidebar-content">
          {vistaActiva === 'tiposterapeuta' && <VistaTiposTerapeuta />}
          {vistaActiva === 'perfil' && <VistaPerfil user={user} datosUsuario={datosUsuario} refreshUser={obtenerDatos} />}
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
    </>
  );
}
