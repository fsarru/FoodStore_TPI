import { fetchCategorias } from "../../../utils/data";
import { getAdminData, saveAdminData } from "../../../utils/storage";
import { checkAuthUser } from "../../../utils/auth";

// Validación de sesión y rol: Solo ADMIN puede acceder
checkAuthUser(["ADMIN"]);

const renderCategorias = async () => {
    const tbody = document.getElementById("cat-table-body");
    if (!tbody) return;

    // 1. LÓGICA DE SEMILLA: Buscar en memoria (localStorage) primero
    let cats = getAdminData("categorias");

    // 2. Si está vacío, traemos los datos del JSON y los guardamos
    if (cats.length === 0) {
        try {
            cats = await fetchCategorias();
            saveAdminData("categorias", cats);
        } catch (error) {
            console.error("Error al cargar las categorías:", error);
            tbody.innerHTML = "<tr><td colspan='4' style='text-align: center;'>Error al cargar categorías</td></tr>";
            return;
        }
    }

    // Validación por si el JSON realmente viene vacío
    if (cats.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align: center; padding: 20px;'>No hay categorías registradas.</td></tr>";
        return;
    }

    // 3. Renderizar la tabla (Rúbrica exige: ID, imagen, nombre y descripción)
    tbody.innerHTML = cats.map((c: any) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${c.id}</td>
            <td style="padding: 10px;">
                <img src="${c.imagen || 'https://via.placeholder.com/50'}" 
                     width="50" 
                     style="border-radius: 6px; object-fit: cover; aspect-ratio: 1/1; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                     onerror="this.src='https://via.placeholder.com/50'">
            </td>
            <td style="padding: 10px; font-weight: 500; color: #2c3e50;">${c.nombre || c.denominacion || 'Sin nombre'}</td>
            <td style="padding: 10px; color: #7f8c8d;">${c.descripcion || 'Sin descripción'}</td>
        </tr>
    `).join("");
};

// Lógica de logout por si tienes el botón en el Navbar del Admin
const logoutBtn = document.getElementById("logoutButton");
logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "/src/pages/auth/login/login.html";
});

renderCategorias();