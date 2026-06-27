import { fetchProductos, fetchCategorias } from "../../../utils/data";
import { getAdminData, saveAdminData } from "../../../utils/storage";

// --- REFERENCIAS AL DOM ---
const tableBody = document.getElementById("product-table-body") as HTMLElement;
const modal = document.getElementById("modal-producto") as HTMLElement;
const formProducto = document.getElementById("form-producto") as HTMLFormElement;
const btnAdd = document.getElementById("btn-add-product");

// --- FUNCIÓN RENDERIZAR TABLA (CRUD) ---
const renderTable = async () => {
    // 1. Obtener productos
    let prods = getAdminData("productos");
    if (prods.length === 0) {
        prods = await fetchProductos();
        saveAdminData("productos", prods);
    }

    // 2. Obtener categorías
    let cats = getAdminData("categorias");
    if (cats.length === 0) {
        cats = await fetchCategorias();
        saveAdminData("categorias", cats);
    }
    
    if (!tableBody) return;

    tableBody.innerHTML = prods.map((p: any) => {
        const idCat = p.categoriaId || p.idCategoria || (p.categoria ? p.categoria.id : null);
        const cat = cats.find((c: any) => c.id === idCat);
        
        return `
            <tr>
                <td>${p.id}</td>
                <td><img src="${p.imagen}" width="50" onerror="this.src='placeholder.jpg'"></td>
                <td>${p.nombre}</td>
                <td>$${p.precio}</td>
                <td>${cat ? cat.nombre || cat.denominacion : 'Sin categoría'}</td>
                <td>${p.disponible ? '✅' : '❌'}</td>
                <td>
                    <button class="btn-edit" data-id="${p.id}">Editar</button>
                    <button class="btn-delete" data-id="${p.id}">Eliminar</button>
                </td>
            </tr>
        `;
    }).join("");
};

// --- EVENTO APERTURA MODAL (NUEVO PRODUCTO) ---
btnAdd?.addEventListener("click", async () => {
    formProducto.reset();
    (document.getElementById("p-id-edit") as HTMLInputElement).value = "";
    
    // 1. Obtener categorías (forzar carga desde JSON si está vacío)
    let cats = getAdminData("categorias");
    if (cats.length === 0) {
        cats = await fetchCategorias();
        saveAdminData("categorias", cats);
    }
    
    // 2. Inyectar en el select
    const select = document.getElementById("categoria-select") as HTMLSelectElement;
    
    if (cats.length > 0) {
        select.innerHTML = cats.map((c: any) => 
            `<option value="${c.id}">${c.denominacion || c.nombre}</option>`
        ).join("");
    } else {
        select.innerHTML = '<option>No hay categorías disponibles</option>';
    }
    
    modal.style.display = "flex";
});

// --- EVENTO GUARDAR (ALTA/EDICIÓN) ---
formProducto?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Captura los valores
    const idEdit = (document.getElementById("p-id-edit") as HTMLInputElement).value;
    const nombre = (document.getElementById("p-nombre") as HTMLInputElement).value;
    const precio = parseFloat((document.getElementById("p-precio") as HTMLInputElement).value);
    const catId = (document.getElementById("categoria-select") as HTMLSelectElement).value;
    const imagen = (document.getElementById("p-imagen") as HTMLInputElement).value; // <-- CAPTURA LA URL

    let productos = getAdminData("productos");

    if (idEdit) {
        // Editar: actualizamos incluyendo la nueva imagen
        const index = productos.findIndex((p: any) => p.id === parseInt(idEdit));
        productos[index] = { ...productos[index], nombre, precio, categoriaId: parseInt(catId), imagen };
    } else {
        // Nuevo: incluimos la propiedad 'imagen'
        productos.push({ id: Date.now(), nombre, precio, categoriaId: parseInt(catId), imagen, disponible: true, eliminado: false });
    }

    saveAdminData("productos", productos);
    modal.style.display = "none";
    renderTable();
});

// --- EVENTOS DE LA TABLA (ELIMINAR/EDITAR) ---
tableBody?.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    const id = parseInt(target.getAttribute("data-id") || "0");

    if (target.classList.contains("btn-delete")) {
        if (confirm("¿Estás seguro de eliminar este producto?")) {
            let productos = getAdminData("productos");
            // Soft delete
            const index = productos.findIndex((p: any) => p.id === id);
            if (index > -1) {
                productos[index].eliminado = true;
                productos[index].disponible = false;
            }
            saveAdminData("productos", productos);
            renderTable();
        }
    } else if (target.classList.contains("btn-edit")) {
        const productos = getAdminData("productos");
        const prod = productos.find((p: any) => p.id === id);
        if (prod) {
            let cats = getAdminData("categorias");
            if (cats.length === 0) {
                cats = await fetchCategorias();
                saveAdminData("categorias", cats);
            }
            const select = document.getElementById("categoria-select") as HTMLSelectElement;
            select.innerHTML = cats.map((c: any) => 
                `<option value="${c.id}">${c.denominacion || c.nombre}</option>`
            ).join("");
            (document.getElementById("p-nombre") as HTMLInputElement).value = prod.nombre;
            (document.getElementById("p-precio") as HTMLInputElement).value = prod.precio;
            (document.getElementById("p-imagen") as HTMLInputElement).value = prod.imagen || ""; // <-- CARGA LA URL
            (document.getElementById("p-id-edit") as HTMLInputElement).value = prod.id.toString();
            select.value = prod.categoriaId ? prod.categoriaId.toString() : "";
            modal.style.display = "flex";
        }
    }
});

// --- INICIALIZACIÓN ---
renderTable();