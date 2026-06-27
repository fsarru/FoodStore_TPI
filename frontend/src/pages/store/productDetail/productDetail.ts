import { checkAuthUser } from "../../../utils/auth";
import { fetchProductos } from "../../../utils/data";
import { getAdminData } from "../../../utils/storage";
import type { CartItem } from "../../../types/IUser";

checkAuthUser(["USUARIO", "ADMIN"]);

const contentDiv = document.getElementById("product-detail-content");
const cartBadge = document.getElementById("cart-count");

const updateBadge = () => {
    if (cartBadge) {
        const carrito: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        cartBadge.innerText = totalItems.toString();
    }
};

const renderDetail = async () => {
    const idSeleccionado = localStorage.getItem("productoSeleccionado");
    if (!idSeleccionado || !contentDiv) return;

    // Priorizamos leer de localStorage por si el admin hizo cambios, sino del fetch
    let productos = getAdminData("productos");
    if (productos.length === 0) {
        productos = await fetchProductos();
    }

    const producto = productos.find((p: any) => String(p.id) === idSeleccionado);

    if (!producto) {
        contentDiv.innerHTML = "<p style='grid-column: span 2; text-align:center;'>Producto no encontrado.</p>";
        return;
    }

    // Validación de stock de la rúbrica (Asumimos stock 10 si tu JSON aún no tiene la propiedad 'stock')
    const stockReal = producto.stock !== undefined ? producto.stock : 10;
    const disponible = producto.disponible !== false && stockReal > 0;

    contentDiv.innerHTML = `
        <img src="${producto.imagen || 'https://via.placeholder.com/400'}" alt="${producto.nombre}" class="detail-img">
        <div class="detail-info">
            <a href="/src/pages/store/home/home.html" class="btn-back">⬅ Volver al Catálogo</a>
            <h1 style="color: #2c3e50; font-size: 2.5rem; margin: 0 0 10px 0;">${producto.nombre}</h1>
            <p style="font-size: 1.1rem; color: #7f8c8d; line-height: 1.6; margin-bottom: 20px;">${producto.descripcion || 'Este es un producto delicioso de FoodStore, preparado con los mejores ingredientes.'}</p>
            
            <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px 0;">
                <p style="font-size: 2.2rem; color: #e67e22; font-weight: bold; margin: 0;">${producto.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
                <p style="color: ${disponible ? '#27ae60' : '#e74c3c'}; font-weight: bold; margin-top: 10px; font-size: 1.1rem;">
                    ● ${disponible ? 'Disponible' : 'Agotado'} <span style="color:#7f8c8d; font-weight: normal; font-size: 0.9rem;">(Stock: ${stockReal})</span>
                </p>
            </div>

            <div class="qty-selector">
                <label style="font-weight: bold; color: #555;">Cantidad:</label>
                <input type="number" id="pd-qty" class="qty-input" value="1" min="1" max="${stockReal}" ${!disponible ? 'disabled' : ''}>
            </div>

            <button id="btn-add-detail" class="btn-add" ${!disponible ? 'disabled' : ''}>
                ${disponible ? '🛒 Agregar al Carrito' : 'Sin Stock'}
            </button>
        </div>
    `;

    // Validación estricta para que no tipeen un número mayor al stock
    const qtyInput = document.getElementById("pd-qty") as HTMLInputElement;
    qtyInput?.addEventListener("input", (e) => {
        let val = parseInt((e.target as HTMLInputElement).value);
        if (val > stockReal) qtyInput.value = stockReal.toString();
        if (val < 1) qtyInput.value = "1";
    });

    // Acción de agregar al carrito
    document.getElementById("btn-add-detail")?.addEventListener("click", () => {
        const cantidad = parseInt(qtyInput.value);
        let carrito: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
        
        const itemIndex = carrito.findIndex(item => item.id === producto.id);
        if (itemIndex > -1) {
            if (carrito[itemIndex].cantidad + cantidad > stockReal) {
                alert(`Solo puedes llevar hasta ${stockReal} unidades en total.`);
                return;
            }
            carrito[itemIndex].cantidad += cantidad;
        } else {
            carrito.push({ ...producto, cantidad });
        }

        localStorage.setItem("cart", JSON.stringify(carrito));
        updateBadge();
        alert("✅ ¡Producto agregado al carrito exitosamente!");
    });
};

document.getElementById("logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "/src/pages/auth/login/login.html";
});

updateBadge();
renderDetail();