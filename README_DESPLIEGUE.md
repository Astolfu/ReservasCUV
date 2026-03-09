# Guía de Despliegue en Hostinger - ReservasCUV

Este proyecto consta de un frontend en **React (Vite)** y un backend en **Node.js (Express)** con base de datos **MySQL**.

## 1. Configuración de la Base de Datos
1. Accede al panel de Hostinger y crea una base de datos MySQL.
2. Anota el **Nombre de la BD**, **Usuario** y **Contraseña**.
3. Importa el archivo SQL (si tienes uno) o asegúrate de que las tablas existan con la estructura correcta.

## 2. Despliegue del Backend (Node.js)
Hostinger permite usar un **Node.js Selector** en sus planes premium/business.

1. Sube el contenido de la carpeta `backend/` a una carpeta en tu servidor (ej. `/home/usuario/backend`).
2. En el panel de Hostinger, busca "Node.js" y configura una nueva aplicación:
   - **Versión de Node:** 18 o superior.
   - **Application root:** La carpeta donde subiste el backend.
   - **Application URL:** (ej. `api.tu-dominio.com` o una subcarpeta).
   - **Startup file:** `server.js`.
3. Crea un archivo `.env` en la carpeta del backend con tus credenciales de Hostinger:
   ```env
   DB_HOST=localhost (normalmente)
   DB_USER=u123456789_user
   DB_PASSWORD=tu_password
   DB_NAME=u123456789_reserva_espacios
   PORT=3000
   ```
4. Haz clic en "Run npm install" desde el panel de Hostinger para instalar las dependencias.

## 3. Despliegue del Frontend (React)
El frontend debe compilarse a archivos estáticos (HTML/JS/CSS).

1. Abre una terminal en tu computadora dentro de la carpeta `frontend/`.
2. **CONFIGURAR API:** Abre el archivo `src/api.js` y cambia la constante `API_BASE_URL` por la URL de tu backend en Hostinger (ej. `https://api.tu-dominio.com`).
3. Ejecuta el comando:
   ```bash
   npm run build
   ```
4. Esto generará una carpeta llamada `dist/`.
5. Sube todo el contenido de `dist/` a la carpeta `public_html` de tu dominio principal (o donde desees que se vea la web).

## 4. Notas Importantes
- **CORS:** Si el frontend y el backend están en dominios o subdominios diferentes, el backend ya tiene habilitado CORS, pero asegúrate de que los dominios permitidos sean los correctos en `server.js`.
- **Navegación (React Router):** Si las rutas del frontend fallan al recargar la página (Error 404), crea un archivo `.htaccess` en `public_html` con este contenido:
  ```apache
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-l
    RewriteRule . /index.html [L]
  </IfModule>
  ```
