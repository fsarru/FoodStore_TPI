# 🍔 FoodStore - Trabajo Práctico Integrador

**Materia:** Programación 3  
**Alumno:** Franco Sarrú  
**Descripción:** Sistema de e-commerce gastronómico dividido en dos fases de desarrollo. La primera fase consiste en una interfaz web (Frontend) interactiva que simula persistencia en memoria, y la segunda fase es un motor de persistencia (Backend) utilizando Java y JPA/Hibernate con un menú interactivo por consola.

---

## 🚀 Tecnologías Utilizadas

### 💻 Parte 1: Frontend Web
* **Lenguajes:** TypeScript, HTML5, CSS3
* **Entorno y Bundler:** Node.js, Vite
* **Almacenamiento de Estado:** `localStorage` (Simulando una base de datos local en el navegador).
* **Carga de Datos (Seed):** Fetch asíncrono desde archivos estáticos locales (`.json`).

### ⚙️ Parte 2: Backend y Persistencia
* **Lenguaje:** Java 17+
* **Framework ORM:** Hibernate / JPA (Java Persistence API)
* **Gestor de Dependencias:** Gradle
* **Base de Datos:** MySQL / H2 (Configurable a través de `persistence.xml`)
* **Interfaz:** Menú interactivo por Consola de comandos.

---

## 📦 Módulos y Funcionalidades (Frontend)

El Frontend está diseñado como una Single Page Application (SPA) simulada, dividida en flujos según el rol del usuario logueado.

### 1. Autenticación y Roles
* **Login Manual:** Verificación de credenciales (email y contraseña) cruzadas contra los datos del archivo `usuarios.json`.
* **Ruteo por Rol:** Redirección automática al Catálogo (para rol `USUARIO` / `CLIENTE`) o al Dashboard (para rol `ADMIN`).

### 2. Módulo Cliente — Catálogo
* **Catálogo de Productos:** * Carga dinámica de productos y categorías desde archivos locales mediante `fetch()`.
  * Filtros por categoría y buscador en tiempo real por nombre del producto (*client-side*).  
  * Ordenamiento dinámico: por nombre (A-Z, Z-A) y por precio (ascendente, descendente).  
  * Ocultamiento automático de productos con `disponible = false` o `eliminado = true` (Soft delete).
* **Detalle del Producto:** Vista individual con mapeo por ID y validación estricta de stock real antes de permitir la suma de unidades. El botón de agregar se deshabilita si no hay disponibilidad o stock.
* **Carrito de Compras y Checkout:** * Gestión de unidades (+ / -) y eliminación de ítems con persistencia entre sesiones en `localStorage`.  
  * **Costo de Envío Constante:** El costo de envío está definido como una constante fija en el frontend. **El valor del envío es de `$500 ARS` (`ENVIO = 500`)**, el cual se añade al desglose de costos (Subtotal, Envío, Total) reflejándose en el total del pedido generado.  
  * Formulario y modal de checkout para validar datos requeridos de entrega, teléfono, notas opcionales y método de pago antes de confirmar la compra.
* **Mis Pedidos:** Historial de compras filtrado estrictamente por el usuario activo en sesión, ordenados por fecha de más recientes a más antiguos. Cuenta con badges de colores según el estado (PENDIENTE, CONFIRMADO, TERMINADO, CANCELADO) y un modal interactivo con el desglose de productos y costos por cada compra.

### 3. Módulo Administrador (Panel de Control)
* **Dashboard Reactivo:** 4 Tarjetas de estadísticas globales calculated en tiempo real del lado del cliente leyendo el `localStorage`.
* **Gestión de Entidades (CRUD):** Listado, creación y edición de Productos y Categorías. El alta y modificación de productos lee las categorías disponibles desde un select dinámico cargado del archivo correspondiente. La baja lógica (*Soft Delete*) implementa la bandera `eliminado = true`.
* **Gestión de Pedidos Admin:** Tabla maestra global de pedidos con cruce relacional (ID de Usuario -> Nombre real del Cliente extraído de `usuarios.json`). Permite el filtrado por estado y la edición del ciclo de vida del pedido desde un modal de control de estados.

---

## 🛠️ Instrucciones de Instalación y Uso

### Ejecutar el Frontend
1. Abrir una terminal y navegar a la carpeta del frontend.
2. Instalar las dependencias de Node:
   ```bash
   npm install
   ```
3. Levantar el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
4. Ingresar desde el navegador a la URL indicada (generalmente `http://localhost:5173`).

### 🔑 Credenciales de Prueba
La aplicación requiere iniciar sesión. Utilice los siguientes accesos (pre-configurados en `public/data/usuarios.json`):

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@admin.com` | `123456` |
| **Cliente** | `cliente@food.com` | `cliente123` |

*(Si el LocalStorage es borrado, estas credenciales volverán a cargarse automáticamente desde el JSON).*

### Ejecutar el Backend (JPA)
1. Abrir la carpeta `backend` en un IDE compatible con Java (IntelliJ IDEA, Eclipse, VSCode).
2. Revisar el archivo `src/main/resources/META-INF/persistence.xml` y asegurar que la URL, usuario y contraseña de la base de datos coincidan con su entorno local (MySQL o H2).
3. Construir el proyecto y descargar dependencias mediante Gradle.
4. Ejecutar la clase principal `Main.java` y seguir las instrucciones del menú interactivo por consola.

---

## 📹 Demostración y Defensa Técnica

El video explicativo con el flujo de uso completo y la justificación técnica de la arquitectura se encuentra disponible en el siguiente enlace:

👉 **[Ver Video de Presentación y Defensa Técnica](https://youtu.be/R-asmqhpbZU?si=nduErMqKHnBY5E4v)**

---

👉 **[Repositorio público de GitHub](https://github.com/fsarru/FoodStore_TPI)**


---

*Desarrollado para la cátedra de Programación 3.*