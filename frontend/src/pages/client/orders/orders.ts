import { checkAuthUser } from "../../../utils/auth";
import { getAdminData, saveAdminData } from "../../../utils/storage";
import { fetchPedidos, fetchProductos } from "../../../utils/data";

// Validación de sesión
checkAuthUser(["USUARIO", "ADMIN"]);

const ordersContainer = document.getElementById("orders-container");
const cartBadge = document.getElementById("cart-count");

const ENVIO = 500; // Constante de envío

// MAPA DE ESTADOS
const estadoMap: { [key: string]: string } = {
    "EN_PREPARACION": "PENDIENTE",
    "ENTREGADO": "TERMINADO",
    "CONFIRMADO": "CONFIRMADO",
    "PENDIENTE": "PENDIENTE",
    "TERMINADO": "TERMINADO",
    "CANCELADO": "CANCELADO" 
};

// Actualizar el contador de la barra de navegación
const updateBadge = () => {
    if (cartBadge) {
        const carrito = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalItems = carrito.reduce((acc: number, item: any) => acc + item.cantidad, 0);
        cartBadge.innerText = totalItems.toString();
    }
};

// --- FUNCIÓN PRINCIPAL DE RENDERIZADO CON FILTRO ---
const renderOrders = async (filtroEstado: string = "TODOS") => {
    if (!ordersContainer) return;

    const sessionString = localStorage.getItem("user");
    const usuarioActual = sessionString ? JSON.parse(sessionString) : null;

    if (!usuarioActual) {
        ordersContainer.innerHTML = "<p>Error de sesión. Por favor, vuelve a ingresar.</p>";
        return;
    }

    // 1. Obtener historial (Prioridad 1: LocalStorage | Prioridad 2: JSON)
    let historialTotal = getAdminData("pedidos");
    if (historialTotal.length === 0) {
        try {
            historialTotal = await fetchPedidos();
            saveAdminData("pedidos", historialTotal);
        } catch (error) {
            console.error("Error cargando pedidos:", error);
        }
    }

    // 2. Filtro de Seguridad: El usuario solo ve sus propios pedidos
    let misPedidos = historialTotal.filter((pedido: any) => pedido.idUsuario === usuarioActual.id);

    // 3. Filtro Visual: Según lo que elija en el select
    if (filtroEstado !== "TODOS") {
        misPedidos = misPedidos.filter((p: any) => {
            const estadoTraducido = estadoMap[p.estado] || p.estado;
            return estadoTraducido === filtroEstado;
        });
    }

    if (misPedidos.length === 0) {
        ordersContainer.innerHTML = "<p style='color: #7f8c8d; text-align: center; padding: 40px; font-size: 1.1rem;'>No hay pedidos para mostrar.</p>";
        return;
    }

    ordersContainer.innerHTML = "";

    // 4. Renderizar cada pedido (ordenados del más reciente al más viejo)
    [...misPedidos].reverse().forEach((pedido: any) => {
        const div = document.createElement("div");
        div.className = "order-card"; 
        div.setAttribute("data-id", pedido.id.toString());
        div.style.border = "1px solid #ddd";
        div.style.borderRadius = "8px";
        div.style.padding = "15px";
        div.style.marginBottom = "15px";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        div.style.background = "#fdfdfd";
        div.style.cursor = "pointer"; 

        const estadoAmigable = estadoMap[pedido.estado] || pedido.estado;

        let colorEstado = "#e67e22"; // Amarillo/Naranja
        if (estadoAmigable === "CONFIRMADO") colorEstado = "#3498db"; // Azul
        if (estadoAmigable === "TERMINADO") colorEstado = "#2ecc71"; // Verde
        if (estadoAmigable === "CANCELADO") colorEstado = "#e74c3c"; // Rojo

        div.innerHTML = `
            <div>
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #2c3e50; font-size: 1.1rem;">Pedido #${pedido.id}</p>
                <p style="margin: 0; font-size: 0.9rem; color: #7f8c8d;">📅 Fecha: ${pedido.fecha}</p>
                <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #7f8c8d;">📦 Cantidad de items: ${pedido.detalles.length}</p>
            </div>
            <div style="text-align: right;">
                <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 1.3rem; color: #27ae60;">${pedido.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
                <span class="badge ${estadoAmigable}" style="background-color: ${colorEstado}; color: white; padding: 5px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">
                    ${estadoAmigable}
                </span>
            </div>
        `;
        ordersContainer.appendChild(div);
    });
};

