'use client';

import { useState, useEffect } from 'react';

export default function PopupEditarUsuario({ datosUsuario, user, onClose }) {
	// Inicializar estados con los valores actuales
	const [nombre, setNombre] = useState(datosUsuario.nombre || '');
	const [apellido, setApellido] = useState(datosUsuario.apellido || '');
	const [direccion, setDireccion] = useState(datosUsuario.direccion || '');
	const [sexo, setSexo] = useState(datosUsuario.sexo || '');
	const [telefono, setTelefono] = useState(datosUsuario.telefono || '');
	// Nueva state para el tipo de terapeuta
	const [tipoSel, setTipoSel] = useState(datosUsuario.tipo_terapeuta || '');
	const [terapeutas, setTerapeutas] = useState([]);
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState('');

	// Si el usuario es terapeuta (rol 4), cargar la lista de tipos de terapeutas
	useEffect(() => {
		if (datosUsuario.rol === 4) {
			fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terapeuta`)
				.then(res => res.json())
				.then(data => setTerapeutas(data))
				.catch(err => console.error('[PopupEditarUsuario] Error al cargar terapeutas:', err));
		}
	}, [datosUsuario.rol]);

	const handleSave = async () => {
		setLoading(true);
		setMsg('');
		const googleId = user?.uid;
		const url = `${process.env.NEXT_PUBLIC_API_URL}/api/profile/${googleId}/update`;
		const body = { nombre, apellido, direccion, sexo, telefono };

		try {
			const res = await fetch(url, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const contentType = res.headers.get('content-type');
			let data;
			if (contentType && contentType.includes('application/json')) {
				data = await res.json();
			} else {
				const text = await res.text();
				// Se agrega más información sobre el posible error de endpoint
				throw new Error(`Respuesta no es JSON. Verifica que la ruta ${url} esté correctamente implementada en el backend. Respuesta: ${text}`);
			}

			if (!res.ok) {
				// Se podría incluir aquí información adicional para depurar
				throw new Error(data.error || `Error en la respuesta: ${res.status}`);
			}

			// Si el usuario es terapeuta, actualizar el tipo de terapeuta
			if (datosUsuario.rol === 4 && tipoSel) {
				const urlTipo = `${process.env.NEXT_PUBLIC_API_URL}/api/profile/${googleId}/terapeuta`;
				const bodyTipo = { tipo_terapeuta: tipoSel };
				const resTipo = await fetch(urlTipo, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(bodyTipo)
				});
				const contentTypeTipo = resTipo.headers.get('content-type');
				let dataTipo;
				if (contentTypeTipo && contentTypeTipo.includes('application/json')) {
					dataTipo = await resTipo.json();
				} else {
					const textTipo = await resTipo.text();
					throw new Error(`Respuesta no es JSON en actualización de terapeuta. Respuesta: ${textTipo}`);
				}
				if (!resTipo.ok) {
					throw new Error(dataTipo.error || `Error en la actualización de terapeuta: ${resTipo.status}`);
				}
			}

			setMsg('Usuario actualizado correctamente');
			onClose(); // Cerrar popup
		} catch (error) {
			console.error('[PopupEditarUsuario] Error al actualizar usuario:', error);
			setMsg('No se pudo actualizar. Revisa la consola.');
		} finally {
			setLoading(false);
		}
	};

	// Determina si hay cambios en el formulario
	const isChanged =
		nombre !== (datosUsuario.nombre || '') ||
		apellido !== (datosUsuario.apellido || '') ||
		direccion !== (datosUsuario.direccion || '') ||
		sexo !== (datosUsuario.sexo || '') ||
		telefono !== (datosUsuario.telefono || '') ||
		(datosUsuario.rol === 4 && tipoSel !== (datosUsuario.tipo_terapeuta || ''));

	return (
		<div className="popup-overlay">
			<div className="popup-container">
				<h2>Editar Perfil</h2>
				<form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
					<label>Nombre:</label>
					<input
						type="text"
						value={nombre}
						onChange={(e) => setNombre(e.target.value)}
						style={{ backgroundColor: nombre !== (datosUsuario.nombre || '') ? "#D5C1E2" : "#E5D9F2" }}
					/>
					<label>Apellido:</label>
					<input
						type="text"
						value={apellido}
						onChange={(e) => setApellido(e.target.value)}
						style={{ backgroundColor: apellido !== (datosUsuario.apellido || '') ? "#D5C1E2" : "#E5D9F2" }}
					/>
					<label>Correo:</label>
					<input type="email" value={datosUsuario.correo} disabled />
					<label>Dirección:</label>
					<input
						type="text"
						value={direccion}
						onChange={(e) => setDireccion(e.target.value)}
						style={{ backgroundColor: direccion !== (datosUsuario.direccion || '') ? "#D5C1E2" : "#E5D9F2" }}
					/>
					<label>Sexo:</label>
					<select
						value={sexo}
						onChange={(e) => setSexo(e.target.value)}
						style={{ backgroundColor: sexo !== (datosUsuario.sexo || '') ? "#D5C1E2" : "#E5D9F2" }}
					>
						<option value="">-- Selecciona --</option>
						<option value="masculino">Masculino</option>
						<option value="femenino">Femenino</option>
						<option value="otro">Otro</option>
					</select>
					
					<label>Teléfono:</label>
					<input
						type="text"
						value={telefono}
						onChange={(e) => setTelefono(e.target.value)}
						style={{ backgroundColor: telefono !== (datosUsuario.telefono || '') ? "#D5C1E2" : "#E5D9F2" }}
					/>

					{/* Mostrar seleccionable de tipo de terapeuta si el rol es 4 */}
					{datosUsuario.rol === 4 && (
						<>
							<label>Tipo de Terapeuta:</label>
							<select
								value={tipoSel}
								onChange={(e) => setTipoSel(e.target.value)}
								style={{ backgroundColor: tipoSel !== (datosUsuario.tipo_terapeuta || '') ? "#D5C1E2" : "#E5D9F2" }}
							>
								<option value="">-- Selecciona un tipo --</option>
								{terapeutas.map(t => (
									<option key={t._id} value={t.nombre}>
										{t.nombre} ({t.tipo})
									</option>
								))}
							</select>
						</>
					)}

					<div className="popup-actions">
						<button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
						<button type="submit" disabled={loading || !isChanged} style={{ opacity: loading || !isChanged ? 0.5 : 1 }}>
							{loading ? 'Guardando...' : 'Guardar'}
						</button>
					</div>
					{msg && <p>{msg}</p>}
				</form>
			</div>
			<style jsx>{`
	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0,0,0,0.5);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.popup-container {
		background-color: #F5EFFF;
		padding: 1.5rem;
		border-radius: 0.75rem;
		width: 90%;
		max-width: 50rem;
		animation: fadeIn 0.3s ease;
	}
	h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	label {
		display: block;
		font-weight: 500;
	}
	input, select, textarea {
		background-color: #E5D9F2;
		width: 100%;
		margin-top: 0.25rem;
		padding: 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid #ccc;
		box-sizing: border-box;
	}
		input:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	.popup-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
	}
	button {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		background-color: #fff;
		border: 1px solid #ccc;
		transition: background-color 0.3s ease, color 0.3s ease;
	}
	button[type="submit"] {
		background-color: #A294F9;
		color: #fff;
		border: none;
	}
	button:hover {
		background-color: #8A80E2;
		color: #fff;
	}
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
`}</style>
		</div>
	);
}
