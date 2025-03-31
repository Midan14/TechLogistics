# API REST - TechLogistics

Este documento describe los endpoints disponibles en la API REST del sistema TechLogistics, desarrollada con Node.js y Express para la gestión de pedidos y rastreo de envíos.

---

## 📦 Pedidos

### Obtener todos los pedidos
- **Método:** GET
- **Ruta:** `/api/pedidos`
- **Descripción:** Obtiene la lista completa de pedidos registrados.

### Obtener un pedido por ID
- **Método:** GET
- **Ruta:** `/api/pedidos/:id`
- **Parámetros:**
  - `id`: ID del pedido
- **Descripción:** Obtiene los detalles de un pedido específico.

### Crear un nuevo pedido
- **Método:** POST
- **Ruta:** `/api/pedidos`
- **Body (JSON):**
```json
{
  "id_cliente": 1,
  "id_producto": 2,
  "cantidad": 3,
  "id_transportista": 1,
  "id_estado": 1
}
```
- **Descripción:** Registra un nuevo pedido en la base de datos.

### Actualizar un pedido
- **Método:** PUT
- **Ruta:** `/api/pedidos/:id`
- **Parámetros:**
  - `id`: ID del pedido
- **Body (JSON):** Igual al POST
- **Descripción:** Actualiza los datos de un pedido existente.

### Eliminar un pedido
- **Método:** DELETE
- **Ruta:** `/api/pedidos/:id`
- **Parámetros:**
  - `id`: ID del pedido
- **Descripción:** Elimina un pedido por su ID.

---

## 👤 Clientes

### Obtener todos los clientes
- **Método:** GET
- **Ruta:** `/api/clientes`

### Crear un cliente
- **Método:** POST
- **Ruta:** `/api/clientes`
- **Body (JSON):**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@mail.com",
  "direccion": "Calle 123",
  "telefono": "1234567890"
}
```

---

## 🚚 Transportistas

### Obtener todos los transportistas
- **Método:** GET
- **Ruta:** `/api/transportistas`

### Crear transportista
- **Método:** POST
- **Ruta:** `/api/transportistas`
- **Body (JSON):**
```json
{
  "nombre": "Transportes S.A.",
  "placa": "XYZ123",
  "telefono": "9876543210"
}
```

---

## 📦 Productos

### Obtener productos
- **Método:** GET
- **Ruta:** `/api/productos`

### Crear producto
- **Método:** POST
- **Ruta:** `/api/productos`
- **Body (JSON):**
```json
{
  "nombre": "Caja",
  "descripcion": "Caja de cartón",
  "precio": 2000
}
```

---

## 🔄 Estados de Envío

### Obtener estados
- **Método:** GET
- **Ruta:** `/api/estados`

### Crear estado
- **Método:** POST
- **Ruta:** `/api/estados`
- **Body (JSON):**
```json
{
  "nombre_estado": "En tránsito"
}
```

---

## 📁 Recomendación para ubicación del archivo

Guarda este archivo como `API.md` en la raíz del proyecto o dentro de una carpeta llamada `docs/` o `documentacion/`, como se muestra a continuación:

```
TechLogistics/
├── backend/
├── frontend/
├── docs/
│   └── API.md  
└── README.md
