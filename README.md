# Configuración de Variables de Entorno

Para integrar Firebase en este proyecto, se deben definir las siguientes variables de entorno en un archivo .env (o en la configuración de tu entorno de despliegue):

- NEXT_PUBLIC_FIREBASE_API_KEY: Clave de API de Firebase.
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: Dominio de autenticación asignado por Firebase.
- NEXT_PUBLIC_FIREBASE_PROJECT_ID: Identificador único del proyecto Firebase.
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: Contenedor para el almacenamiento de archivos.
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: Identificador del remitente para la mensajería.
- NEXT_PUBLIC_FIREBASE_APP_ID: Identificador de la aplicación Firebase.
- NEXT_PUBLIC_API_URL: URL del backend a ser utilizado como recurso entre componentes (por ejemplo, http://localhost:3000 en desarrollo; en producción apunta al backend en la nube).

Estas variables se importan en el archivo `app/lib/firebase.js` mediante `process.env` para inicializar la aplicación Firebase. El prefijo NEXT_PUBLIC_ asegura que las variables estén disponibles en el lado del cliente en proyectos Next.js.
