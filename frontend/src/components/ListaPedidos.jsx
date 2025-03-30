import React, { useState, useEffect } from 'react';

// Componentes simulados ya que no tenemos los componentes UI reales
const Button = ({ children, variant, onClick, disabled, className }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`px-4 py-2 rounded ${variant === 'outline' ? 'border border-gray-300' : variant === 'link' ? 'text-blue-500 hover:text-blue-700 underline' : 'bg-blue-500 text-white'} ${className || ''}`}
  >
    {children}
  </button>
);

const Input = ({ type, placeholder, value, onChange, className }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`border rounded px-3 py-2 w-full ${className || ''}`}
  />
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

const Skeleton = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className || ''}`}></div>
);

const Table = ({ children }) => (
  <table className="min-w-full divide-y divide-gray-200">{children}</table>
);

const TableHeader = ({ children }) => (
  <thead className="bg-gray-50">{children}</thead>
);

const TableBody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
);

const TableRow = ({ children }) => (
  <tr>{children}</tr>
);

const TableHead = ({ children }) => (
  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>
);

const TableCell = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap">{children}</td>
);

// Mock Data (Replace with actual API calls)
const mockPedidos = [
    { id: '1', cliente: 'Cliente A', producto: 'Producto X', cantidad: 10, transportista: 'Transportista 1', estado: 'En Proceso' },
    { id: '2', cliente: 'Cliente B', producto: 'Producto Y', cantidad: 5, transportista: 'Transportista 2', estado: 'En Camino' },
    { id: '3', cliente: 'Cliente C', producto: 'Producto Z', cantidad: 12, transportista: 'Transportista 1', estado: 'Entregado' },
    { id: '4', cliente: 'Cliente A', producto: 'Producto X', cantidad: 10, transportista: 'Transportista 1', estado: 'En Proceso' },
    { id: '5', cliente: 'Cliente B', producto: 'Producto Y', cantidad: 5, transportista: 'Transportista 2', estado: 'En Camino' },
    { id: '6', cliente: 'Cliente C', producto: 'Producto Z', cantidad: 12, transportista: 'Transportista 1', estado: 'Entregado' },
    { id: '7', cliente: 'Cliente A', producto: 'Producto X', cantidad: 10, transportista: 'Transportista 1', estado: 'En Proceso' },
    { id: '8', cliente: 'Cliente B', producto: 'Producto Y', cantidad: 5, transportista: 'Transportista 2', estado: 'En Camino' },
    { id: '9', cliente: 'Cliente C', producto: 'Producto Z', cantidad: 12, transportista: 'Transportista 1', estado: 'Entregado' },
    { id: '10', cliente: 'Cliente A', producto: 'Producto X', cantidad: 10, transportista: 'Transportista 1', estado: 'En Proceso' },
    { id: '11', cliente: 'Cliente B', producto: 'Producto Y', cantidad: 5, transportista: 'Transportista 2', estado: 'En Camino' },
    { id: '12', cliente: 'Cliente C', producto: 'Producto Z', cantidad: 12, transportista: 'Transportista 1', estado: 'Entregado' },
];

const estadoOptions = [
    "Pendiente",
    "En Proceso",
    "En Camino",
    "Entregado",
    "Cancelado"
];

const ListaPedidos = ({ onSelectPedido }) => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5); // Fixed page size
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        const fetchPedidos = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate API call delay and pagination
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Apply search filter
                const filteredPedidos = mockPedidos.filter(pedido =>
                    Object.values(pedido).some(val =>
                        String(val).toLowerCase().includes(search.toLowerCase())
                    )
                );

                setTotalItems(filteredPedidos.length); // Set total items for pagination

                // Calculate start and end index for current page
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const pagedPedidos = filteredPedidos.slice(startIndex, endIndex);

                setPedidos(pagedPedidos);

            } catch (err) {
                setError(err.message || 'Failed to fetch pedidos');
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [search, page, pageSize]); // Remove pedidos from dependency array

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page when search changes
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    const totalPages = Math.ceil(totalItems / pageSize);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lista de Pedidos</h2>
                <Input
                    type="text"
                    placeholder="Buscar Pedido..."
                    value={search}
                    onChange={handleSearchChange}
                    className="max-w-xs"
                />
            </div>

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ) : pedidos.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Transportista</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pedidos.map((pedido) => (
                                <TableRow key={pedido.id}>
                                    <TableCell>{pedido.id}</TableCell>
                                    <TableCell>{pedido.cliente}</TableCell>
                                    <TableCell>{pedido.producto}</TableCell>
                                    <TableCell>{pedido.cantidad}</TableCell>
                                    <TableCell>{pedido.transportista}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={pedido.estado === 'Entregado' ? "success" :
                                                pedido.estado === 'En Camino' ? "secondary" :
                                                    pedido.estado === 'En Proceso' ? "primary" : "destructive"
                                            }
                                        >
                                            {pedido.estado}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="link" onClick={() => onSelectPedido(pedido)}>Ver Detalle</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-gray-500">No se encontraron pedidos.</p>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => handlePageChange(page - 1)}
                    >
                        Anterior
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "outline"}
                            onClick={() => handlePageChange(p)}
                        >
                            {p}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        Siguiente
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ListaPedidos;
