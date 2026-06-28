import { fetchProductos, fetchCategorias } from "../../../utils/data";
import { getAdminData, saveAdminData } from "../../../utils/storage";


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
                <td>${p.descripcion || 'Sin descripción'}</td>
                <td>$${p.precio}</td>
                <td>${p.stock !== undefined ? p.stock : 0}</td>
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


btnAdd?.addEventListener("click", async () => {
    formProducto.reset();
    (document.getElementById("p-id-edit") as HTMLInputElement).value = "";
    

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


formProducto?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Captura los valores incluyendo Descripción y Stock
    const idEdit = (document.getElementById("p-id-edit") as HTMLInputElement).value;
    const nombre = (document.getElementById("p-nombre") as HTMLInputElement).value;
    const descripcion = (document.getElementById("p-descripcion") as HTMLTextAreaElement).value;
    const precio = parseFloat((document.getElementById("p-precio") as HTMLInputElement).value);
    const stock = parseInt((document.getElementById("p-stock") as HTMLInputElement).value);
    const catId = (document.getElementById("categoria-select") as HTMLSelectElement).value;
    const imagen = (document.getElementById("p-imagen") as HTMLInputElement).value;


    if (precio <= 0) {
        return alert("El precio debe ser estrictamente mayor a 0.");
    }
    if (stock < 0 || isNaN(stock)) {
        return alert("El stock debe ser un número positivo (mayor o igual a 0).");
    }

    let productos = getAdminData("productos");

    if (idEdit) {
        // Editar: actualizamos incluyendo descripcion y stock
        const index = productos.findIndex((p: any) => p.id === parseInt(idEdit));
        productos[index] = { ...productos[index], nombre, descripcion, precio, stock, categoriaId: parseInt(catId), imagen };
    } else {
        // Nuevo: incluimos la propiedad 'descripcion' y 'stock'
        productos.push({ id: Date.now(), nombre, descripcion, precio, stock, categoriaId: parseInt(catId), imagen, disponible: true, eliminado: false });
    }

    saveAdminData("productos", productos);
    modal.style.display = "none";
    renderTable();
});


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
            (document.getElementById("p-descripcion") as HTMLTextAreaElement).value = prod.descripcion || "";
            (document.getElementById("p-precio") as HTMLInputElement).value = prod.precio;
            (document.getElementById("p-stock") as HTMLInputElement).value = prod.stock !== undefined ? prod.stock : 0;
            (document.getElementById("p-imagen") as HTMLInputElement).value = prod.imagen || "";
            (document.getElementById("p-id-edit") as HTMLInputElement).value = prod.id.toString();
            select.value = prod.categoriaId ? prod.categoriaId.toString() : "";
            
            modal.style.display = "flex";
        }
    }
});

// --- INICIALIZACIÓN ---
renderTable();