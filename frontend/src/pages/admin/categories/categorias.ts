import { fetchCategorias } from "../../../utils/data";
import { getAdminData, saveAdminData } from "../../../utils/storage";
import { checkAuthUser } from "../../../utils/auth";

checkAuthUser(["ADMIN"]);

const tbody = document.getElementById("cat-table-body");
const modalCat = document.getElementById("modal-categoria") as HTMLElement;
const formCat = document.getElementById("form-categoria") as HTMLFormElement;
const btnAddCat = document.getElementById("btn-add-category"); // ✅ CORREGIDO: ID correcto

const renderCategorias = async () => {
    if (!tbody) return;
    let cats = getAdminData("categorias");

    if (cats.length === 0) {
        cats = await fetchCategorias();
        saveAdminData("categorias", cats);
    }

    // Filtramos las que no estén eliminadas de forma lógica (soft delete)
    const activas = cats.filter((c: any) => !c.eliminado);

    if (activas.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:20px;'>No hay categorías activas</td></tr>";
        return;
    }

    tbody.innerHTML = activas.map((c: any) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${c.id}</td>
            <td style="padding: 10px;">
                <img src="${c.imagen || 'https://via.placeholder.com/50/cccccc/666666?text=Img'}" 
                     width="50" 
                     style="border-radius: 6px; object-fit: cover; aspect-ratio: 1/1;" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/50/cccccc/666666?text=Img'">
            </td>
            <td style="padding: 10px; font-weight: bold; color: #2c3e50;">${c.nombre || c.denominacion || 'Sin nombre'}</td>
            <td style="padding: 10px; color: #7f8c8d;">${c.descripcion || 'Sin descripción'}</td>
            <td style="padding: 10px;">
                <button class="btn-edit" data-id="${c.id}" style="background:#f1c40f; border:none; padding:6px 12px; cursor:pointer; border-radius:4px; font-weight:bold; margin-right: 5px;">Editar</button>
                <button class="btn-delete" data-id="${c.id}" style="background:#e74c3c; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:4px; font-weight:bold;">Eliminar</button>
            </td>
        </tr>
    `).join("");
};

// --- ALTA / EDICIÓN ---
btnAddCat?.addEventListener("click", () => {
    formCat.reset();
    (document.getElementById("c-id-edit") as HTMLInputElement).value = "";
    modalCat.style.display = "flex";
});

formCat?.addEventListener("submit", (e) => {
    e.preventDefault();
    const idEdit = (document.getElementById("c-id-edit") as HTMLInputElement).value;
    const nombre = (document.getElementById("c-nombre") as HTMLInputElement).value;
    const descripcion = (document.getElementById("c-desc") as HTMLInputElement).value; // ✅ CORREGIDO: Se busca 'c-desc'
    const imagen = (document.getElementById("c-imagen") as HTMLInputElement).value;

    let cats = getAdminData("categorias");

    if (idEdit) {
        const index = cats.findIndex((c: any) => String(c.id) === String(idEdit));
        if (index > -1) {
            cats[index] = { ...cats[index], nombre, denominacion: nombre, descripcion, imagen };
        }
    } else {
        cats.push({ id: Date.now(), nombre, denominacion: nombre, descripcion, imagen, eliminado: false });
    }

    saveAdminData("categorias", cats);
    modalCat.style.display = "none";
    renderCategorias();
});

// --- ELIMINAR / CARGAR PARA EDICIÓN ---
tbody?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const btnDelete = target.closest(".btn-delete");
    const btnEdit = target.closest(".btn-edit");

    let cats = getAdminData("categorias");

    if (btnDelete) {
        const id = btnDelete.getAttribute("data-id");
        if (confirm("⚠️ ¿Estás totalmente seguro de que deseas eliminar esta categoría?")) {
            const index = cats.findIndex((c: any) => String(c.id) === String(id));
            if (index > -1) {
                cats[index].eliminado = true; // Soft delete
                saveAdminData("categorias", cats);
                renderCategorias();
            }
        }
    } else if (btnEdit) {
        const id = btnEdit.getAttribute("data-id");
        const cat = cats.find((c: any) => String(c.id) === String(id));
        if (cat) {
            (document.getElementById("c-nombre") as HTMLInputElement).value = cat.nombre || cat.denominacion;
            (document.getElementById("c-desc") as HTMLInputElement).value = cat.descripcion || ""; // ✅ CORREGIDO: Carga datos previos
            (document.getElementById("c-imagen") as HTMLInputElement).value = cat.imagen || "";
            (document.getElementById("c-id-edit") as HTMLInputElement).value = cat.id.toString();
            modalCat.style.display = "flex";
        }
    }
});

// --- LOGOUT ---
document.getElementById("logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "/src/pages/auth/login/login.html";
});

renderCategorias();