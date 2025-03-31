import React, { useState, useEffect } from 'react';

function FormularioPedido() {
  // Estado para almacenar las listas de opciones
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  // Estado para el pedido
  const [pedido, setPedido] = useState({
    idCliente: '',
    idProducto: '',
    idTransportista: '',
    idRuta: '',
    cantidad: '',
    fechaPedido: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
    idEstadoEnvio: '1'  // 1 suponemos que es "Pendiente" en la base de datos
  });

  const [mensajeRegistro, setMensajeRegistro] = useState('');
  const [erroresRegistro, setErroresRegistro] = useState({});

  // Para simular datos mientras no tenemos las API completas
  useEffect(() => {
    // Datos simulados
    setClientes([{ id: 1, nombre: 'Julian Garrido' }, { id: 2, nombre: 'Ana Lopez' }]);
    setProductos([{ id: 1, nombre: 'ProductoX' }, { id: 2, nombre: 'ProductoY' }]);
    setTransportistas([{ id: 1, nombre: 'Transportista1' }, { id: 2, nombre: 'Transportista2' }]);
    setRutas([{ id: 1, origen: 'Madrid', destino: 'Barcelona' }, { id: 2, origen: 'Valencia', destino: 'Sevilla' }]);
  }, []);

  const handleInputChange = (e) => {
    setPedido({ ...pedido, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroresRegistro({});
    setMensajeRegistro('');
    setCargando(true);

    try {
      // Objeto extremadamente simple para probar la conexión
      const pedidoMinimo = {
        idCliente: 1,
        idProducto: 1,
        idTransportista: 1,
        idRuta: 1,
        cantidad: 1,
        fechaPedido: new Date().toISOString().split('T')[0],
        idEstadoEnvio: 1
      };
      
      console.log('Enviando datos mínimos al servidor:', pedidoMinimo);
      
      const response = await fetch('http://localhost:5001/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoMinimo),
      });

      // Leer el cuerpo de la respuesta como texto primero para depuración
      const responseText = await response.text();
      console.log('Respuesta del servidor (texto):', responseText);
      
      // Si hay contenido, intentar parsearlo como JSON
      let data;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
          console.log('Respuesta del servidor (JSON):', data);
        } catch (parseError) {
          console.error('Error al parsear la respuesta JSON:', parseError);
          setMensajeRegistro('Error al parsear la respuesta del servidor');
          setCargando(false);
          return;
        }
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.mensaje || `Error ${response.status}: ${response.statusText}`);
      }

      // Reiniciar el formulario
      setPedido({
        idCliente: '',
        idProducto: '',
        idTransportista: '',
        idRuta: '',
        cantidad: '',
        fechaPedido: new Date().toISOString().split('T')[0],
        idEstadoEnvio: '1'
      });
      
      setMensajeRegistro('Pedido registrado correctamente.');
    } catch (err) {
      setMensajeRegistro('Error al registrar el pedido: ' + err.message);
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="idCliente" className="block font-medium">Cliente</label>
        <select
          id="idCliente"
          name="idCliente"
          value={pedido.idCliente}
          onChange={handleInputChange}
          className="border px-3 py-2 w-full rounded"
        >
          <option value="">Seleccione un cliente</option>
          {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
          ))}
        </select>
        {erroresRegistro.idCliente && <p className="text-red-500">{erroresRegistro.idCliente}</p>}
      </div>

      <div>
        <label htmlFor="idProducto" className="block font-medium">Producto</label>
        <select
          id="idProducto"
          name="idProducto"
          value={pedido.idProducto}
          onChange={handleInputChange}
          className="border px-3 py-2 w-full rounded"
        >
          <option value="">Seleccione un producto</option>
          {productos.map(producto => (
            <option key={producto.id} value={producto.id}>{producto.nombre}</option>
          ))}
        </select>
        {erroresRegistro.idProducto && <p className="text-red-500">{erroresRegistro.idProducto}</p>}
      </div>

      <div>
        <label htmlFor="cantidad" className="block font-medium">Cantidad</label>
        <input
          type="number"
          id="cantidad"
          name="cantidad"
          value={pedido.cantidad}
          onChange={handleInputChange}
          className="border px-3 py-2 w-full rounded"
        />
        {erroresRegistro.cantidad && <p className="text-red-500">{erroresRegistro.cantidad}</p>}
      </div>

      <div>
        <label htmlFor="idTransportista" className="block font-medium">Transportista</label>
        <select
          id="idTransportista"
          name="idTransportista"
          value={pedido.idTransportista}
          onChange={handleInputChange}
          className="border px-3 py-2 w-full rounded"
        >
          <option value="">Seleccione un transportista</option>
          {transportistas.map(transportista => (
            <option key={transportista.id} value={transportista.id}>{transportista.nombre}</option>
          ))}
        </select>
        {erroresRegistro.idTransportista && <p className="text-red-500">{erroresRegistro.idTransportista}</p>}
      </div>

      <div>
        <label htmlFor="idRuta" className="block font-medium">Ruta</label>
        <select
          id="idRuta"
          name="idRuta"
          value={pedido.idRuta}
          onChange={handleInputChange}
          className="border px-3 py-2 w-full rounded"
        >
          <option value="">Seleccione una ruta</option>
          {rutas.map(ruta => (
            <option key={ruta.id} value={ruta.id}>{ruta.origen} - {ruta.destino}</option>
          ))}
        </select>
        {erroresRegistro.idRuta && <p className="text-red-500">{erroresRegistro.idRuta}</p>}
      </div>

      <button 
        type="submit" 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={cargando}
      >
        {cargando ? 'Registrando...' : 'Registrar Pedido'}
      </button>

      {mensajeRegistro && (
        <p className={`mt-4 ${mensajeRegistro.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {mensajeRegistro}
        </p>
      )}
    </form>
  );
}

export default FormularioPedido;
