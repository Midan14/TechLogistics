import React, { useEffect, useState } from 'react';

// Componente fila de la tabla
const PedidoRow = ({ pedido, onSelectPedido }) => (
    <tr className="border-b">
        <td className="py-2 px-4">{pedido.idPedido}</td> {/* CAMBIADO */}
        <td className="py-2 px-4">{pedido.cliente?.nombre || '—'}</td>
        <td className="py-2 px-4">{pedido.producto?.nombre || '—'}</td>
        <td className="py-2 px-4">{pedido.cantidad}</td>
        <td className="py-2 px-4">{pedido.estado}</td>
        <td className="py-2 px-4">
            <button
                onClick={() => onSelectPedido(pedido)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
                Ver Detalle
            </button>
        </td>
    </tr>
);

const ListaPedidos = ({ onSelectPedido }) => {
    const [pedidos, setPedidos] = useState([]);
    const [filtroID, setFiltroID] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_BASE = 'http://localhost:5000/api/pedidos';

    useEffect(() => {
        const obtenerPedidos = async () => {
            setLoading(true);
            try {
                const response = await fetch(API_BASE);
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Pedidos obtenidos:', data);
                setPedidos(data);
            } catch (err) {
                console.error('Error al obtener pedidos:', err);
                setError(`Error al cargar los pedidos: ${err.message}`);
                setPedidos([]);
            } finally {
                setLoading(false);
            }
        };

        obtenerPedidos();
    }, []);

    const pedidosFiltrados = pedidos.filter((p) =>
        filtroID ? p.idPedido.toString() === filtroID : true // CAMBIADO
    );

    return (
        <div className="space-y-4">
            <input
                type="text"
                placeholder="Filtrar por ID de pedido"
                value={filtroID}
                onChange={(e) => setFiltroID(e.target.value)}
                className="border px-3 py-2 rounded w-full sm:w-64"
            />

            {loading && <p>Cargando pedidos...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && pedidosFiltrados.length === 0 && (
                <p className="text-gray-600">No hay pedidos que coincidan.</p>
            )}

            {pedidosFiltrados.length > 0 && (
                <table className="w-full border-collapse border rounded shadow">
                    <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="py-2 px-4">ID</th>
                        <th className="py-2 px-4">Cliente</th>
                        <th className="py-2 px-4">Producto</th>
                        <th className="py-2 px-4">Cantidad</th>
                        <th className="py-2 px-4">Estado</th>
                        <th className="py-2 px-4">Acción</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pedidosFiltrados.map((pedido) => (
                        <PedidoRow key={pedido.idPedido} pedido={pedido} onSelectPedido={onSelectPedido} />
                        // ^ CAMBIADO de pedido.id → pedido.idPedido
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ListaPedidos;
