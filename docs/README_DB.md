# 📄 Documentación de Base de Datos - TechLogistics

Este documento describe el diseño lógico de la base de datos del sistema **TechLogistics**, utilizado para la gestión de pedidos y el rastreo de envíos.

---

## 🧩 Modelo Entidad-Relación (MER)

El modelo incluye las siguientes entidades principales:

- **Clientes**
- **Productos**
- **Pedidos**
- **Transportistas**
- **Estados de Envío**

Cada entidad representa un aspecto fundamental del proceso logístico y se encuentra relacionada de acuerdo con las reglas del negocio.

Puedes ver el diagrama MER en el archivo: `docs/MER_TechLogistics.png`

---

## 📋 Tablas y Atributos

### 1. `clientes`
- `id_cliente` (INT, PK, AUTO_INCREMENT)
- `nombre` (VARCHAR)
- `correo` (VARCHAR)
- `direccion` (VARCHAR)
- `telefono` (VARCHAR)

### 2. `productos`
- `id_producto` (INT, PK, AUTO_INCREMENT)
- `nombre` (VARCHAR)
- `descripcion` (TEXT)
- `precio` (DECIMAL)

### 3. `transportistas`
- `id_transportista` (INT, PK, AUTO_INCREMENT)
- `nombre` (VARCHAR)
- `placa` (VARCHAR)
- `telefono` (VARCHAR)

### 4. `estados_envio`
- `id_estado` (INT, PK, AUTO_INCREMENT)
- `nombre_estado` (VARCHAR)

### 5. `pedidos`
- `id_pedido` (INT, PK, AUTO_INCREMENT)
- `id_cliente` (INT, FK → clientes.id_cliente)
- `id_producto` (INT, FK → productos.id_producto)
- `cantidad` (INT)
- `id_transportista` (INT, FK → transportistas.id_transportista)
- `id_estado` (INT, FK → estados_envio.id_estado)
- `fecha_pedido` (DATE)

---

## 🔄 Relaciones

- Un cliente puede tener muchos pedidos (**1:N**).
- Un producto puede estar presente en muchos pedidos (**1:N**).
- Un transportista puede gestionar varios pedidos (**1:N**).
- Un estado de envío puede aplicarse a muchos pedidos (**1:N**).

---

## ✅ Justificación del Diseño

- La estructura permite una trazabilidad completa desde el cliente hasta el estado actual del pedido.
- Se ha aplicado una **normalización hasta tercera forma normal (3FN)** para evitar redundancia y asegurar integridad referencial.
- La tabla `pedidos` actúa como tabla central que relaciona a todas las demás.

---

## 📁 Ubicación recomendada del archivo

Guarda este archivo como `README_DB.md` en la carpeta `docs/` del proyecto:

```
TechLogistics/
├── backend/
├── frontend/
├── docs/
│   ├── API.md
│   ├── MER_TechLogistics.png
│   └── README_DB.md  
└── README.md
