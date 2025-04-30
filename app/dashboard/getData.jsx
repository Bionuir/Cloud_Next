// app/dashboard/getData.js

// URL del backend dependiendo del entorno (local o producción)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';  // En caso de no estar definida, por defecto usa localhost

async function fetchData(url) {
    const res = await fetch(`${BASE_URL}${url}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`No se pudieron obtener los datos de ${BASE_URL}${url}`);
    }
    return res.json();
}
  
export async function getDashboardData() {
    try {
        const [usuarios, roles, availability, appointments, sessions] = await Promise.all([
            fetchData('/users'),
            fetchData('/roles'),
            fetchData('/availability'),
            fetchData('/appointments'),
            fetchData('/sessions'),
        ]);

        return { usuarios, roles, availability, appointments, sessions };
    } catch (error) {
        console.error('Error al obtener los datos del dashboard:', error);
        return { error: 'Error al cargar los datos' };
    }
}
