# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Spotify en Inicio

Inicio consulta canciones, artistas y álbumes con Spotify Web API usando el flujo **Client Credentials**. Los visitantes no necesitan iniciar sesión. Las credenciales se usan solo desde `/api/spotify` en el servidor; nunca se envían al navegador.

1. En [Spotify for Developers](https://developer.spotify.com/dashboard), creá o seleccioná una aplicación y copiá el Client ID.
2. Generá un Client Secret nuevo. No reutilices uno que haya estado expuesto en el frontend.
3. En `.env` para desarrollo local, configurá:

   ```dotenv
   SPOTIFY_CLIENT_ID=tu_client_id
   SPOTIFY_CLIENT_SECRET=tu_client_secret
   ```

4. Reiniciá `npm run dev`. El servidor Vite local conecta `/api/spotify` al mismo handler que se usa en producción.
5. En Vercel, definí `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET` como variables de entorno del servidor para cada entorno de despliegue. No las prefijes con `VITE_`.

La API usa el endpoint oficial de búsqueda y no solicita acceso a la cuenta ni usa endpoints de recomendaciones. Spotify puede limitar las aplicaciones en Development Mode; revisá los permisos y restricciones vigentes en el Dashboard de tu aplicación.
