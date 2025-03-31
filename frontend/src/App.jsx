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
    <div>
      <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">
        Sistema de Gestión de Pedidos y Rastreo de Envíos
      </h1>

      {!selectedPedido ? (
        <>
          <section className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Registro de Pedidos</h2>
            <FormularioPedido />
          </section>

          <section className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Seguimiento de Envíos</h2>
            <SeguimientoEnvio />
          </section>

          <section className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lista de Pedidos</h2>
            <ListaPedidos onSelectPedido={handleSelectPedido} />
          </section>
        </>
      ) : (
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <DetallePedido pedido={selectedPedido} onBack={handleBackToList} />
        </section>
      )}
    </div>
  );
}

export default Home;
