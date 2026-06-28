import { fetchUsuarios } from "../../../utils/data";
import { navigate } from "../../../utils/navigate";

document.getElementById("btn-do-register")?.addEventListener("click", async () => {
    const nombre = (document.getElementById("reg-nombre") as HTMLInputElement).value.trim();
    const apellido = (document.getElementById("reg-apellido") as HTMLInputElement).value.trim();
    const email = (document.getElementById("reg-email") as HTMLInputElement).value.trim();
    const password = (document.getElementById("reg-pass") as HTMLInputElement).value.trim();

    // 1. Validar campos vacíos
    if (!nombre || !apellido || !email || !password) {
        return alert("Por favor, complete todos los campos obligatorios.");
    }

    // 2. Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return alert("Por favor, ingrese un formato de correo electrónico válido.");
    }

    // 3. Validar longitud de contraseña
    if (password.length < 6) {
        return alert("La contraseña debe tener al menos 6 caracteres.");
    }

    // 4. Validar duplicados (email único)
    const usuariosAPI = await fetchUsuarios();
    const usuariosLocales = JSON.parse(localStorage.getItem("mock_users") || "[]");
    const todosLosUsuarios = [...usuariosAPI, ...usuariosLocales];

    if (todosLosUsuarios.find(u => u.mail === email)) {
        return alert("El correo electrónico ya se encuentra registrado.");
    }

    // 5. Guardar el nuevo usuario en localStorage (Simulación de DB)
    const newUser = {
        id: Date.now(),
        nombre,
        apellido,
        mail: email,
        password, // En un entorno real se enviaría hasheada, aquí es mock
        rol: "USUARIO"
    };

    usuariosLocales.push(newUser);
    localStorage.setItem("mock_users", JSON.stringify(usuariosLocales));

    alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
    navigate("/src/pages/auth/login/login.html");
});