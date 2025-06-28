'use client';

import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { useEffect, useState } from 'react';
import PopupEditarUsuario from './subcomponents/PopupEditarUsuario';

export default function VistaPerfil({ user, datosUsuario, refreshUser }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState('');
	const [showPopup, setShowPopup] = useState(false);

	// Mantenimiento de cierre de sesión
	const handleLogout = async () => {
		try {
			await signOut(auth);
			router.push('/main');
		} catch (error) {
			console.error('[VistaPerfil] Error al cerrar sesión:', error);
		}
	};

	if (!datosUsuario) return <p></p>;

	const mostrarDato = (v) => (v || 'No establecido');

	const openPopup = () => {
		document.startViewTransition(() => setShowPopup(true));
	};
	const closePopup = () => {
		document.startViewTransition(() => {
			setShowPopup(false);
			refreshUser();
		});
	};

	return (
		<div className="perfil-container">
			<h1 className="perfil-title">Perfil del Usuario</h1>
			<div className="perfil-box">
				<p><strong>Nombre:</strong> {mostrarDato(datosUsuario.nombre)}</p>
				<p><strong>Apellido:</strong> {mostrarDato(datosUsuario.apellido)}</p>
				<p><strong>Email:</strong> {mostrarDato(datosUsuario.correo)}</p>
				<p><strong>Dirección:</strong> {mostrarDato(datosUsuario.direccion)}</p>
				<p><strong>Sexo:</strong> {mostrarDato(datosUsuario.sexo)}</p>
				<p><strong>Teléfono:</strong> {mostrarDato(datosUsuario.telefono)}</p>

				{/* Botón para editar toda la información */}
				<button
					onClick={openPopup}
					className="perfil-edit-btn"
				>
					Editar información
				</button>

				<button
					onClick={handleLogout}
					className="perfil-logout-btn"
				>
					Cerrar sesión
				</button>
			</div>

			{showPopup && (
				<PopupEditarUsuario
					datosUsuario={datosUsuario}
					user={user}
					onClose={closePopup}
				/>
			)}

			<style jsx>{`
				.perfil-container {
					padding: 1rem;
				}
				.perfil-title {
					font-size: 24px;
					font-weight: bold;
					margin-bottom: 1rem;
					text-align: center;
				}
				.perfil-box {
					background-color: #F5EFFF;
					padding: 1rem;
					border-radius: 1rem;
					max-width: 28rem;
					margin: 0 auto;
					display: flex;
					flex-direction: column;
					gap: 0.75rem;
					box-shadow: 0 4px 8px rgba(0,0,0,0.15);
				}
				.perfil-edit-btn {
					background-color: #A294F9;
					color: white;
					padding: 0.5rem 1rem;
					border: none;
					border-radius: 0.5rem;
					cursor: pointer;
					transition: background-color 0.3s;
				}
				.perfil-edit-btn:hover,
				.perfil-edit-btn:focus {
					background-color: #8A80E2;
				}
				.perfil-logout-btn {
					margin-top: 0.5rem;
					background-color: transparent;
					color: #f56565;
					padding: 0.5rem 1rem;
					border: 1px solid #f56565;
					border-radius: 0.5rem;
					cursor: pointer;
					transition: background-color 0.3s, color 0.3s;
				}
				.perfil-logout-btn:hover,
				.perfil-logout-btn:focus {
					background-color: #f56565;
					color: white;
				}
			`}</style>
		</div>
	);
}
