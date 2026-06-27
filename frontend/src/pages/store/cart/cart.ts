import { checkAuthUser } from "../../../utils/auth";
import { getAdminData, saveAdminData } from "../../../utils/storage";

// Usamos any temporalmente para sortear el problema de tipos si CartItem no tiene 'stock'
type CartItemFallback = any; 

checkAuthUser(["USUARIO", "ADMIN"]);

const cartContainer = document.getElementById("cart-items") as HTMLElement;
const totalElement = document.getElementById("cart-total") as HTMLElement;
const btnCheckout = document.getElementById("btn-checkout") as HTMLButtonElement;
const btnClearCart = document.getElementById("btn-clear-cart") as HTMLButtonElement;

// Elementos del Modal
const checkoutModal = document.getElementById("checkout-modal") as HTMLElement;
const btnCloseCheckout = document.getElementById("btn-close-checkout") as HTMLButtonElement;
const checkoutForm = document.getElementById("checkout-form") as HTMLFormElement;
const chkTotalDisplay = document.getElementById("chk-total-display") as HTMLElement;

const ENVIO = 500;

const updateCartStorage = (carrito: CartItemFallback[]) => {
    localStorage.setItem("cart", JSON.stringify(carrito));
    renderCart();
};

const updateCartBadge = () => {
    const cartBadge = document.getElementById("cart-count"); 
    if (cartBadge) {
        const carrito = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalItems = carrito.reduce((acc: number, item: CartItemFallback) => acc + item.cantidad, 0);
        cartBadge.innerText = totalItems.toString();
    }
};

const renderCart = () => {
    const carrito: CartItemFallback[] = JSON.parse(localStorage.getItem("cart") || "[]");
    updateCartBadge();
    
    if (!cartContainer || !totalElement) return;

    cartContainer.innerHTML = "";

    if (carrito.length === 0) {
        cartContainer.innerHTML = "<p style='text-align: center; padding: 40px; color: #7f8c8d; font-size:1.1rem; grid-column: 1/-1;'>El carrito está vacío.</p>";
        totalElement.innerHTML = "";
        if (btnCheckout) btnCheckout.style.display = "none";
        if (btnClearCart) btnClearCart.style.display = "none";
        return;
    } else {
        if (btnCheckout) btnCheckout.style.display = "block";
        if (btnClearCart) btnClearCart.style.display = "block";
    }

    let subtotalAcumulado = 0;

    carrito.forEach((item, index) => {
        const subtotalItem = item.precio * item.cantidad;
        subtotalAcumulado += subtotalItem;

        const div = document.createElement("div");
        div.className = "cart-item-row"; 

        div.innerHTML = `
            <span style="flex: 2; font-weight: bold; color: #2c3e50; display:flex; align-items:center; gap:10px;">
                <img src="${item.imagen || 'https://via.placeholder.com/40'}" width="40" style="border-radius:4px; object-fit:cover; aspect-ratio:1/1;"> 
                ${item.nombre}
            </span>
            <span style="flex: 1; text-align: center; font-size: 1.1rem; font-weight: bold;">${item.cantidad}</span>
            <span style="flex: 1; text-align: right; color: #7f8c8d;">${item.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
            <span style="flex: 1; text-align: right; font-weight: bold; color: #2c3e50;">${subtotalItem.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
            <div style="flex: 1; text-align: center;">
                <button class="btn-qty btn-dec" data-index="${index}">-</button>
                <button class="btn-qty btn-inc" data-index="${index}" style="background: #3498db; color: white; border: none;">+</button>
            </div>
        `;
        cartContainer.appendChild(div);
    });

    const totalFinal = subtotalAcumulado + ENVIO;

    totalElement.innerHTML = `
        <p style="margin: 0 0 5px 0; color: #555;">Subtotal: <strong>${subtotalAcumulado.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong></p>
        <p style="margin: 0 0 10px 0; color: #555;">Costo de Envío: <strong>${ENVIO.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong></p>
        <h3 style="margin: 0; color: #27ae60; font-size: 1.6rem; border-top: 1px solid #eee; padding-top: 10px;">Total: ${totalFinal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</h3>
    `;
};

