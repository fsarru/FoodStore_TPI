import { checkAuthUser } from "../../../utils/auth";
import { fetchPedidos, fetchUsuarios, fetchProductos } from "../../../utils/data";
import { getAdminData, saveAdminData } from "../../../utils/storage";

checkAuthUser(["ADMIN"]); // Solo ADMIN

const estadoMap: { [key: string]: string } = {
    "EN_PREPARACION": "PENDIENTE",
    "ENTREGADO": "TERMINADO",
    "CONFIRMADO": "CONFIRMADO",
    "PENDIENTE": "PENDIENTE",
    "TERMINADO": "TERMINADO",
    "CANCELADO": "CANCELADO"
};

// --- FUNCIÓN GLOBAL PARA CAMBIAR EL ESTADO ---
(window as any).cambiarEstado = (pedidoId: number, nuevoEstado: string) => {
    let pedidos = getAdminData("pedidos");
    const index = pedidos.findIndex((p: any) => p.id == pedidoId);
    if (index !== -1) {
        pedidos[index].estado = nuevoEstado;
        saveAdminData("pedidos", pedidos);
        alert("Estado actualizado con éxito.");
        
        const modal = document.getElementById("order-modal");
        if (modal) modal.style.display = "none";
        
        const filtroSelect = document.getElementById("estado-filter") as HTMLSelectElement;
        renderPedidos(filtroSelect ? filtroSelect.value : "TODOS"); 
    }
};

// --- RENDERIZADO DE LA LISTA PRINCIPAL ---
const renderPedidos = async (filtroEstado: string = "TODOS") => {
    // 1. Lógica de Semilla
    let pedidos = getAdminData("pedidos");
    if (pedidos.length === 0) {
        pedidos = await fetchPedidos();
        saveAdminData("pedidos", pedidos);
    }
    
    let usuarios = getAdminData("usuarios");
    if (usuarios.length === 0) {
        usuarios = await fetchUsuarios();
        saveAdminData("usuarios", usuarios);
    }

    const container = document.getElementById("admin-orders-container");
    if (!container) return;

    // 2. Filtrado por Estado
    let filtrados = pedidos;
    if (filtroEstado !== "TODOS") {
        filtrados = pedidos.filter((p: any) => {
            const estadoTraducido = estadoMap[p.estado] || p.estado;
            return estadoTraducido === filtroEstado;
        });
    }

    if (filtrados.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px;'>No hay pedidos con este estado.</p>";
        return;
    }

    // 3. Renderizado
    container.innerHTML = [...filtrados].reverse().map((p: any) => {
        const user = usuarios.find((u: any) => String(u.id) === String(p.idUsuario));
        const nombreCliente = user ? `${user.nombre} ${user.apellido}` : 'Cliente Desconocido';
        const estadoAmigable = estadoMap[p.estado] || p.estado;
        
        let colorEstado = "#e67e22"; 
        if (estadoAmigable === "CONFIRMADO") colorEstado = "#3498db"; 
        if (estadoAmigable === "TERMINADO") colorEstado = "#2ecc71"; 
        if (estadoAmigable === "CANCELADO") colorEstado = "#e74c3c"; 

        return `
            <div class="order-card" data-id="${p.id}" style="cursor:pointer; background:white; padding:15px; border-radius:8px; border:1px solid #ddd; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h3 style="margin:0 0 5px 0;">Pedido #${p.id}</h3>
                    <p style="margin:0; color:#555;">👤 Cliente: <strong>${nombreCliente}</strong></p>
                    <p style="margin:5px 0 0 0; font-size:0.9rem; color:#7f8c8d;">📅 ${p.fecha}</p>
                </div>
                <div style="text-align:right;">
                    <p style="margin:0 0 8px 0; font-weight:bold; font-size:1.2rem;">$${p.total}</p>
                    <span style="background:${colorEstado}; color:white; padding:5px 10px; border-radius:12px; font-size:0.8rem; font-weight:bold;">${estadoAmigable}</span>
                </div>
            </div>
        `;
    }).join("");
};

