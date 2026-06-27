import type { IUser } from "../types/IUser";
import type { Rol } from "../types/Rol";
import { navigate } from "./navigate";

export const checkAuthUser = (rolesPermitidos: Rol[]) => {
    const userStr = localStorage.getItem("user");
    
    if (!userStr) {
        navigate("/src/pages/auth/login/login.html");
        return null;
    }

    try {
        const user: IUser = JSON.parse(userStr);
        if (!rolesPermitidos.includes(user.rol)) {
            alert("No tienes permisos para esta vista.");
            localStorage.removeItem("user");
            navigate("/src/pages/auth/login/login.html");
            return null;
        }
        return user; // Devuelve el usuario si todo está OK
    } catch (e) {
        localStorage.removeItem("user");
        navigate("/src/pages/auth/login/login.html");
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem("user");
    navigate("/src/pages/auth/login/login.html");
};