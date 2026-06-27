import { fetchUsuarios } from "../../../utils/data";
import { navigate } from "../../../utils/navigate";
import type { IUser } from "../../../types/IUser";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email") as HTMLInputElement;
const passInput = document.getElementById("password") as HTMLInputElement;
const btnRegister = document.getElementById("btn-register") as HTMLButtonElement; // Nuevo botón

// --- LÓGICA DE LOGIN ---
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const usuarios: IUser[] = await fetchUsuarios();
            // Buscamos coincidencia estricta (case sensitive en password)
            const usuarioValido = usuarios.find((u: IUser) => 
                u.mail === emailInput.value && u.password === passInput.value
            );

            if (usuarioValido) {
                localStorage.setItem("user", JSON.stringify(usuarioValido));
                
                // Redirección inteligente según ROL
                if (usuarioValido.rol === "ADMIN") {
                    navigate("/src/pages/admin/adminHome/adminHome.html");
                } else {
                    navigate("/src/pages/store/home/home.html");
                }
            } else {
                alert("Credenciales incorrectas. Verifica tu email o contraseña.");
            }
        } catch (error) {
            alert("Error al conectar con la base de datos local.");
            console.error(error);
        }
    });
}

// --- LÓGICA DEL BOTÓN REGISTRO ---
if (btnRegister) {
    btnRegister.addEventListener("click", () => {
        // Como no está exigido en la rúbrica, podemos poner una alerta
        alert("La funcionalidad de registro estará disponible próximamente.");
        
        // Si más adelante creas la pantalla de registro, descomenta esta línea:
        // navigate("/src/pages/auth/register/register.html");
    });
}