export interface IUser {
    id: number;
    mail: string;
    password: string;
    rol: "ADMIN" | "USUARIO";
}

export interface Product {
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
    imagen: string;
    disponible: boolean;
}

export interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    imagen?: string;
    stock?: number; // <--- AGREGAR ESTA LÍNEA CON EL SIGNO DE INTERROGACIÓN
}