// --- LISTENER DEL FILTRO DE ESTADO ---
const filtroSelect = document.getElementById("estado-filter") as HTMLSelectElement;
if (filtroSelect) {
    filtroSelect.addEventListener("change", (e) => {
        const valor = (e.target as HTMLSelectElement).value;
        renderOrders(valor); // Se renderiza usando el valor elegido
    });
}

// --- DELEGACIÓN DE EVENTOS: CLICK PARA DETALLE COMPLETO (MODAL) ---
ordersContainer?.addEventListener("click", async (e) => {
    const card = (e.target as HTMLElement).closest(".order-card");
    if (!card) return;

    const id = parseInt(card.getAttribute("data-id") || "0");
    const pedidos = getAdminData("pedidos");
    
    let productos = getAdminData("productos");
    if (productos.length === 0) {
        productos = await fetchProductos();
        saveAdminData("productos", productos);
    }
    
    const pedido = pedidos.find((p: any) => p.id === id);

    if (pedido) {
        const modal = document.getElementById("order-modal");
        const content = document.getElementById("modal-content");
        if (!modal || !content) return;

        const detalles = pedido.detalles || [];
        const subtotal = pedido.total - ENVIO; 
        const estadoAmigable = estadoMap[pedido.estado] || pedido.estado;

        content.innerHTML = `
            <div class="order-detail-header" style="margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                <p><strong>Pedido:</strong> #${pedido.id}</p>
                <p><strong>Fecha:</strong> ${pedido.fecha}</p>
                <p><strong>Estado:</strong> ${estadoAmigable}</p>
                <p><strong>Dirección de entrega:</strong> ${pedido.direccionEnvio || 'No especificada'}</p>
                <p><strong>Forma de Pago:</strong> ${pedido.formaPago || 'No especificada'}</p>
            </div>
            
            <h3 style="color: #2c3e50; font-size: 1.1rem; margin-bottom: 10px;">Productos:</h3>
            <table class="admin-table" style="margin: 0 0 15px 0; width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid #ddd; text-align: left;">
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

                        return `
                        <tr style="border-bottom: 1px solid #f1f1f1;">
                            <td style="padding: 10px 0;">${nombreProd}</td>
                            <td style="padding: 10px 0;">${item.cantidad}</td>
                            <td style="padding: 10px 0; text-align: right;">$${item.subtotal}</td>
                        </tr>
                        `;
                    }).join("") : '<tr><td colspan="3" style="text-align:center;">Sin líneas de producto</td></tr>'}
                </tbody>
            </table>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: right;">
                <p style="margin: 0 0 5px 0; color: #555;">Subtotal: <strong>$${subtotal}</strong></p>
                <p style="margin: 0 0 10px 0; color: #555;">Envío: <strong>$${ENVIO}</strong></p>
                <span style="font-size: 1.2rem; color: #27ae60;">Total del Pedido: <strong>$${pedido.total}</strong></span>
            </div>
            
            <div style="display: flex; justify-content: flex-end; margin-top: 15px;">
                <button class="btn-base" style="background: #e74c3c; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;" onclick="document.getElementById('order-modal').style.display='none'">Cerrar</button>
            </div>
        `;
        
        modal.style.display = "flex";
    }
});

// Logout 
const logoutBtn = document.getElementById("logoutButton");
logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "/src/pages/auth/login/login.html";
});

// --- INICIALIZACIÓN DE LA VISTA ---
updateBadge();
renderOrders("TODOS"); 