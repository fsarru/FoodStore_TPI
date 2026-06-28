import { fetchCategorias } from "../../../utils/data";
import { getAdminData, saveAdminData } from "../../../utils/storage";
import { checkAuthUser } from "../../../utils/auth";

checkAuthUser(["ADMIN"]);

const tbody = document.getElementById("cat-table-body");
const modalCat = document.getElementById("modal-categoria") as HTMLElement;
const formCat = document.getElementById("form-categoria") as HTMLFormElement;
const btnAddCat = document.getElementById("btn-add-cat");

const renderCategorias = async () => {
    if (!tbody) return;
    let cats = getAdminData("categorias");

    if (cats.length === 0) {
        cats = await fetchCategorias();
        saveAdminData("categorias", cats);
    }

    // Filtramos las que no estén eliminadas de forma lógica (soft delete)
    const activas = cats.filter((c: any) => !c.eliminado);

    tbody.innerHTML = activas.map((c: any) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${c.id}</td>
            <td style="padding: 10px;">
                <img src="${c.imagen || 'https://via.placeholder.com/50'}" width="50" style="border-radius: 6px; object-fit: cover; aspect-ratio: 1/1;" onerror="this.src='https://via.placeholder.com/50'">
            </td>
            <td style="padding: 10px; font-weight: 500;">${c.nombre || c.denominacion || 'Sin nombre'}</td>
            <td style="padding: 10px; color: #7f8c8d;">${c.descripcion || 'Sin descripción'}</td>
            <td style="padding: 10px;">
                <button class="btn-edit" data-id="${c.id}">Editar</button>
                <button class="btn-delete" data-id="${c.id}">Eliminar</button>
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
    const descripcion = (document.getElementById("c-descripcion") as HTMLTextAreaElement).value;
    const imagen = (document.getElementById("c-imagen") as HTMLInputElement).value;

    let cats = getAdminData("categorias");

    if (idEdit) {
        const index = cats.findIndex((c: any) => c.id === parseInt(idEdit));
        cats[index] = { ...cats[index], nombre, denominacion: nombre, descripcion, imagen };
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
    const id = parseInt(target.getAttribute("data-id") || "0");
    let cats = getAdminData("categorias");

    if (target.classList.contains("btn-delete")) {
        // CORRECCIÓN: Confirmación obligatoria antes de eliminar
        if (confirm("⚠️ ¿Estás totalmente seguro de que deseas eliminar esta categoría?")) {
            const index = cats.findIndex((c: any) => c.id === id);
            cats[index].eliminado = true; // Soft delete
            saveAdminData("categorias", cats);
            renderCategorias();
        }
    } else if (target.classList.contains("btn-edit")) {
        const cat = cats.find((c: any) => c.id === id);
        if (cat) {
            (document.getElementById("c-nombre") as HTMLInputElement).value = cat.nombre || cat.denominacion;
            (document.getElementById("c-descripcion") as HTMLTextAreaElement).value = cat.descripcion || "";
            (document.getElementById("c-imagen") as HTMLInputElement).value = cat.imagen || "";
            (document.getElementById("c-id-edit") as HTMLInputElement).value = cat.id.toString();
            modalCat.style.display = "flex";
        }
    }
});

renderCategorias();