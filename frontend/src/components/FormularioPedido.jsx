import React, { useState, useEffect } from 'react';

function FormularioPedido() {
  // --- OBSERVACIONES GENERALES ---
  // - El manejo del estado y los inputs/selects parece correcto.
  // - Para una aplicación real, los datos de los selects (clientes, productos, etc.)
  //   deberían cargarse desde la API en el useEffect, no estar hardcodeados.
  // - La validación básica de campos requeridos es útil.

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [estadosEnvio, setEstadosEnvio] = useState([]);
  const [cargando, setCargando] = useState(false);
  // Se renombró para diferenciar mensajes de éxito/error
  const [mensajeResultado, setMensajeResultado] = useState('');
  const [esError, setEsError] = useState(false);


  const [pedido, setPedido] = useState({
    clienteId: '',
    productoId: '',
    transportistaId: '',
    rutaId: '',
    cantidad: '',
    estadoEnvioId: '',
    // estado: 'pendiente' // Ya no es necesario mantener este string aquí si usamos estadoEnvioId
  });

  const API_BASE = 'http://localhost:5000/api'; // Asegúrate que esta URL es correcta

  useEffect(() => {
    // Carga inicial de datos (idealmente vendría de la API)
    setClientes([{ id: 1, nombre: 'Julian Garrido' }, { id: 2, nombre: 'Ana Lopez' }]);
    setProductos([{ id: 1, nombre: 'ProductoX' }, { id: 2, nombre: 'ProductoY' }]);
    setTransportistas([{ id: 1, nombre: 'Transportista1' }, { id: 2, nombre: 'Transportista2' }]);
    setRutas([{ id: 1, origen: 'Madrid', destino: 'Barcelona' }, { id: 2, origen: 'Valencia', destino: 'Sevilla' }]);
    // Asegúrate que estos IDs coinciden con los de tu BD si `estadoEnvioId` es una FK
    setEstadosEnvio([{ id: 1, estado: 'pendiente' }, { id: 2, estado: 'en tránsito' }, { id: 3, estado: 'entregado' }]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPedido((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeResultado(''); // Limpia mensaje previo
    setEsError(false);
    setCargando(true);

    // Validación básica de campos requeridos
    const camposRequeridos = ['clienteId', 'productoId', 'transportistaId', 'rutaId', 'cantidad', 'estadoEnvioId'];
    for (let campo of camposRequeridos) {
      if (!pedido[campo]) {
        setMensajeResultado('❌ Completa todos los campos obligatorios.');
        setEsError(true);
        setCargando(false);
        return;
      }
    }

    // --- INICIO CORRECCIÓN ---
    // Se construye el objeto a enviar, alineado con lo que espera el backend (validado por express-validator)
    const pedidoFinal = {
      // Convertimos a entero los IDs y cantidad
      clienteId: parseInt(pedido.clienteId),
      productoId: parseInt(pedido.productoId),
      transportistaId: parseInt(pedido.transportistaId),
      rutaId: parseInt(pedido.rutaId),
      cantidad: parseInt(pedido.cantidad),
      estadoEnvioId: parseInt(pedido.estadoEnvioId), // El backend espera este ID numérico
      fechaPedido: new Date().toISOString(), // El backend espera formato ISO8601
      // estado: pedido.estado || 'pendiente' // <-- SE ELIMINÓ ESTA LÍNEA - El backend no espera/valida este campo string.
    };
    // --- FIN CORRECCIÓN ---

    // console.log('DEBUG: Enviando este pedidoFinal:', pedidoFinal); // Puedes usar esto para depurar

    try {
      const response = await fetch(`${API_BASE}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoFinal)
      });

      let data;
      try {
        // Intentamos parsear como JSON, incluso si es error (el backend devuelve JSON en errores 400)
        data = await response.json();
      } catch(jsonError) {
        // Si la respuesta no es JSON (ej. error 500 sin JSON)
        console.error("Respuesta no es JSON:", jsonError);
        // Intentamos obtener texto plano si falla el JSON
        const textoError = await response.text();
        throw new Error(textoError || `Error ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        // El backend devuelve un objeto con "mensaje" y "errores" en caso de validación 400
        // o podría tener solo "mensaje" en otros errores.
        const errorMsg = data?.mensaje || data?.message || 'Error desconocido al crear pedido';
        // Si hay un array de errores de validación, podríamos mostrarlo también
        if (data?.errores) {
          console.error("Errores de validación:", data.errores);
        }
        throw new Error(errorMsg); // Lanza error con el mensaje del backend
      }

      // Éxito
      setMensajeResultado('✅ Pedido registrado correctamente.');
      setEsError(false);
      // Limpiar formulario tras éxito
      setPedido({ clienteId: '', productoId: '', transportistaId: '', rutaId: '', cantidad: '', estadoEnvioId: '' });

    } catch (err) {
      console.error('Error en handleSubmit:', err);
      // Muestra el mensaje de error capturado (del backend o de red)
      setMensajeResultado(`❌ ${err.message}`);
      setEsError(true);
    } finally {
      setCargando(false); // Asegura que el estado de carga se desactive siempre
    }
  };

  // --- OBSERVACIÓN: Componentes InputField y SelectField ---
  // Estos componentes auxiliares están bien definidos y ayudan a la reutilización.

  return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-lg bg-white">
        <h2 className="text-xl font-semibold mb-4 text-center">Registrar Nuevo Pedido</h2>
        {/* Renderiza los campos usando los componentes auxiliares */}
        <SelectField label="Cliente" name="clienteId" value={pedido.clienteId} onChange={handleInputChange} options={clientes} />
        <SelectField label="Producto" name="productoId" value={pedido.productoId} onChange={handleInputChange} options={productos} />
        <InputField label="Cantidad" name="cantidad" type="number" value={pedido.cantidad} onChange={handleInputChange} />
        <SelectField label="Transportista" name="transportistaId" value={pedido.transportistaId} onChange={handleInputChange} options={transportistas} />
        <SelectField label="Ruta" name="rutaId" value={pedido.rutaId} onChange={handleInputChange} options={rutas} display={(r) => `${r.origen} - ${r.destino}`} />
        <SelectField label="Estado Envío" name="estadoEnvioId" value={pedido.estadoEnvioId} onChange={handleInputChange} options={estadosEnvio} display={(e) => e.estado} />

        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Registrar Pedido'}
        </button>

        {/* Muestra mensaje de resultado (éxito o error) */}
        {mensajeResultado && (
            <p className={`mt-4 text-center p-2 rounded ${esError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {mensajeResultado}
            </p>
        )}
      </form>
  );
}

// Componente auxiliar para campos de texto/número
const InputField = ({ label, name, type = 'text', value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>{label}</label>
      <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          min={type === 'number' ? '1' : undefined} // Añade validación básica HTML para cantidad > 0
          className="border border-gray-300 px-3 py-2 w-full rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required // Añade validación HTML básica
      />
    </div>
);

// Componente auxiliar para campos select
const SelectField = ({ label, name, value, onChange, options = [], display }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>{label}</label>
      <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="border border-gray-300 px-3 py-2 w-full rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required // Añade validación HTML básica
      >
        <option value="" disabled>Seleccione {label.toLowerCase()}</option>
        {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {/* Usa la función display si existe, sino asume que la opción tiene 'nombre' */}
              {display ? display(opt) : opt.nombre}
            </option>
        ))}
      </select>
    </div>
);

export default FormularioPedido;