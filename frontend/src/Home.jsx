import React, { useState } from 'react';
import FormularioPedido from './components/FormularioPedido.jsx';
import SeguimientoEnvio from './components/SeguimientoEnvio.jsx';
import ListaPedidos from './components/ListaPedidos.jsx';
import DetallePedido from './components/DetallePedido.jsx';

function Home() {
    const [selectedPedido, setSelectedPedido] = useState(null);

    const handleSelectPedido = (pedido) => {
        setSelectedPedido(pedido);
    };

    const handleBackToList = () => {
        setSelectedPedido(null);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">
                Sistema de Gestión de Pedidos y Rastreo de Envíos
            </h1>

            {!selectedPedido ? (
                <>
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Registro de Pedidos</h2>
                        <FormularioPedido />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Seguimiento de Envíos</h2>
                        <SeguimientoEnvio />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Lista de Pedidos</h2>
                        <ListaPedidos onSelectPedido={handleSelectPedido} />
                    </div>
                </>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Detalle del Pedido</h2>
                    <DetallePedido pedido={selectedPedido} onBack={handleBackToList} />
                </div>
            )}
        </div>
    );
}

export default Home;
