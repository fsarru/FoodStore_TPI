import { checkAuthUser } from "../../../utils/auth";
import type { CartItem, Product } from "../../../types/IUser";
import { fetchProductos, fetchCategorias } from "../../../utils/data"; 
import { getAdminData, saveAdminData } from "../../../utils/storage";

checkAuthUser(["USUARIO", "ADMIN"]);

const listaProductos = document.getElementById("lista-productos");
const categoryFilters = document.getElementById("category-filters");
const cartBadge = document.getElementById("cart-count");
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;

let productosGlobales: Product[] = []; 
let currentCategory: number | null = null;
let currentSearchTerm: string = "";
let currentSort: string = "AZ";

const updateBadge = () => {
    if (cartBadge) {
        const carrito: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        cartBadge.innerText = totalItems.toString();
    }
};

// Rúbrica: Función estricta para ir al detalle
(window as any).verDetalle = (id: number) => {
    localStorage.setItem("productoSeleccionado", id.toString());
    window.location.href = "/src/pages/store/productDetail/productDetail.html"; 
};

const renderProductos = () => {
    if (!listaProductos) return;
    listaProductos.innerHTML = "";

    let filtrados = productosGlobales.filter((prod: any) => {
        if (prod.eliminado) return false;

    const prodCatId = prod.idCategoria || prod.categoriaId || (prod.categoria ? prod.categoria.id : null);
    const cumpleCategoria = currentCategory === null || prodCatId === currentCategory;
    const cumpleBusqueda = currentSearchTerm === "" ||
                           prod.nombre.toLowerCase().includes(currentSearchTerm.toLowerCase());
    return cumpleCategoria && cumpleBusqueda;
});

    if (currentSort === "AZ") filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    else if (currentSort === "ZA") filtrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
    else if (currentSort === "ASC") filtrados.sort((a, b) => a.precio - b.precio);
    else if (currentSort === "DESC") filtrados.sort((a, b) => b.precio - a.precio);

    if (filtrados.length === 0) {
        listaProductos.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No se encontraron productos.</p>";
        return;
    }

    // Renderizamos las tarjetas (SIN BOTÓN, TODA LA TARJETA ES UN BOTÓN)
    filtrados.forEach((prod: any) => {
        const div = document.createElement("div");
        div.className = "product-card"; 
        div.onclick = () => (window as any).verDetalle(prod.id); 

        const badgeColor = prod.disponible ? '#2ecc71' : '#e74c3c';
        const badgeText = prod.disponible ? 'Disponible' : 'Sin Stock';

        div.innerHTML = `
            <img src="${prod.imagen || 'https://via.placeholder.com/200'}" alt="${prod.nombre}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
            <div style="flex-grow: 1;">
                <h3 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 1.1rem;">${prod.nombre}</h3>
                <p style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${prod.descripcion || 'Click para ver más detalles'}</p>
            </div>
            <div>
                <span style="background-color: ${badgeColor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; display: inline-block; margin-bottom: 10px;">${badgeText}</span>
                <p style="color: #e67e22; font-weight: bold; font-size: 1.3rem; margin: 0;">
                    ${prod.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                </p>
            </div>
        `;
        listaProductos.appendChild(div);
    });
};

const renderFiltros = (categorias: any[]) => {
    if (!categoryFilters) return;
    categoryFilters.innerHTML = "";
    
    const btnTodos = document.createElement("button");
    btnTodos.style.cssText = "background: #3498db; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; text-align: left; font-weight: bold;";
    btnTodos.innerText = "Todas las categorías";
    btnTodos.onclick = () => { currentCategory = null; renderProductos(); };
    categoryFilters.appendChild(btnTodos);

    categorias.forEach(cat => {
        const btn = document.createElement("button");
        btn.style.cssText = "background: transparent; color: #555; border: 1px solid #ddd; padding: 10px; border-radius: 6px; cursor: pointer; text-align: left; transition: 0.2s;";
        btn.onmouseover = () => btn.style.background = "#f1f1f1";
        btn.onmouseout = () => btn.style.background = "transparent";
        btn.innerText = cat.nombre || cat.denominacion || "Categoría";
        btn.onclick = () => { currentCategory = cat.id; renderProductos(); };
        categoryFilters.appendChild(btn);
    });
};

searchInput?.addEventListener("input", (e) => {
    currentSearchTerm = (e.target as HTMLInputElement).value.trim();
    renderProductos(); 
});

sortSelect?.addEventListener("change", (e) => {
    currentSort = (e.target as HTMLSelectElement).value;
    renderProductos();
});

const cargarDatos = async () => {
    try {
        // 1. Prioridad: localStorage. Si no hay, fetch al JSON.
        let storageProds = getAdminData("productos");
        if (storageProds.length === 0) {
            storageProds = await fetchProductos();
            saveAdminData("productos", storageProds);
        }
        productosGlobales = storageProds; // Nutrimos la variable global para el filtrado

        // 2. Lo mismo para categorías
        let storageCats = getAdminData("categorias");
        if (storageCats.length === 0) {
            storageCats = await fetchCategorias();
            saveAdminData("categorias", storageCats);
        }

        renderFiltros(storageCats);
        renderProductos();
        updateBadge();
    } catch (error) {
        console.error("Error cargando datos:", error);
    }
};

document.getElementById("logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "/src/pages/auth/login/login.html";
});

cargarDatos();