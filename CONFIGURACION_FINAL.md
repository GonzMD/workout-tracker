# ⚙️ Configuración Final - Firebase y Google Cloud

Tu app ya está publicada en: **https://gonzmd.github.io/workout-tracker/**

Ahora necesitas configurar los permisos para que funcione correctamente.

---

## 1️⃣ Configurar Firebase Authentication

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Authentication**
4. Haz clic en la pestaña **Settings** (arriba)
5. Baja hasta **Authorized domains**
6. Haz clic en **Add domain**
7. Añade: `gonzmd.github.io`
8. Guarda

---

## 2️⃣ Configurar Google Cloud (Para Google Sheets API)

### Paso A: Habilitar la API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el **mismo proyecto** que usas en Firebase
3. En el menú lateral, ve a **APIs & Services** > **Library**
4. Busca "Google Sheets API"
5. Haz clic en **Enable** (si no está habilitada ya)

### Paso B: Configurar OAuth Credentials

1. En el menú lateral, ve a **APIs & Services** > **Credentials**
2. Busca tu **OAuth 2.0 Client ID** (tipo "Web client")
3. Haz clic en el nombre para editarlo
4. En **Authorized JavaScript origins**, añade:
   ```
   https://gonzmd.github.io
   ```
5. En **Authorized redirect URIs**, añade:
   ```
   https://gonzmd.github.io/workout-tracker/
   ```
6. Haz clic en **Save**

---

## 3️⃣ Verificar que tu Firebase Config está en el código

Asegúrate de que el archivo `js/firebase-config.js` tiene tus claves reales de Firebase (no las placeholders).

Si aún tiene `YOUR_API_KEY`, necesitas:
1. Ir a Firebase Console > Project Settings > General
2. Copiar el objeto `firebaseConfig`
3. Pegarlo en `js/firebase-config.js`
4. Hacer commit y push de nuevo:
   ```bash
   git add js/firebase-config.js
   git commit -m "Add Firebase config"
   git push
   ```

---

## ✅ Probar la App

1. Abre en tu navegador: https://gonzmd.github.io/workout-tracker/
2. Haz clic en "Iniciar con Google"
3. Acepta los permisos (te pedirá acceso a Sheets)
4. Registra un entrenamiento
5. Haz clic en "Sync Sheets"
6. Verifica que se creó la hoja en tu Google Drive

---

## 📱 Usar en el Móvil

1. Envíate el enlace por WhatsApp: https://gonzmd.github.io/workout-tracker/
2. Ábrelo en el navegador del móvil
3. Inicia sesión con la misma cuenta de Google
4. ¡Listo! Tus datos se sincronizan automáticamente

---

## 🔧 Si algo falla

- **Error de autenticación**: Verifica que `gonzmd.github.io` esté en dominios autorizados de Firebase
- **Error de Sheets**: Verifica que las URLs estén en Google Cloud OAuth
- **"App no verificada"**: Es normal. Haz clic en "Avanzado" > "Ir a Workout Tracker (no seguro)"