// --- DELEGACIÓN DE EVENTOS: CLICK PARA DETALLE COMPLETO (MODAL) ---
// Aquí es donde utilizamos fetchProductos para armar el detalle
document.getElementById("admin-orders-container")?.addEventListener("click", async (e) => {
    const card = (e.target as HTMLElement).closest(".order-card");
    if (!card) return;

    const id = parseInt(card.getAttribute("data-id") || "0");
    const pedidos = getAdminData("pedidos");
    const usuarios = getAdminData("usuarios");
    
    // AQUÍ SE USA FETCHPRODUCTOS PARA CRUZAR LOS DATOS DE LA LISTA
    let productos = getAdminData("productos");
    if (productos.length === 0) {
        productos = await fetchProductos();
        saveAdminData("productos", productos);
    }
    
    const pedido = pedidos.find((p: any) => p.id == id);
    const user = usuarios.find((u: any) => String(u.id) === String(pedido ? pedido.idUsuario : ""));

    if (pedido) {
        const modal = document.getElementById("order-modal");
        const content = document.getElementById("modal-content");
        if (!modal || !content) return;

        const detalles = pedido.detalles || [];
        const estadoActual = estadoMap[pedido.estado] || pedido.estado;

        content.innerHTML = `
            <div style="margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                <p><strong>Pedido:</strong> #${pedido.id}</p>
                <p><strong>Cliente:</strong> ${user ? `${user.nombre} ${user.apellido}` : 'Desconocido'} (${user?.email || ''})</p>
                <p><strong>Fecha:</strong> ${pedido.fecha}</p>
                <p><strong>Dirección:</strong> ${pedido.direccionEnvio || 'No registrada'}</p>
            </div>
            
            <h3 style="color: #2c3e50; font-size: 1.1rem; margin-bottom: 10px;">Productos:</h3>
            <table style="margin: 0 0 15px 0; width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid #ddd; text-align: left;">
                        <th>Img</th>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${detalles.length > 0 ? detalles.map((item: any) => {
                        const idProd = item.idProducto || item.productoId || (item.producto && item.producto.id);
                        const prod = productos.find((p: any) => String(p.id) === String(idProd));

                        const nombreProd = prod ? prod.nombre : 'Producto Eliminado';
                        const imgProd = prod ? prod.imagen : 'https://via.placeholder.com/40';

                        return `
                        <tr style="border-bottom: 1px solid #f1f1f1;">
                            <td style="padding: 5px 0;"><img src="${imgProd}" width="40" style="border-radius:4px; object-fit:cover; aspect-ratio:1/1;"></td>
                            <td style="padding: 5px 0;">${nombreProd}</td>
                            <td style="padding: 5px 0;">${item.cantidad}</td>
                            <td style="padding: 5px 0; text-align: right;">$${item.subtotal}</td>
                        </tr>
                        `;
                    }).join("") : '<tr><td colspan="4" style="text-align:center;">Sin líneas de producto</td></tr>'}
                </tbody>
            </table>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: right; margin-bottom: 20px;">
                <span style="font-size: 1.2rem; color: #27ae60;">Total del Pedido: <strong>$${pedido.total}</strong></span>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">Actualizar Estado:</label>
                <select id="select-estado-${pedido.id}" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ccc;">
                    <option value="PENDIENTE" ${estadoActual === 'PENDIENTE' ? 'selected' : ''}>Pendiente (En preparación)</option>
                    <option value="CONFIRMADO" ${estadoActual === 'CONFIRMADO' ? 'selected' : ''}>Confirmado</option>
                    <option value="TERMINADO" ${estadoActual === 'TERMINADO' ? 'selected' : ''}>Terminado (Entregado)</option>
                    <option value="CANCELADO" ${estadoActual === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button style="background: #ccc; color: #333; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;" onclick="document.getElementById('order-modal').style.display='none'">Cerrar</button>
                <button style="background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;" onclick="cambiarEstado(${pedido.id}, document.getElementById('select-estado-${pedido.id}').value)">Guardar Cambios</button>
            </div>
        `;
        
        modal.style.display = "flex";
    }
});

// --- LISTENER DEL FILTRO PRINCIPAL ---
const filtroSelect = document.getElementById("estado-filter") as HTMLSelectElement;
filtroSelect?.addEventListener("change", (e) => {
    const valor = (e.target as HTMLSelectElement).value;
    renderPedidos(valor);
});

// Logout
document.getElementById("logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "/src/pages/auth/login/login.html";
});

// Inicialización
renderPedidos();