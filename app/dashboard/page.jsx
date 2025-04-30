// app/dashboard/page.jsx

import { getDashboardData } from './getData';
import { Fragment } from 'react';

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (data.error) {
    return <div className="max-w-7xl mx-auto p-6 text-red-500">{data.error}</div>;
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Usuarios del sistema</h2>
        {data.usuarios && (
          <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-left bg-white">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Apellidos</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Dirección</th>
                  <th className="px-4 py-3">Role ID</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {data.usuarios.map((u) => (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{u.user_id}</td>
                    <td className="px-4 py-3">{u.nombre}</td>
                    <td className="px-4 py-3">{u.apellidos}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.telefono}</td>
                    <td className="px-4 py-3">{u.direccion}</td>
                    <td className="px-4 py-3">{u.role_id}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {u.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Roles</h2>
        {data.roles && (
          <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-left bg-white">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Role ID</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {data.roles.map((rol) => (
                  <tr key={rol._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{rol.name}</td>
                    <td className="px-4 py-3">{rol.role_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Disponibilidad de Terapeutas</h2>
        {data.availability && (
          <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-left bg-white">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Disponibilidad</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {data.availability.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{item.user_id}</td>
                    <td className="px-4 py-3">
                      {item.disponibilidad.map((disp, index) => (
                        <Fragment key={index}>
                          {disp.dia}: {disp.hora_inicio} - {disp.hora_fin}
                          <br />
                        </Fragment>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Citas</h2>
        {data.appointments && (
          <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-left bg-white">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3">Paciente ID</th>
                  <th className="px-4 py-3">Terapeuta ID</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Hora Inicio</th>
                  <th className="px-4 py-3">Hora Fin</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Modo</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {data.appointments.map((cita) => (
                  <tr key={cita._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{cita.paciente_id}</td>
                    <td className="px-4 py-3">{cita.terapeuta_id}</td>
                    <td className="px-4 py-3">{cita.fecha}</td>
                    <td className="px-4 py-3">{cita.hora_inicio}</td>
                    <td className="px-4 py-3">{cita.hora_fin}</td>
                    <td className="px-4 py-3">{cita.estado}</td>
                    <td className="px-4 py-3">{cita.motivo_consulta}</td>
                    <td className="px-4 py-3">{cita.modo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sesiones</h2>
        {data.sessions && (
          <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-left bg-white">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3">Cita ID</th>
                  <th className="px-4 py-3">Notas del Terapeuta</th>
                  <th className="px-4 py-3">Diagnóstico</th>
                  <th className="px-4 py-3">Tratamiento Recomendado</th>
                  <th className="px-4 py-3">Estado Emocional Inicio</th>
                  <th className="px-4 py-3">Estado Emocional Final</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {data.sessions.map((sesion) => (
                  <tr key={sesion._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{sesion.appointment_id}</td>
                    <td className="px-4 py-3">{sesion.notas_terapeuta}</td>
                    <td className="px-4 py-3">{sesion.diagnostico}</td>
                    <td className="px-4 py-3">{sesion.tratamiento_recomendado}</td>
                    <td className="px-4 py-3">{sesion.estado_emocional_inicio}</td>
                    <td className="px-4 py-3">{sesion.estado_emocional_final}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}