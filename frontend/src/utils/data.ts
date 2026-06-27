// frontend/src/utils/data.ts

/**
 * Función centralizada para obtener productos.
 * En el futuro, solo cambias la URL aquí y toda la app se actualiza.
 */
export const fetchProductos = async () => {
    try {
        const response = await fetch('/data/productos.json');
        if (!response.ok) throw new Error('Error al cargar productos');
        return await response.json();
    } catch (error) {
        console.error("Fallo al obtener productos:", error);
        return [];
    }
};

export const fetchUsuarios = async () => {
    const response = await fetch('/data/usuarios.json');
    return await response.json();
};

export const fetchCategorias = async () => {
    try {
        const response = await fetch('/data/categorias.json');
        if (!response.ok) throw new Error('Error al cargar categorías');
        return await response.json();
    } catch (error) {
        console.error("Fallo al obtener categorías:", error);
        return [];
    }
};

export const fetchPedidos = async () => {
    const response = await fetch("/data/pedidos.json");
    return await response.json();
};