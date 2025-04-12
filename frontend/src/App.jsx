import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import FormularioPedido from './components/FormularioPedido';
import ListaPedidos from './components/ListaPedidos';
import SeguimientoEnvio from './components/SeguimientoEnvio';

function App() {
    return (
        <Router>
            <main className="container mx-auto px-4 py-6">
                <h1 className="text-3xl font-bold mb-6 text-center">TechLogistics - Gestión de Pedidos</h1>

                <Routes>
                    <Route path="/" element={<Navigate to="/formulario" />} />
                    <Route path="/formulario" element={<FormularioPedido />} />
                    <Route path="/pedidos" element={<ListaPedidos onSelectPedido={() => {}} />} />
                    <Route path="/seguimiento" element={<SeguimientoEnvio />} />
                    <Route path="*" element={<p className="text-center text-red-600">Página no encontrada</p>} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
