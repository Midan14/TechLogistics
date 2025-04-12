import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/styles.css'; // Asegúrate que este archivo existe y tiene Tailwind o CSS correcto
import App from './App.jsx';

// Punto de montaje principal
const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('❌ Error: No se encontró el elemento con id="root" en el HTML.');
}
