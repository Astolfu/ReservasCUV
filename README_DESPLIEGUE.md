# Guía de Despliegue Híbrido - ReservasCUV

Debido a que el plan Hostinger Premium no soporta Node.js directamente, usaremos una combinación ganadora: **Hostinger** para la web y la base de datos, y **Render** para el cerebro (backend).

## 1. Base de Datos (En Hostinger)
1. Ve al panel de Hostinger -> **Bases de Datos MySQL**.
2. Crea una nueva base de datos y usuario. Anota los datos.
3. **Paso Crucial:** Busca la opción **"MySQL Remoto"**.
   - En "Hostname", pon el símbolo `%` (esto permite que Render se conecte).
   - Elige la base de datos que creaste y dale a "Añadir".
4. Usa "phpMyAdmin" para importar el archivo `backend/database.sql` que está en tu proyecto.

## 2. El Backend (En Render.com)
1. Crea una cuenta en [Render.com](https://render.com) y conecta tu GitHub.
2. Crea un **New -> Web Service**.
3. Selecciona tu repositorio `ReservasCUV`.
4. Configura:
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Ve a la pestaña **Environment** y añade estas variables:
   - `DB_HOST`: La IP de tu servidor Hostinger (aparece en el panel de MySQL).
   - `DB_USER`: Tu usuario de BD de Hostinger.
   - `DB_PASSWORD`: Tu contraseña de BD.
   - `DB_NAME`: El nombre de la BD.
   - `DB_PORT`: `3306`
6. Render te dará una URL (ej. `https://reservas-backend.onrender.com`). **Cópiala**.

## 3. El Frontend (En Hostinger)
1. En tu computadora, abre `frontend/src/api.js`.
2. Pega la URL que te dio Render: `const API_BASE_URL = 'https://tu-url-de-render.com';`
3. Abre una terminal en la carpeta `frontend/` y ejecuta:
   ```bash
   npm run build
   ```
4. Se creará una carpeta `dist/`. Sube todo su contenido a la carpeta `public_html` de Hostinger usando el Administrador de Archivos o FTP.

## 4. Archivo .htaccess (Para que no falle al recargar)
Crea un archivo llamado `.htaccess` dentro de `public_html` en Hostinger con:
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

---
**Nota:** El backend ya tiene configurado CORS para aceptar peticiones desde cualquier origen, por lo que no deberías tener problemas de conexión.
