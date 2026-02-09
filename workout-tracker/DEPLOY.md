# 🚀 Guía de Publicación en GitHub Pages

## Paso 1: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión.
2. Haz clic en el botón **"New"** (nuevo repositorio).
3. Nombre sugerido: `workout-tracker`
4. Marca como **Público** (necesario para GitHub Pages gratis).
5. **NO** inicialices con README (ya tienes archivos).
6. Haz clic en **"Create repository"**.

## Paso 2: Subir los Archivos

### Opción A: Interfaz Web (Más Fácil)

1. En la página del repositorio recién creado, haz clic en **"uploading an existing file"**.
2. Arrastra **TODA** la carpeta `workout-tracker` (o selecciona todos los archivos dentro).
3. Escribe un mensaje como "Initial commit".
4. Haz clic en **"Commit changes"**.

### Opción B: Git desde Terminal (Avanzado)

```bash
cd "c:\Users\gonza\OneDrive\Documents\Salud\workout-tracker"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/workout-tracker.git
git push -u origin main
```

## Paso 3: Activar GitHub Pages

1. En tu repositorio, ve a **Settings** (Configuración).
2. En el menú lateral, busca **Pages**.
3. En **Source**, selecciona la rama **main** y carpeta **/ (root)**.
4. Haz clic en **Save**.
5. Espera 1-2 minutos. GitHub te dará un enlace como:
   ```
   https://TU-USUARIO.github.io/workout-tracker/
   ```

## Paso 4: Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/).
2. Selecciona tu proyecto.
3. Ve a **Authentication** > **Settings** > **Authorized domains**.
4. Añade: `TU-USUARIO.github.io`
5. Guarda.

## Paso 5: Configurar Google Cloud (Para Sheets API)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Selecciona tu proyecto (el mismo de Firebase).
3. Ve a **APIs & Services** > **Credentials**.
4. Encuentra tu **OAuth 2.0 Client ID** (Web client).
5. En **Authorized JavaScript origins**, añade:
   ```
   https://TU-USUARIO.github.io
   ```
6. En **Authorized redirect URIs**, añade:
   ```
   https://TU-USUARIO.github.io/workout-tracker/
   ```
7. Guarda.

## ✅ ¡Listo!

Ahora puedes:
- Abrir el enlace en tu PC.
- Enviarte el enlace por WhatsApp y abrirlo en tu móvil.
- Iniciar sesión con Google en ambos dispositivos.
- Sincronizar tus entrenamientos a Google Sheets desde cualquier lugar.

---

**Nota**: Si haces cambios en el código local, solo tienes que volver a subir los archivos modificados a GitHub (opción A) o hacer `git push` (opción B).
