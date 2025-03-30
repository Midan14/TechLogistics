import React, { useState } from 'react';

// Componentes simulados ya que no tenemos los componentes UI reales
const Button = ({ children, type, className }) => (
  <button 
    type={type} 
    className={`px-4 py-2 rounded bg-green-500 text-white hover:bg-green-700 ${className || ''}`}
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

function FormularioPedido() {
  const [pedido, setPedido] = useState({
    cliente: '',
    producto: '',
    cantidad: '',
    transportista: '',
  });
  const [mensajeRegistro, setMensajeRegistro] = useState('');
  const [erroresRegistro, setErroresRegistro] = useState({});


  const handleInputChange = (e) => {
    setPedido({ ...pedido, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErroresRegistro({});
    setMensajeRegistro('');

    let nuevosErrores = {};
    let hayErrores = false;

    if (!pedido.cliente.trim()) {
      nuevosErrores.cliente = 'Por favor, ingrese el nombre del cliente.';
      hayErrores = true;
    }
    if (!pedido.producto.trim()) {
      nuevosErrores.producto = 'Por favor, ingrese el nombre del producto.';
      hayErrores = true;
    }
    if (!pedido.cantidad.trim() || isNaN(Number(pedido.cantidad)) || parseInt(pedido.cantidad) <= 0) {
      nuevosErrores.cantidad = 'Por favor, ingrese una cantidad válida.';
      hayErrores = true;
    }
    if (!pedido.transportista.trim()) {
      nuevosErrores.transportista = 'Por favor, ingrese el nombre del transportista.';
      hayErrores = true;
    }

    if (hayErrores) {
      setErroresRegistro(nuevosErrores);
      return;
    }

    // Aquí iría la lógica para enviar el pedido al servidor
    console.log('Pedido:', pedido);
    setMensajeRegistro('Pedido Registrado Correctamente');
    setPedido({ cliente: '', producto: '', cantidad: '', transportista: '' }); // Limpiar el formulario
    setTimeout(() => {
      setMensajeRegistro('');
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cliente" className="block text-gray-700 text-sm font-bold mb-2">Cliente:</Label>
        <Input
          type="text"
          id="cliente"
          name="cliente"
          value={pedido.cliente}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        {erroresRegistro.cliente && (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{erroresRegistro.cliente}</AlertDescription>
          </Alert>
        )}
      </div>
      <div>
        <Label htmlFor="producto"  className="block text-gray-700 text-sm font-bold mb-2">Producto:</Label>
        <Input
          type="text"
          id="producto"
          name="producto"
          value={pedido.producto}
          onChange={handleInputChange}
           className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
         {erroresRegistro.producto && (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{erroresRegistro.producto}</AlertDescription>
          </Alert>
        )}
      </div>
      <div>
        <Label htmlFor="cantidad"  className="block text-gray-700 text-sm font-bold mb-2">Cantidad:</Label>
        <Input
          type="number"
          id="cantidad"
          name="cantidad"
          value={pedido.cantidad}
          onChange={handleInputChange}
           className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
         {erroresRegistro.cantidad && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{erroresRegistro.cantidad}</AlertDescription>
          </Alert>
        )}
      </div>
      <div>
        <Label  className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transportista">Transportista:</Label>
        <Input
          type="text"
          id="transportista"
          name="transportista"
          value={pedido.transportista}
          onChange={handleInputChange}
           className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
         {erroresRegistro.transportista && (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{erroresRegistro.transportista}</AlertDescription>
          </Alert>
        )}
      </div>
      <Button type="submit"  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Registrar Pedido</Button>
      {mensajeRegistro && <p>{mensajeRegistro}</p>}
    </form>
  );
}

export default FormularioPedido;
