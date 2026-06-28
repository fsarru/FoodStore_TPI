import { fetchUsuarios } from "../../../utils/data";
import { navigate } from "../../../utils/navigate";
import type { IUser } from "../../../types/IUser";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email") as HTMLInputElement;
const passInput = document.getElementById("password") as HTMLInputElement;
const btnRegister = document.getElementById("btn-register") as HTMLButtonElement;

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            // Traemos usuarios del JSON y los que se hayan registrado localmente
            const usuariosAPI: IUser[] = await fetchUsuarios();
            const usuariosLocales: IUser[] = JSON.parse(localStorage.getItem("mock_users") || "[]");
            const todosLosUsuarios = [...usuariosAPI, ...usuariosLocales];

            const usuarioValido = todosLosUsuarios.find((u: IUser) => 
                u.mail === emailInput.value && u.password === passInput.value
            );

            if (usuarioValido) {
                // CORRECCIÓN: Guardamos solo los datos seguros, SIN el password
                const safeUser = {
                    id: usuarioValido.id,
                    nombre: usuarioValido.nombre,
                    apellido: usuarioValido.apellido,
                    mail: usuarioValido.mail,
                    rol: usuarioValido.rol
                };
                localStorage.setItem("user", JSON.stringify(safeUser));
                
                if (usuarioValido.rol === "ADMIN") {
                    navigate("/src/pages/admin/adminHome/adminHome.html");
                } else {
                    navigate("/src/pages/store/home/home.html");
                }
            } else {
                alert("Credenciales incorrectas. Verifica tu email o contraseña.");
            }
        } catch (error) {
            alert("Error al conectar con la base de datos.");
            console.error(error);
        }
    });
}

// Redirección real al registro
if (btnRegister) {
    btnRegister.addEventListener("click", () => {
        navigate("/src/pages/auth/register/register.html");
    });
}