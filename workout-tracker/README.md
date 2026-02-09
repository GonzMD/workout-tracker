# Workout Tracker Pro

Aplicación web para seguimiento de entrenamientos con sincronización a Google Sheets.

## 🚀 Publicar en GitHub Pages

Para usar esta app en tu móvil y PC, debes publicarla en Internet.

**Lee el archivo `DEPLOY.md` para instrucciones paso a paso.**

## ✨ Características

- **Login con Google**: Acceso seguro desde cualquier dispositivo.
- **Sincronización Google Sheets**: Tus datos se guardan automáticamente en una hoja de cálculo en tu Google Drive.
- **Historial y Gráficos**: Visualiza tu progreso en cada ejercicio.
- **Exportación CSV**: Descarga tus datos para análisis externo.
- **Responsive**: Funciona perfecto en móvil y escritorio.

## 🔧 Configuración Inicial (Antes de Publicar)

### 1. Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita **Authentication** con Google.
3. Crea una **Firestore Database** en modo producción.
4. Copia las reglas de `firestore.rules` a la consola.
5. Obtén tu `firebaseConfig` y pégalo en `js/firebase-config.js`.

### 2. Google Cloud (Para Sheets API)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Selecciona el mismo proyecto de Firebase.
3. Habilita la **Google Sheets API**.
4. En **Credentials**, configura el OAuth 2.0 Client (se configurará el dominio después de publicar).

## 📱 Uso

1. Abre la app en tu navegador (móvil o PC).
2. Inicia sesión con Google.
3. Selecciona el día de entrenamiento.
4. Registra tus series (peso, reps, RIR).
5. Haz clic en "Sync Sheets" para guardar todo en Google Sheets.

## 🛠️ Desarrollo Local

Para probar localmente antes de publicar:

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: VS Code Live Server
# Clic derecho en index.html > Open with Live Server
```

Luego abre `http://localhost:8000`
