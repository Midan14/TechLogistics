import React, { useState } from 'react';

function SeguimientoEnvio() {
  const [seguimientoId, setSeguimientoId] = useState('');
  const [estadoEnvio, setEstadoEnvio] = useState('');
  const [errorSeguimiento, setErrorSeguimiento] = useState('');
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSeguimientoEnvio = async (e) => {
    e.preventDefault();
    setErrorSeguimiento('');
    setMostrarResultado(false);

    if (!seguimientoId.trim()) {
      setErrorSeguimiento('Por favor, ingrese el ID del pedido.');
      return;
    }

    // Simulación del seguimiento (se puede reemplazar con un fetch real)
    setLoading(true);
    setTimeout(() => {
      const estados = ['En preparación', 'En camino', 'Entregado', 'Retrasado'];
      const estadoAleatorio = estados[Math.floor(Math.random() * estados.length)];
      setEstadoEnvio(estadoAleatorio);
      setMostrarResultado(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSeguimientoEnvio} className="space-y-4">
      <div>
        <label htmlFor="seguimientoId" className="block font-medium mb-1">
          ID del Pedido
        </label>
        <input
          type="text"
          id="seguimientoId"
          value={seguimientoId}
          onChange={(e) => setSeguimientoId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          placeholder="Ej. 123"
        />
        {errorSeguimiento && (
          <p className="text-red-500 mt-1">{errorSeguimiento}</p>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Consultar Estado
      </button>

      {loading && <p className="text-gray-600">Consultando...</p>}

      {mostrarResultado && !loading && (
        <div className="mt-4 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded">
          Estado actual del pedido <strong>#{seguimientoId}</strong>:
          <p className="text-xl mt-2 font-semibold">{estadoEnvio}</p>
        </div>
      )}
    </form>
  );
}

export default SeguimientoEnvio;