// Controles +/-
cartContainer?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const indexStr = target.getAttribute("data-index");
    
    if (indexStr === null) return;
    const index = parseInt(indexStr);
    let carrito: CartItemFallback[] = JSON.parse(localStorage.getItem("cart") || "[]");

    if (target.classList.contains("btn-inc")) {
        const stockActual = carrito[index].stock ?? 10;
        if (carrito[index].cantidad < stockActual) {
            carrito[index].cantidad++;
        } else {
            alert(`No hay más de ${stockActual} unidades en stock.`);
        }
    } else if (target.classList.contains("btn-dec")) {
        carrito[index].cantidad--;
        if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    }
    updateCartStorage(carrito);
});

btnClearCart?.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
        localStorage.removeItem("cart");
        renderCart();
    }
});

// --- LÓGICA DE CHECKOUT (ABRIR MODAL) ---
btnCheckout?.addEventListener("click", () => {
    const carrito: CartItemFallback[] = JSON.parse(localStorage.getItem("cart") || "[]");
    if (carrito.length === 0) return;

    const sessionString = localStorage.getItem("user"); 
    const usuarioActual = sessionString ? JSON.parse(sessionString) : null; 
    
    if (!usuarioActual) {
        alert("Por favor, inicia sesión para completar tu compra.");
        window.location.href = "/src/pages/auth/login/login.html";
        return;
    }

    // Calcular el total para mostrarlo en el modal
    const subtotalPedido = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const totalFinal = subtotalPedido + ENVIO;
    
    if (chkTotalDisplay) chkTotalDisplay.innerText = totalFinal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    
    // Mostrar modal
    if (checkoutModal) checkoutModal.style.display = "flex";
});

// Cerrar modal con la X
btnCloseCheckout?.addEventListener("click", () => {
    if (checkoutModal) checkoutModal.style.display = "none";
});

// --- LÓGICA DE CONFIRMACIÓN (SUBMIT FORM) ---
checkoutForm?.addEventListener("submit", (e) => {
    e.preventDefault(); // Evita recargar la página

    const carrito: CartItemFallback[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const sessionString = localStorage.getItem("user"); 
    const usuarioActual = sessionString ? JSON.parse(sessionString) : null; 

    if (!usuarioActual || carrito.length === 0) return;

    // Capturar datos del formulario de checkout
    const telefono = (document.getElementById("chk-telefono") as HTMLInputElement).value;
    const direccion = (document.getElementById("chk-direccion") as HTMLInputElement).value;
    const formaPago = (document.getElementById("chk-pago") as HTMLSelectElement).value;
    const notas = (document.getElementById("chk-notas") as HTMLTextAreaElement).value;

    const subtotalPedido = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const totalFinal = subtotalPedido + ENVIO; 

    // Crear el objeto del pedido agregando la información del checkout
    const nuevoPedido = {
        id: Date.now(), 
        fecha: new Date().toISOString().split('T')[0],
        idUsuario: usuarioActual.id,
        total: totalFinal, 
        estado: "PENDIENTE",
        formaPago: formaPago, // Exigido por el backend (EFECTIVO, MERCADOPAGO, etc)
        direccionEnvio: direccion,
        telefonoContacto: telefono,
        notas: notas,
        detalles: carrito.map(item => ({
            idProducto: item.id,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad
        }))
    };

    let pedidosGlobales = getAdminData("pedidos");
    pedidosGlobales.push(nuevoPedido);
    saveAdminData("pedidos", pedidosGlobales);

    alert("¡Pedido confirmado con éxito! Gracias por tu compra.");
    localStorage.removeItem("cart"); // Limpiamos el carrito
    
    if (checkoutModal) checkoutModal.style.display = "none"; // Cerramos el modal
    window.location.href = "/src/pages/client/orders/orders.html"; // Redirigimos
});

// Botón Salir Navbar
document.getElementById("logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "/src/pages/auth/login/login.html";
});

renderCart();