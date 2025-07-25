# 🧠 PregunTon

**PregunTon** es un juego de preguntas y respuestas en tiempo real inspirado en plataformas como Kahoot. Desarrollado con React, Firebase y Tailwind CSS, permite crear partidas interactivas entre múltiples jugadores, con un sistema de puntuación dinámico y ranking final.

---

## 🚀 Funcionalidades

- ✅ Creación de partidas con ID único
- ✅ Ingreso de jugadores vía Game ID
- ✅ Sincronización en tiempo real con Firebase
- ✅ Temporizador de preguntas
- ✅ Puntuación automática basada en rapidez y aciertos
- ✅ Ranking final con puntuaciones
- ✅ Interfaz responsive y moderna

---

## 🛠️ Tecnologías utilizadas

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Firebase Realtime Database](https://firebase.google.com/products/realtime-database)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📦 Instalación local

1. **Clona el repositorio:**

   ```bash
   git clone git@github.com:Juanpedrogomezespinosa/pregunTon.git
   cd pregunTon

   ```

2. **Instala dependencias:**

npm install

3. **Agrega tu configuración de Firebase:**

- Crea un archivo src/firebase si no lo tienes
- Incluye tu configuración:

```import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  databaseURL: "TU_DB_URL",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);´´´´´´

4. **Ejecuta la aplicación:**
npm run dev

### Como jugar ### 

- Anfitrión (Host):

1. Accede a /host

2. Genera un Game ID

3. Comparte el código con los jugadores

4. Inicia la partida

- Jugador:

1. Accede a /player?gameId=XXXXXX

2. Introduce tu nombre

3. ¡Responde tan rápido como puedas!

### Estructura de carpetas: ####

pregunTon/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── firebase.js
│   ├── App.jsx
│   └── main.jsx
└── README.md

### Contribuciones ###

¡Las contribuciones son bienvenidas! Abre un pull request o issue si tienes ideas de mejora, errores que solucionar o nuevas funcionalidades.

### licencia ###

Este proyecto está bajo la licencia MIT.

### Autor ###
Desarrollado por Juanpe Gómez.

```
