import React, { useState, useEffect } from 'react';

// Componentes simulados ya que no tenemos los componentes UI reales
const Button = ({ children, variant, onClick, disabled, className }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`px-4 py-2 rounded ${variant === 'outline' ? 'border border-gray-300' : 'bg-blue-500 text-white'} ${className || ''}`}
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

const Card = ({ children }) => (
  <div className="border rounded-lg p-4 bg-white shadow-sm">{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-xl font-semibold">{children}</h3>
);

const CardDescription = ({ children }) => (
  <p className="text-gray-500">{children}</p>
);

const CardContent = ({ children }) => (
  <div>{children}</div>
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

const Badge = ({ variant, children }) => {
  let color = 'bg-gray-100 text-gray-800';
  if (variant === 'success') color = 'bg-green-100 text-green-800';
  if (variant === 'secondary') color = 'bg-blue-100 text-blue-800';
  if (variant === 'primary') color = 'bg-purple-100 text-purple-800';
  if (variant === 'destructive') color = 'bg-red-100 text-red-800';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {children}
    </span>
  );
};

const estadoOptions = [
    "Pendiente",
    "En Proceso",
    "En Camino",
    "Entregado",
    "Cancelado"
];

const DetallePedido = ({ pedido, onBack }) => {
    const [editMode, setEditMode] = useState(false);
    const [editedPedido, setEditedPedido] = useState(pedido);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setEditedPedido(pedido);
    }, [pedido]);

    const handleInputChange = (e) => {
        setEditedPedido({ ...editedPedido, [e.target.name]: e.target.value });
    };

    const handleEstadoChange = (e) => {
        setEditedPedido({ ...editedPedido, estado: e.target.value });
    };

    const handleGuardar = async () => {
        setLoading(true);
        setError(null);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In a real app, you'd send the editedPedido to the server
            console.log('Pedido actualizado:', editedPedido);
            setEditMode(false);
        } catch (err) {
            setError(err.message || "Failed to update order");
        } finally {
            setLoading(false);
        }
    };

    if (!pedido) {
        return <p>Seleccione un pedido para ver los detalles.</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Detalle del Pedido {pedido.id}</h2>
                <div>
                    {editMode ? (
                        <>
                            <Button
                                variant="secondary"
                                onClick={handleGuardar}
                                disabled={loading}
                                className={loading ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                {loading ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button variant="outline" onClick={() => setEditMode(false)} disabled={loading} className={loading ? "opacity-50 cursor-not-allowed" : ""}>
                                Cancelar
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => setEditMode(true)} disabled={loading} className={loading ? "opacity-50 cursor-not-allowed" : ""}>
                            Editar
                        </Button>
                    )}
                    <Button variant="ghost" onClick={onBack}>
                        Volver a la lista
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Información del Pedido</CardTitle>
                    <CardDescription>Detalles del pedido seleccionado.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cliente" className="block text-gray-700 text-sm font-bold mb-2">Cliente:</Label>
                            {editMode ? (
                                <Input
                                    type="text"
                                    id="cliente"
                                    name="cliente"
                                    value={editedPedido.cliente}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            ) : (
                                <p className="text-gray-800">{pedido.cliente}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="producto" className="block text-gray-700 text-sm font-bold mb-2">Producto:</Label>
                            {editMode ? (
                                <Input
                                    type="text"
                                    id="producto"
                                    name="producto"
                                    value={editedPedido.producto}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            ) : (
                                <p className="text-gray-800">{pedido.producto}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="cantidad" className="block text-gray-700 text-sm font-bold mb-2">Cantidad:</Label>
                            {editMode ? (
                                <Input
                                    type="number"
                                    id="cantidad"
                                    name="cantidad"
                                    value={editedPedido.cantidad}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            ) : (
                                <p className="text-gray-800">{pedido.cantidad}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="transportista" className="block text-gray-700 text-sm font-bold mb-2">Transportista:</Label>
                            {editMode ? (
                                <Input
                                    type="text"
                                    id="transportista"
                                    name="transportista"
                                    value={editedPedido.transportista}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            ) : (
                                <p className="text-gray-800">{pedido.transportista}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="estado" className="block text-gray-700 text-sm font-bold mb-2">Estado:</Label>
                            {editMode ? (
                                <select
                                    id="estado"
                                    name="estado"
                                    value={editedPedido.estado}
                                    onChange={handleEstadoChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    {estadoOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            ) : (
                                 <Badge
                                    variant={pedido.estado === 'Entregado' ? "success" :
                                        pedido.estado === 'En Camino' ? "secondary" :
                                            pedido.estado === 'En Proceso' ? "primary" : "destructive"
                                    }
                                >
                                    {pedido.estado}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DetallePedido;
