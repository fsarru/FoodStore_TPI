import { fetchProductos, fetchCategorias } from "../../../utils/data";
import { getAdminData, saveAdminData } from "../../../utils/storage";
import { checkAuthUser } from "../../../utils/auth";

checkAuthUser(["ADMIN"]);

// --- REFERENCIAS AL DOM ---
const tableBody = document.getElementById("product-table-body") as HTMLElement;
const modal = document.getElementById("modal-producto") as HTMLElement;
const formProducto = document.getElementById("form-producto") as HTMLFormElement;
const btnAdd = document.getElementById("btn-add-product");

// --- FUNCIÓN RENDERIZAR TABLA (CRUD) ---
const renderTable = async () => {
    let prods = getAdminData("productos");
    if (prods.length === 0) {
        prods = await fetchProductos();
        saveAdminData("productos", prods);
    }

    let cats = getAdminData("categorias");
    if (cats.length === 0) {
        cats = await fetchCategorias();
        saveAdminData("categorias", cats);
    }
    
    if (!tableBody) return;

    // ✅ FILTRO VISUAL: Ocultar los productos con "eliminado = true"
    const activos = prods.filter((p: any) => !p.eliminado);

    if (activos.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='9' style='text-align:center; padding:20px;'>No hay productos activos</td></tr>";
        return;
    }

    tableBody.innerHTML = activos.map((p: any) => {
        const idCat = p.categoriaId || p.idCategoria || (p.categoria ? p.categoria.id : null);
        const cat = cats.find((c: any) => c.id === idCat);
        
        // ✅ SOLUCIÓN AL CORRIMIENTO: Agregamos <td> para Descripción y Stock
        // ✅ SOLUCIÓN AL PARPADEO: Agregamos this.onerror=null en la imagen
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${p.id}</td>
                <td style="padding: 10px;">
                    <img src="${p.imagen || 'https://via.placeholder.com/50/cccccc/666666?text=Img'}" 
                         width="50" 
                         style="border-radius: 6px; object-fit: cover; aspect-ratio: 1/1;" 
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/50/cccccc/666666?text=Img'">
                </td>
                <td style="padding: 10px; font-weight: bold; color: #2c3e50;">${p.nombre}</td>
                <td style="padding: 10px; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.descripcion || ''}">${p.descripcion || 'Sin descripción'}</td>
                <td style="padding: 10px;">${p.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                <td style="padding: 10px; text-align:center; font-weight:bold;">${p.stock ?? 0}</td>
                <td style="padding: 10px;">${cat ? cat.nombre || cat.denominacion : 'Sin categoría'}</td>
                <td style="padding: 10px;">
                    <span style="background-color: ${p.disponible ? '#2ecc71' : '#e74c3c'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                        ${p.disponible ? 'SÍ' : 'NO'}
                    </span>
                </td>
                <td style="padding: 10px;">
                    <button class="btn-edit" data-id="${p.id}" style="background:#f1c40f; border:none; padding:6px 12px; cursor:pointer; border-radius:4px; font-weight:bold; margin-right: 5px;">Editar</button>
                    <button class="btn-delete" data-id="${p.id}" style="background:#e74c3c; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:4px; font-weight:bold;">Borrar</button>
                </td>
            </tr>
        `;
    }).join("");
};

// --- EVENTO APERTURA MODAL (NUEVO PRODUCTO) ---
btnAdd?.addEventListener("click", async () => {
    formProducto.reset();
    (document.getElementById("p-id-edit") as HTMLInputElement).value = "";
    
    let cats = getAdminData("categorias");
    if (cats.length === 0) {
        cats = await fetchCategorias();
        saveAdminData("categorias", cats);
    }
    
    const select = document.getElementById("categoria-select") as HTMLSelectElement;
    
    if (cats.length > 0) {
        select.innerHTML = cats.map((c: any) => 
            `<option value="${c.id}">${c.denominacion || c.nombre}</option>`
        ).join("");
    } else {
        select.innerHTML = '<option value="">No hay categorías disponibles</option>';
    }
    
    modal.style.display = "flex";
});

// --- EVENTO GUARDAR (ALTA/EDICIÓN) ---
formProducto?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const idEdit = (document.getElementById("p-id-edit") as HTMLInputElement).value;
    const nombre = (document.getElementById("p-nombre") as HTMLInputElement).value;
    const descripcion = (document.getElementById("p-descripcion") as HTMLInputElement).value; // ✅ SOLUCIONADO: Capturamos la descripción
    const precio = parseFloat((document.getElementById("p-precio") as HTMLInputElement).value);
    const stock = parseInt((document.getElementById("p-stock") as HTMLInputElement).value); // ✅ SOLUCIONADO: Capturamos el stock
    const catId = (document.getElementById("categoria-select") as HTMLSelectElement).value;
    const imagen = (document.getElementById("p-imagen") as HTMLInputElement).value; 

    let productos = getAdminData("productos");

    if (idEdit) {
        const index = productos.findIndex((p: any) => String(p.id) === String(idEdit));
        if (index > -1) {
            productos[index] = { ...productos[index], nombre, descripcion, precio, stock, categoriaId: parseInt(catId), imagen };
        }
    } else {
        productos.push({ 
            id: Date.now(), 
            nombre, 
            descripcion,
            precio, 
            stock,
            categoriaId: parseInt(catId), 
            imagen, 
            disponible: true, 
            eliminado: false 
        });
    }

    saveAdminData("productos", productos);
    modal.style.display = "none";
    renderTable();
});

// --- EVENTOS DE LA TABLA (ELIMINAR/EDITAR) ---
tableBody?.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    const btnDelete = target.closest(".btn-delete");
    const btnEdit = target.closest(".btn-edit");

    if (btnDelete) {
        const id = btnDelete.getAttribute("data-id");
        if (confirm("¿Estás seguro de eliminar este producto? (Baja Lógica)")) {
            let productos = getAdminData("productos");
            const index = productos.findIndex((p: any) => String(p.id) === String(id));
            if (index > -1) {
                productos[index].eliminado = true;
                productos[index].disponible = false;
                saveAdminData("productos", productos);
                renderTable();
            }
        }
    } else if (btnEdit) {
        const id = btnEdit.getAttribute("data-id");
        const productos = getAdminData("productos");
        const prod = productos.find((p: any) => String(p.id) === String(id));
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
            (document.getElementById("p-descripcion") as HTMLInputElement).value = prod.descripcion || ""; // ✅ SOLUCIONADO: Carga en edición
            (document.getElementById("p-precio") as HTMLInputElement).value = prod.precio;
            (document.getElementById("p-stock") as HTMLInputElement).value = prod.stock?.toString() || "0"; // ✅ SOLUCIONADO: Carga en edición
            (document.getElementById("p-imagen") as HTMLInputElement).value = prod.imagen || ""; 
            (document.getElementById("p-id-edit") as HTMLInputElement).value = prod.id.toString();
            select.value = prod.categoriaId ? prod.categoriaId.toString() : "";
            
            modal.style.display = "flex";
        }
    }
});

// Logout
document.getElementById("logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "/src/pages/auth/login/login.html";
});

// --- INICIALIZACIÓN ---
renderTable();