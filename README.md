pregunTon/
├── public/
│ └── audios/ # Carpeta para archivos de audio de preguntas
├── src/
│ ├── components/
│ │ ├── Lobby.jsx # Componente para la sala de espera (host)
│ │ ├── Question.jsx # Componente para mostrar preguntas y opciones
│ │ └── Ranking.jsx # Componente para mostrar el ranking final
│ ├── data/
│ │ └── questions.json # Archivo JSON con las preguntas del quiz
│ ├── pages/
│ │ ├── Host.jsx # Página del host (control del juego)
│ │ └── Player.jsx # Página para los jugadores (unirse y responder)
│ ├── firebase.js # Configuración y conexión a Firebase
│ ├── App.jsx # Componente raíz con rutas
│ ├── main.jsx # Punto de entrada React y Vite
│ └── index.css  
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json # Configuración del proyecto y dependencias
├── tailwind.config.js # Configuración de TailwindCSS
├── postcss.config.js # Configuración de PostCSS
├── vite.config.js # Configuración de Vite
└── README.md # Documentación del proyecto
