import React, { useState } from 'react';

// Componentes simulados ya que no tenemos los componentes UI reales
const Button = ({ children, type, className }) => (
  <button 
    type={type} 
    className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-700 ${className || ''}`}
  >
    {children}
  </button>
);

const Input = ({ type, id, name, value, onChange, className, required }) => (
  <input
    type={type}
    id={id}
    name={name}
    value={value}
    onChange={onChange}
    className={`border rounded px-3 py-2 w-full ${className || ''}`}
    required={required}
  />
);

const Label = ({ htmlFor, children, className }) => (
  <label htmlFor={htmlFor} className={`block mb-2 ${className || ''}`}>{children}</label>
);

const Alert = ({ variant, children }) => (
  <div className={`p-4 rounded ${variant === 'destructive' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
    {children}
  </div>
);

const AlertTitle = ({ children }) => (
  <h4 className="font-bold mb-1">{children}</h4>
);

const AlertDescription = ({ children }) => (
  <p>{children}</p>
);

const AlertCircle = () => (
  <span>⚠️</span>
);

const Card = ({ children, className }) => (
  <div className={`border rounded-lg p-4 bg-white shadow-sm ${className || ''}`}>{children}</div>
);

const CardContent = ({ children }) => (
  <div className="p-4">{children}</div>
);

function SeguimientoEnvio() {
  const [seguimientoId, setSeguimientoId] = useState('');
  const [estadoEnvio, setEstadoEnvio] = useState('');
  const [errorSeguimiento, setErrorSeguimiento] = useState('');
  const [mostrarResultadoSeguimiento, setMostrarResultadoSeguimiento] = useState(false);

  const handleSeguimientoEnvio = (e) => {
    e.preventDefault();
    setErrorSeguimiento('');
    setMostrarResultadoSeguimiento(false);

    if (!seguimientoId.trim()) {
      setErrorSeguimiento('Por favor, ingrese el ID del pedido.');
      return;
    }

    // Aquí iría la lógica para obtener el estado del envío desde el servidor
    // Simulando una respuesta del servidor
    setTimeout(() => {
      let estados = ['En preparación', 'En camino', 'Entregado', 'Retrasado'];
      let estadoAleatorio = estados[Math.floor(Math.random() * estados.length)];
      setEstadoEnvio(estadoAleatorio);
      setMostrarResultadoSeguimiento(true);
    }, 1000);
  };

  return (
    <form onSubmit={handleSeguimientoEnvio} className="space-y-4">
      <div>
        <Label htmlFor="pedido-id"  className="block text-gray-700 text-sm font-bold mb-2">ID del Pedido:</Label>
        <Input
          type="text"
          id="pedido-id"
          name="pedido-id"
          value={seguimientoId}
          onChange={(e) => setSeguimientoId(e.target.value)}
           className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        {errorSeguimiento && (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorSeguimiento}</AlertDescription>
          </Alert>
        )}
      </div>
      <Button type="submit"  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Buscar Envío</Button>
      {mostrarResultadoSeguimiento && (
        <Card className="mt-4">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Estado del Envío:</h3>
            <p id="estado-envio" className="text-gray-800">
              {estadoEnvio}
            </p>
          </CardContent>
        </Card>
      )}
    </form>
  );
}

export default SeguimientoEnvio;