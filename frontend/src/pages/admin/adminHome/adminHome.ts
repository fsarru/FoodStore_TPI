import { checkAuthUser } from "../../../utils/auth";
import { fetchProductos, fetchCategorias, fetchPedidos } from "../../../utils/data";
import { getAdminData, saveAdminData } from "../../../utils/storage";

// Validación de seguridad
checkAuthUser(["ADMIN"]); 

const estadoMap: { [key: string]: string } = {
    "EN_PREPARACION": "PENDIENTE",
    "ENTREGADO": "TERMINADO",
    "CONFIRMADO": "CONFIRMADO",
    "PENDIENTE": "PENDIENTE",
    "TERMINADO": "TERMINADO"
};

const renderDashboard = async () => {
    // 1. OBTENER DATOS (Priorizando el localStorage para que sea reactivo)
    let productos = getAdminData("productos");
    if (productos.length === 0) {
        productos = await fetchProductos();
        saveAdminData("productos", productos);
    }

    let categorias = getAdminData("categorias");
    if (categorias.length === 0) {
        categorias = await fetchCategorias();
        saveAdminData("categorias", categorias);
    }

    let pedidos = getAdminData("pedidos");
    if (pedidos.length === 0) {
        pedidos = await fetchPedidos();
        saveAdminData("pedidos", pedidos);
    }

    // 2. CÁLCULO DE ESTADÍSTICAS
    const totalProductos = productos.length;
    const totalCategorias = categorias.length;
    const totalPedidos = pedidos.length;

    // Calculamos productos disponibles
    const productosDisponibles = productos.filter((p: any) => p.disponible === true).length;

    // Calculamos pedidos por estado usando el mapa
    const pedidosPendientes = pedidos.filter((p: any) => (estadoMap[p.estado] || p.estado) === "PENDIENTE").length;
    const pedidosConfirmados = pedidos.filter((p: any) => (estadoMap[p.estado] || p.estado) === "CONFIRMADO").length;
    const pedidosTerminados = pedidos.filter((p: any) => (estadoMap[p.estado] || p.estado) === "TERMINADO").length;

    // 3. ACTUALIZAR EL DOM (Con los IDs exactos de tu HTML)
    
    // Tarjetas principales
    const elTotalCat = document.getElementById("stat-cat");
    if (elTotalCat) elTotalCat.innerText = totalCategorias.toString();

    const elTotalProd = document.getElementById("stat-prod");
    if (elTotalProd) elTotalProd.innerText = totalProductos.toString();

    const elTotalPed = document.getElementById("stat-ped");
    if (elTotalPed) elTotalPed.innerText = totalPedidos.toString();

    const elProdDisp = document.getElementById("stat-disp");
    if (elProdDisp) elProdDisp.innerText = productosDisponibles.toString();

    // Panel de Resumen de Pedidos (Inyectamos HTML dinámico con las clases de los badges)
    const summaryContent = document.getElementById("summary-content");
    if (summaryContent) {
        summaryContent.innerHTML = `
            <ul style="list-style: none; padding: 0; font-size: 1.1rem; color: #333;">
                <li style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <strong>📦 Pendientes:</strong> 
                    <span class="badge PENDIENTE" style="font-size: 1rem;">${pedidosPendientes}</span>
                </li>
                <li style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <strong>✅ Confirmados:</strong> 
                    <span class="badge CONFIRMADO" style="font-size: 1rem;">${pedidosConfirmados}</span>
                </li>
                <li style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <strong>🏁 Terminados:</strong> 
                    <span class="badge TERMINADO" style="font-size: 1rem;">${pedidosTerminados}</span>
                </li>
            </ul>
        `;
    }
};

// Carga inicial
renderDashboard();