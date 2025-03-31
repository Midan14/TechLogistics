# 🚚 Proyecto Integrador TechLogistics

Sistema completo de **gestión logística y seguimiento de pedidos**, desarrollado como proyecto integrador universitario. Integra backend en Node.js con Express, frontend en React con Vite y base de datos MySQL.

---

## 📦 Funcionalidades principales

- Registro de pedidos por cliente, producto, transportista y estado.
- Consulta y actualización de información de clientes, productos y transportistas.
- Seguimiento en tiempo real del estado de un pedido.
- Visualización detallada y paginada de todos los pedidos.
- Interfaz web intuitiva desarrollada con React + TailwindCSS.
- Comunicación frontend-backend vía API RESTful.

---

## 🧹 Tecnologías utilizadas

### Backend
- Node.js
- Express
- MySQL
- dotenv
- body-parser
- cors

### Frontend
- React
- Vite
- TailwindCSS
- Fetch API

---

## 📂 Estructura del proyecto

```
TechLogistics/
├── backend/                # API REST con Express y conexión MySQL
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── config/
│   │   └── utils/
├── frontend/               # Interfaz web en React + Vite
│   └── src/
│       ├── components/
│       ├── styles/
├── docs/                   # Documentación técnica y académica
│   ├── API.md
│   ├── README_DB.md
│   ├── Resumen_Tecnico_Backend.md
│   ├── Resumen_Tecnico_Frontend.md
│   └── Informe_Proyecto_TechLogistics.md
└── README.md
```

---

## 🧪 Cómo ejecutar el proyecto

### 🔧 Backend

```bash
cd backend
npm install
npm run dev
```

Asegúrate de tener un archivo `.env` con la configuración de la base de datos:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=TechLogistics
DB_PORT=3308
```

### 💻 Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📷 Vista previa

Interfaz de gestión y rastreo de pedidos:

![Vista del sistema](docs/Captura_Interfaz.png) <!-- Puedes reemplazarlo por tu imagen final -->

---

## 📄 Documentación técnica

Consulta la documentación completa en la carpeta [`/docs`](docs/):

- [API REST - Endpoints](docs/API.md)
- [Modelo y diseño de base de datos](docs/README_DB.md)
- [Resumen técnico del backend](docs/Resumen_Tecnico_Backend.md)
- [Resumen técnico del frontend](docs/Resumen_Tecnico_Frontend.md)
- [Informe final del proyecto](docs/Informe_Proyecto_TechLogistics.md)

---

## 👨‍💻 Autor

**Miguel Antonio**  
Proyecto universitario de integración - Marzo 2025

---