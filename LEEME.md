# AMI Flow (Expo)

Incluye tu logo (carpeta `assets/`) como icono de la app y una pantalla de inicio de sesión con correo.

App de contactos/seguimiento convertida a Expo (React Native). Novedades respecto a la versión web:
búsqueda y ficha desplegable en Productos, pestaña **Guiones**, **Ajustes** (tema, color, letra, tamaño)
y **autoguardado en la nube** ligado a tu correo (Firebase).

## 1. Preparar Firebase (una sola vez, 3 minutos)
Proyecto: `arepadown` (el de tu google-services.json).
1. Firebase Console > **Authentication** > Sign-in method > activa **Correo electrónico/contraseña**.
2. **Firestore Database** > crea la base de datos si no existe.
3. Firestore > **Reglas**: AÑADE este bloque dentro de `match /databases/{database}/documents { ... }`
   (no borres las reglas que ya tengas para tus otras apps):

       match /usuarios/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }

4. Si al iniciar sesión sale un error de petición bloqueada: Configuración del proyecto > Tus apps >
   añade una app **Web** (</>) y pega su configuración en `src/firebaseConfig.js`.

## 2. Obtener el APK sin instalar nada (como antes)
1. Sube TODO el contenido de esta carpeta a un repositorio de GitHub (incluida la carpeta oculta `.github`;
   si no te deja, crea a mano `.github/workflows/apk.yml` y pega su contenido).
2. Pestaña **Actions** > espera 10-15 min (check verde). Si no arranca solo: Run workflow.
3. Entra en la ejecución > **Artifacts** > descarga `ami-flow-apk` (zip con `app-release.apk`).
4. Pasa el .apk al móvil y ábrelo (permite "orígenes desconocidos" si lo pide).

## Alternativa con ordenador (para probar rápido con Expo Go)
    npm install
    npx expo install react react-native expo-status-bar react-native-safe-area-context @react-native-async-storage/async-storage @react-native-community/datetimepicker expo-clipboard firebase
    npx expo start

## Cómo funciona el autoguardado
- Cada cambio se guarda al instante en el móvil y 1-2 s después en la nube.
- Al abrir la app se compara con la nube y se queda lo más reciente (gana el último cambio).
- Al abrir la app sale el login. Si pulsas "Usar sin cuenta por ahora", funciona igual pero solo en ese móvil. Al crear cuenta, tus datos locales se suben.
- Al cerrar sesión se borran los datos del móvil (siguen en la nube).
- Para pasar los datos de la app antigua: allí "Exportar datos", aquí Ajustes > Importar.
