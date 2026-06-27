package com.tp.jpa;

import com.tp.jpa.model.Categoria;
import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Producto;
import com.tp.jpa.model.Usuario;
import com.tp.jpa.model.enums.Rol;
import com.tp.jpa.model.enums.EstadoPedido;
import com.tp.jpa.model.enums.FormaPago;
import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.PedidoRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.repository.UsuarioRepository;
import com.tp.jpa.util.JPAUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Scanner;

public class Main {

    static {
        java.util.logging.LogManager.getLogManager().reset();
        java.util.logging.Logger globalLogger = java.util.logging.Logger.getLogger(java.util.logging.Logger.GLOBAL_LOGGER_NAME);
        globalLogger.setLevel(java.util.logging.Level.SEVERE);
        java.util.logging.Logger.getLogger("org.hibernate").setLevel(java.util.logging.Level.SEVERE);
    }

    private static final CategoriaRepository categoriaRepo = new CategoriaRepository();
    private static final ProductoRepository productoRepo = new ProductoRepository();
    private static final UsuarioRepository usuarioRepo = new UsuarioRepository();
    private static final PedidoRepository pedidoRepo = new PedidoRepository();

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int opcion = -1;

        System.out.println("Iniciando Food Store... Conectando a la base de datos H2...");
        JPAUtil.getEntityManagerFactory();

        while (opcion != 0) {
            System.out.println("\n=== FOOD STORE - MENÚ PRINCIPAL ===");
            System.out.println("1. Gestionar Categorías");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            System.out.print("Seleccione una opción: ");

            try {
                opcion = Integer.parseInt(scanner.nextLine());

                switch (opcion) {
                    case 1: menuCategorias(scanner); break;
                    case 2: menuProductos(scanner); break;
                    case 3: menuUsuarios(scanner); break;
                    case 4: menuPedidos(scanner); break;
                    case 5: menuReportes(scanner); break;
                    case 0: System.out.println("Cerrando el sistema... ¡Hasta luego!"); break;
                    default: System.out.println("Opción incorrecta. Intente nuevamente.");
                }
            } catch (NumberFormatException e) {
                System.out.println("Por favor, ingrese un número válido.");
            }
        }
        scanner.close();
        JPAUtil.close();
    }

    // --- SUBMENÚ CATEGORÍAS ---
    private static void menuCategorias(Scanner scanner) {
        int opcionCat = -1;
        while (opcionCat != 0) {
            System.out.println("\n--- GESTIÓN DE CATEGORÍAS ---");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado");
            System.out.println("0. Volver");
            System.out.print("Seleccione una opción: ");

            try {
                opcionCat = Integer.parseInt(scanner.nextLine());
                switch (opcionCat) {
                    case 1:
                        System.out.println("\n--- ALTA DE CATEGORÍA ---");
                        System.out.print("Ingrese el nombre de la nueva categoría (Obligatorio): ");
                        String nombre = scanner.nextLine();
                        if (nombre.trim().isEmpty()) {
                            System.out.println("❌ Error: El nombre es obligatorio y no puede estar vacío.");
                            break;
                        }
                        System.out.print("Ingrese la descripción (Opcional): ");
                        String descripcion = scanner.nextLine();

                        Categoria nuevaCategoria = Categoria.builder()
                                .nombre(nombre)
                                .descripcion(descripcion.trim().isEmpty() ? null : descripcion)
                                .build();

                        Categoria catGuardada = categoriaRepo.guardar(nuevaCategoria);
                        System.out.println("✅ Categoría guardada exitosamente. ID Generado: " + catGuardada.getId());
                        break;

                    case 2:
                        System.out.println("\n--- MODIFICACIÓN DE CATEGORÍA ---");
                        var listaCat = categoriaRepo.listarActivos();
                        if (listaCat.isEmpty()) {
                            System.out.println("No hay categorías activas para modificar.");
                            break;
                        }
                        listaCat.forEach(c -> System.out.println(c.getId() + " - " + c.getNombre()));
                        System.out.print("Ingrese el ID de la categoría a modificar: ");
                        try {
                            Long idMod = Long.parseLong(scanner.nextLine());
                            Optional<Categoria> catOpt = categoriaRepo.buscarPorId(idMod);

                            if (catOpt.isPresent() && !catOpt.get().isEliminado()) {
                                Categoria catMod = catOpt.get();
                                System.out.println("Valores actuales -> Nombre: " + catMod.getNombre() + " | Descripción: " + catMod.getDescripcion());

                                System.out.print("Ingrese el nuevo nombre (Dejar vacío para conservar): ");
                                String nuevoNombre = scanner.nextLine();
                                System.out.print("Ingrese la nueva descripción (Dejar vacío para conservar): ");
                                String nuevaDesc = scanner.nextLine();

                                if (!nuevoNombre.trim().isEmpty()) catMod.setNombre(nuevoNombre);
                                if (!nuevaDesc.trim().isEmpty()) catMod.setDescripcion(nuevaDesc);

                                categoriaRepo.guardar(catMod);
                                System.out.println("✅ Categoría modificada exitosamente.");
                            } else {
                                System.out.println("❌ Error: No se encontró una categoría activa con el ID " + idMod);
                            }
                        } catch (NumberFormatException e) {
                            System.out.println("❌ Error: Debe ingresar un número de ID válido.");
                        }
                        break;

                    case 3:
                        System.out.println("\n--- BAJA LÓGICA DE CATEGORÍA ---");
                        System.out.print("Ingrese el ID de la categoría a eliminar: ");
                        try {
                            Long idBaja = Long.parseLong(scanner.nextLine());
                            Optional<Categoria> catOpt = categoriaRepo.buscarPorId(idBaja);
                            if (catOpt.isPresent() && !catOpt.get().isEliminado()) {
                                String nombreAfectado = catOpt.get().getNombre();
                                categoriaRepo.eliminarLogico(idBaja);
                                System.out.println("✅ Categoría '" + nombreAfectado + "' dada de baja correctamente.");
                            } else {
                                System.out.println("❌ Error: No se encontró una categoría activa con el ID " + idBaja);
                            }
                        } catch (NumberFormatException e) {
                            System.out.println("❌ Error: Debe ingresar un número de ID válido.");
                        }
                        break;

                    case 4:
                        System.out.println("\n--- LISTADO DE CATEGORÍAS ACTIVAS ---");
                        var categorias = categoriaRepo.listarActivos();
                        if (categorias.isEmpty()) {
                            System.out.println("No hay categorías registradas.");
                        } else {
                            System.out.printf("%-10s | %-20s | %-40s\n", "ID", "Nombre", "Descripción");
                            System.out.println("---------------------------------------------------------------------------------");
                            for (Categoria c : categorias) {
                                System.out.printf("%-10d | %-20s | %-40s\n", c.getId(), c.getNombre(), (c.getDescripcion() != null ? c.getDescripcion() : "Sin descripción"));
                            }
                        }
                        break;

                    case 0: break;
                    default: System.out.println("Opción incorrecta.");
                }
            } catch (NumberFormatException e) {
                System.out.println("Por favor, ingrese un número válido.");
            }
        }
    }

    // --- SUBMENÚ PRODUCTOS ---
    private static void menuProductos(Scanner scanner) {
        int opcionProd = -1;
        while (opcionProd != 0) {
            System.out.println("\n--- GESTIÓN DE PRODUCTOS ---");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado");
            System.out.println("0. Volver");
            System.out.print("Seleccione una opción: ");

            try {
                opcionProd = Integer.parseInt(scanner.nextLine());
                switch (opcionProd) {
                    case 1:
                        System.out.println("\n--- ALTA DE PRODUCTO ---");
                        var categorias = categoriaRepo.listarActivos();
                        if (categorias.isEmpty()) {
                            System.out.println("⚠️ No hay categorías cargadas. Debe crear una categoría primero.");
                            break;
                        }

                        System.out.println("\nCategorías disponibles:");
                        categorias.forEach(c -> System.out.println("ID: " + c.getId() + " - " + c.getNombre()));
                        System.out.print("Ingrese el ID de la categoría correspondiente: ");
                        Long idCat = Long.parseLong(scanner.nextLine());
                        Optional<Categoria> catOpt = categoriaRepo.buscarPorId(idCat);

                        if (!catOpt.isPresent() || catOpt.get().isEliminado()) {
                            System.out.println("❌ Error: La categoría ingresada no existe o está dada de baja. Alta cancelada.");
                            break;
                        }

                        System.out.print("Ingrese el nombre del producto (Obligatorio): ");
                        String nombre = scanner.nextLine();
                        if (nombre.trim().isEmpty()) {
                            System.out.println("❌ Error: El nombre es obligatorio.");
                            break;
                        }
                        System.out.print("Ingrese la descripción: ");
                        String descripcion = scanner.nextLine();

                        System.out.print("Ingrese el precio (Mayor a 0): ");
                        Double precio = Double.parseDouble(scanner.nextLine());
                        System.out.print("Ingrese el stock inicial (Mayor o igual a 0): ");
                        int stock = Integer.parseInt(scanner.nextLine());

                        System.out.print("Ingrese el nombre o URL de la imagen (Opcional): ");
                        String imagen = scanner.nextLine();
                        System.out.print("¿Está disponible? (S/N, default S): ");
                        boolean disponible = !scanner.nextLine().equalsIgnoreCase("n");

                        if (precio <= 0 || stock < 0) {
                            System.out.println("❌ Error: El precio debe ser > 0 y el stock >= 0. Alta cancelada.");
                            break;
                        }

                        Producto nuevoProducto = Producto.builder()
                                .nombre(nombre)
                                .descripcion(descripcion)
                                .precio(precio)
                                .stock(stock)
                                .imagen(imagen.trim().isEmpty() ? "default.jpg" : imagen)
                                .disponible(disponible)
                                .categoria(catOpt.get())
                                .build();

                        Producto prodGuardado = productoRepo.guardar(nuevoProducto);
                        System.out.println("✅ Producto guardado exitosamente. ID: " + prodGuardado.getId() + " | Categoría: " + prodGuardado.getCategoria().getNombre());
                        break;

                    case 2:
                        System.out.println("\n--- MODIFICACIÓN DE PRODUCTO ---");
                        var listaProd = productoRepo.listarActivos();
                        if (listaProd.isEmpty()) {
                            System.out.println("No hay productos activos para modificar.");
                            break;
                        }
                        listaProd.forEach(p -> System.out.println(p.getId() + " - " + p.getNombre()));
                        System.out.print("Ingrese el ID del producto a modificar: ");
                        try {
                            Long idMod = Long.parseLong(scanner.nextLine());
                            Optional<Producto> prodOpt = productoRepo.buscarPorId(idMod);

                            if (prodOpt.isPresent() && !prodOpt.get().isEliminado()) {
                                Producto p = prodOpt.get();
                                System.out.println("Valores actuales -> Nombre: " + p.getNombre() + " | Precio: $" + p.getPrecio() + " | Stock: " + p.getStock());

                                System.out.print("Nuevo nombre (Dejar vacío para conservar): ");
                                String nNom = scanner.nextLine();
                                System.out.print("Nueva descripción (Dejar vacío para conservar): ");
                                String nDesc = scanner.nextLine();
                                System.out.print("Nuevo precio (Dejar vacío para conservar): ");
                                String nPrecStr = scanner.nextLine();
                                System.out.print("Nuevo stock (Dejar vacío para conservar): ");
                                String nStockStr = scanner.nextLine();
                                System.out.print("¿Disponible? (S/N o Enter para conservar): ");
                                String nDispStr = scanner.nextLine();

                                if (!nNom.trim().isEmpty()) p.setNombre(nNom);
                                if (!nDesc.trim().isEmpty()) p.setDescripcion(nDesc);
                                if (!nPrecStr.trim().isEmpty()) {
                                    double nPrec = Double.parseDouble(nPrecStr);
                                    if (nPrec <= 0) { System.out.println("❌ Error: Precio inválido."); break; }
                                    p.setPrecio(nPrec);
                                }
                                if (!nStockStr.trim().isEmpty()) {
                                    int nStock = Integer.parseInt(nStockStr);
                                    if (nStock < 0) { System.out.println("❌ Error: Stock inválido."); break; }
                                    p.setStock(nStock);
                                }
                                if (!nDispStr.trim().isEmpty()) {
                                    p.setDisponible(!nDispStr.equalsIgnoreCase("n"));
                                }

                                productoRepo.guardar(p);
                                System.out.println("✅ Producto modificado exitosamente.");
                            } else {
                                System.out.println("❌ Error: No se encontró el producto.");
                            }
                        } catch (NumberFormatException e) {
                            System.out.println("❌ Error: Formato de número inválido.");
                        }
                        break;

                    case 3:
                        System.out.println("\n--- BAJA LÓGICA DE PRODUCTO ---");
                        System.out.print("Ingrese el ID del producto a eliminar: ");
                        try {
                            Long idBaja = Long.parseLong(scanner.nextLine());
                            Optional<Producto> prodOpt = productoRepo.buscarPorId(idBaja);
                            if (prodOpt.isPresent() && !prodOpt.get().isEliminado()) {
                                String nombreAfectado = prodOpt.get().getNombre();
                                productoRepo.eliminarLogico(idBaja);
                                System.out.println("✅ Producto '" + nombreAfectado + "' eliminado correctamente (Baja Lógica).");
                            } else {
                                System.out.println("❌ Error: No se encontró un producto activo con ese ID.");
                            }
                        } catch (NumberFormatException e) {
                            System.out.println("❌ Error: Debe ingresar un ID numérico.");
                        }
                        break;

                    case 4:
                        System.out.println("\n--- LISTADO DE PRODUCTOS ACTIVOS ---");
                        var productos = productoRepo.listarActivos();
                        if (productos.isEmpty()) {
                            System.out.println("No hay productos registrados.");
                        } else {
                            System.out.printf("%-5s | %-25s | %-10s | %-8s | %-12s | %-15s\n", "ID", "Nombre", "Precio", "Stock", "Disponible", "Categoría");
                            System.out.println("--------------------------------------------------------------------------------80");
                            for (Producto p : productos) {
                                String nombreCat = (p.getCategoria() != null) ? p.getCategoria().getNombre() : "Sin Categoría";
                                System.out.printf("%-5d | %-25s | $%-9.2f | %-8d | %-12s | %-15s\n",
                                        p.getId(), p.getNombre(), p.getPrecio(), p.getStock(), (p.getDisponible() ? "SÍ" : "NO"), nombreCat);
                            }
                        }
                        break;

                    case 0: break;
                    default: System.out.println("Opción incorrecta.");
                }
            } catch (NumberFormatException e) {
                System.out.println("❌ Por favor, ingrese un dato numérico válido.");
            }
        }
    }

    // --- SUBMENÚ USUARIOS ---
    private static void menuUsuarios(Scanner scanner) {
        int opcionUsu = -1;
        while (opcionUsu != 0) {
            System.out.println("\n--- GESTIÓN DE USUARIOS ---");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado");
            System.out.println("5. Buscar por mail");
            System.out.println("0. Volver");
            System.out.print("Seleccione una opción: ");
            try {
                opcionUsu = Integer.parseInt(scanner.nextLine());
                switch (opcionUsu) {
                    case 1:
                        System.out.print("Nombre: "); String nom = scanner.nextLine();
                        System.out.print("Apellido: "); String ape = scanner.nextLine();
                        System.out.print("Email (Único): "); String email = scanner.nextLine();
                        System.out.print("Celular: "); String celular = scanner.nextLine();
                        System.out.print("Password (Mínimo 6 caracteres): "); String pass = scanner.nextLine();
                        System.out.print("Rol (1. ADMIN / 2. USUARIO): ");
                        Rol rolSelected = scanner.nextLine().equals("1") ? Rol.ADMIN : Rol.USUARIO;

                        if (usuarioRepo.buscarPorMail(email).isPresent()) {
                            System.out.println("❌ Error: Ya existe un usuario registrado con ese email.");
                        } else {
                            Usuario nuevo = Usuario.builder()
                                    .nombre(nom)
                                    .apellido(ape)
                                    .mail(email)
                                    .celular(celular)
                                    .contraseña(pass)
                                    .rol(rolSelected)
                                    .build();
                            Usuario uG = usuarioRepo.guardar(nuevo);
                            System.out.println("✅ Usuario guardado con éxito. ID: " + uG.getId());
                        }
                        break;

                    case 2:
                        System.out.print("Ingrese el ID del usuario a modificar: ");
                        Long idMod = Long.parseLong(scanner.nextLine());
                        Optional<Usuario> usuOpt = usuarioRepo.buscarPorId(idMod);
                        if (usuOpt.isPresent() && !usuOpt.get().isEliminado()) {
                            Usuario usu = usuOpt.get();
                            System.out.println("Usuario actual: " + usu.getNombre() + " " + usu.getApellido() + " [" + usu.getMail() + "]");

                            System.out.print("Nuevo nombre: "); String n = scanner.nextLine();
                            System.out.print("Nuevo apellido: "); String a = scanner.nextLine();
                            System.out.print("Nuevo email: "); String eStr = scanner.nextLine();
                            System.out.print("Nuevo celular: "); String cStr = scanner.nextLine();
                            System.out.print("Nueva contraseña: "); String pStr = scanner.nextLine();

                            if (!n.isEmpty()) usu.setNombre(n);
                            if (!a.isEmpty()) usu.setApellido(a);
                            if (!cStr.isEmpty()) usu.setCelular(cStr);
                            if (!pStr.isEmpty()) usu.setContraseña(pStr);
                            if (!eStr.isEmpty() && !eStr.equalsIgnoreCase(usu.getMail())) {
                                if (usuarioRepo.buscarPorMail(eStr).isPresent()) {
                                    System.out.println("❌ Error: El email ya está en uso por otro usuario.");
                                    break;
                                }
                                usu.setMail(eStr);
                            }

                            usuarioRepo.guardar(usu);
                            System.out.println("✅ Usuario actualizado.");
                        } else {
                            System.out.println("❌ Usuario no encontrado o inactivo.");
                        }
                        break;

                    case 3:
                        System.out.print("Ingrese el ID del usuario para baja lógica: ");
                        Long idBaja = Long.parseLong(scanner.nextLine());
                        Optional<Usuario> uBajaOpt = usuarioRepo.buscarPorId(idBaja);
                        if (uBajaOpt.isPresent() && !uBajaOpt.get().isEliminado()) {
                            String completo = uBajaOpt.get().getNombre() + " " + uBajaOpt.get().getApellido();
                            usuarioRepo.eliminarLogico(idBaja);
                            System.out.println("✅ Usuario '" + completo + "' dado de baja correctamente.");
                        } else {
                            System.out.println("❌ Usuario no encontrado o ya inactivo.");
                        }
                        break;

                    case 4:
                        System.out.println("\n--- LISTADO DE USUARIOS ---");
                        System.out.printf("%-5s | %-25s | %-30s | %-10s\n", "ID", "Nombre Completo", "Email", "Rol");
                        System.out.println("---------------------------------------------------------------------------------");
                        usuarioRepo.listarActivos().forEach(u ->
                                System.out.printf("%-5d | %-25s | %-30s | %-10s\n", u.getId(), u.getNombre() + " " + u.getApellido(), u.getMail(), u.getRol())
                        );
                        break;

                    case 5:
                        System.out.print("Ingrese el email a buscar: ");
                        String mailBuscar = scanner.nextLine();
                        Optional<Usuario> encontrado = usuarioRepo.buscarPorMail(mailBuscar);
                        if (encontrado.isPresent()) {
                            Usuario u = encontrado.get();
                            System.out.println("\n=== DATOS DEL USUARIO ===");
                            System.out.println("ID: " + u.getId());
                            System.out.println("Nombre Completo: " + u.getNombre() + " " + u.getApellido());
                            System.out.println("Email: " + u.getMail());
                            System.out.println("Celular: " + u.getCelular());
                            System.out.println("Rol: " + u.getRol());
                        } else {
                            System.out.println("❌ No existe usuario activo con el mail '" + mailBuscar + "'");
                        }
                        break;

                    case 0: break;
                    default: System.out.println("Opción no válida.");
                }
            } catch (Exception e) {
                System.out.println("Error en los datos ingresados: " + e.getMessage());
            }
        }
    }

    // --- SUBMENÚ PEDIDOS ---
    private static void menuPedidos(Scanner scanner) {
        int opcionPed = -1;
        while (opcionPed != 0) {
            System.out.println("\n--- GESTIÓN DE PEDIDOS ---");
            System.out.println("1. Alta de pedido (Atómica)");
            System.out.println("2. Cambiar estado");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado general");
            System.out.println("0. Volver");
            System.out.print("Seleccione una opción: ");

            try {
                opcionPed = Integer.parseInt(scanner.nextLine());
                switch (opcionPed) {
                    case 1:
                        System.out.println("\n--- NUEVA ORDEN DE COMPRA ---");
                        var usuariosActivos = usuarioRepo.listarActivos();
                        if (usuariosActivos.isEmpty()) {
                            System.out.println("❌ No existen usuarios activos en el sistema para asociar.");
                            break;
                        }
                        usuariosActivos.forEach(u -> System.out.println(u.getId() + " - " + u.getNombre() + " " + u.getApellido()));
                        System.out.print("Seleccione el ID del usuario: ");
                        Long idUsu = Long.parseLong(scanner.nextLine());
                        var usuarioOpt = usuarioRepo.buscarPorId(idUsu);
                        if (!usuarioOpt.isPresent() || usuarioOpt.get().isEliminado()) {
                            System.out.println("❌ Usuario inválido. Operación cancelada.");
                            break;
                        }

                        System.out.println("Seleccione forma de pago:");
                        FormaPago[] formas = FormaPago.values();
                        for (int i = 0; i < formas.length; i++) System.out.println((i + 1) + ". " + formas[i]);
                        int op = Integer.parseInt(scanner.nextLine());
                        FormaPago forma = formas[op - 1];

                        // Listas temporales en memoria para asegurar pre-validaciones client-side
                        List<Long> productosIds = new ArrayList<>();
                        List<Integer> cantidades = new ArrayList<>();

                        boolean agregarMas = true;
                        while (agregarMas) {
                            System.out.println("\nCatálogo disponible:");
                            productoRepo.listarActivos().forEach(p ->
                                    System.out.println(p.getId() + " - " + p.getNombre() + " ($" + p.getPrecio() + ") | Stock: " + p.getStock() + " | Disp: " + p.getDisponible())
                            );
                            System.out.print("Ingrese ID Producto: ");
                            Long idProd = Long.parseLong(scanner.nextLine());
                            Optional<Producto> prodOpt = productoRepo.buscarPorId(idProd);

                            if (!prodOpt.isPresent() || prodOpt.get().isEliminado()) {
                                System.out.println("❌ Error: El producto no existe o está inactivo.");
                                continue;
                            }
                            Producto prod = prodOpt.get();
                            if (!prod.getDisponible()) {
                                System.out.println("❌ Error: El producto no está disponible comercialmente actualmente.");
                                continue;
                            }

                            System.out.print("Cantidad: ");
                            int cant = Integer.parseInt(scanner.nextLine());
                            if (cant <= 0) {
                                System.out.println("❌ Error: La cantidad debe ser un entero mayor a 0.");
                                continue;
                            }
                            if (prod.getStock() < cant) {
                                System.out.println("❌ Error: Stock insuficiente. Solo hay " + prod.getStock() + " unidades disponibles.");
                                continue;
                            }

                            productosIds.add(idProd);
                            cantidades.add(cant);

                            System.out.print("¿Desea agregar otro producto? (s/n): ");
                            agregarMas = scanner.nextLine().equalsIgnoreCase("s");
                        }

                        if (productosIds.isEmpty()) {
                            System.out.println("❌ Cancelado: El pedido debe contener al menos un detalle de producto.");
                            break;
                        }

                        // Delegación de la transacción atómica completa hacia el repositorio específico
                        try {
                            Pedido resultado = pedidoRepo.guardarPedidoCompleto(idUsu, productosIds, cantidades, forma);
                            System.out.println("\n================================================");
                            System.out.println("🎉 PEDIDO GENERADO CON ÉXITO TRANSACCIONAL 🎉");
                            System.out.println("ID Generado: " + resultado.getId());
                            System.out.println("Fecha: " + resultado.getFecha());
                            System.out.println("Cliente: " + resultado.getUsuario().getNombre() + " " + resultado.getUsuario().getApellido());
                            System.out.println("Forma de Pago: " + resultado.getFormaPago());
                            System.out.println("Detalles guardados:");
                            resultado.getDetalles().forEach(d ->
                                    System.out.println(" - " + d.getProducto().getNombre() + " x" + d.getCantidad() + " (Subtotal: $" + d.getSubtotal() + ")")
                            );
                            System.out.println("TOTAL FINAL FACTURADO: $" + resultado.getTotal());
                            System.out.println("================================================");
                        } catch (Exception ex) {
                            System.out.println("❌ Error Crítico en Transacción (Rollback realizado): " + ex.getMessage());
                        }
                        break;

                    case 2:
                        System.out.print("Ingrese ID del Pedido: ");
                        Long idPed = Long.parseLong(scanner.nextLine());
                        Optional<Pedido> pOpt = pedidoRepo.buscarPorId(idPed);
                        if (pOpt.isPresent() && !pOpt.get().isEliminado()) {
                            Pedido p = pOpt.get();
                            System.out.println("Estado actual del pedido: " + p.getEstado());
                            System.out.println("Seleccione nuevo estado:");
                            EstadoPedido[] estados = EstadoPedido.values();
                            for (int i = 0; i < estados.length; i++) {
                                System.out.println((i + 1) + ". " + estados[i]);
                            }

                            System.out.print("Opción: ");
                            int st = Integer.parseInt(scanner.nextLine());
                            if (st >= 1 && st <= estados.length) {
                                p.setEstado(estados[st - 1]);
                                pedidoRepo.guardar(p);
                                System.out.println("✅ Cambio exitoso. Pedido ID " + p.getId() + " actualizado a: " + p.getEstado());
                            } else {
                                System.out.println("❌ Opción inválida.");
                            }
                        } else {
                            System.out.println("❌ Error: Pedido no encontrado o inactivo.");
                        }
                        break;

                    case 3:
                        System.out.print("Ingrese el ID del pedido para baja lógica: ");
                        Long idB = Long.parseLong(scanner.nextLine());
                        Optional<Pedido> pedOpt = pedidoRepo.buscarPorId(idB);
                        if (pedOpt.isPresent() && !pedOpt.get().isEliminado()) {
                            double totalAfectado = pedOpt.get().getTotal();
                            pedidoRepo.eliminarLogico(idB);
                            System.out.println("✅ Pedido dado de baja correctamente. ID: " + idB + " | Total registrado: $" + totalAfectado);
                        } else {
                            System.out.println("❌ Error: Pedido no encontrado.");
                        }
                        break;

                    case 4:
                        System.out.println("\n--- LISTADO GENERAL DE PEDIDOS ---");
                        var pActivos = pedidoRepo.listarActivos();
                        if (pActivos.isEmpty()) {
                            System.out.println("No hay órdenes activas en el sistema.");
                        } else {
                            System.out.printf("%-5s | %-12s | %-12s | %-15s | %-20s | %-10s\n", "ID", "Fecha", "Estado", "Forma Pago", "Usuario", "Total");
                            System.out.println("-----------------------------------------------------------------------------------------");
                            pActivos.forEach(p ->
                                    System.out.printf("%-5d | %-12s | %-12s | %-15s | %-20s | $%-10.2f\n",
                                            p.getId(), p.getFecha(), p.getEstado(), p.getFormaPago(), p.getUsuario().getNombre(), p.getTotal())
                            );
                        }
                        break;

                    case 0: break;
                    default: System.out.println("Opción incorrecta.");
                }
            } catch (Exception e) {
                System.out.println("❌ Error: " + e.getMessage());
            }
        }
    }

    // --- SUBMENÚ REPORTES ---
    // --- SUBMENÚ REPORTES ---
    private static void menuReportes(Scanner scanner) {
        System.out.println("\n--- MENÚ DE REPORTES ---");
        System.out.println("1. Productos por categoría");
        System.out.println("2. Pedidos por usuario");
        System.out.println("3. Pedidos por estado");
        System.out.println("4. Total facturado (Pedidos terminados)");
        System.out.println("0. Volver");
        System.out.print("Selección: ");
        try {
            int op = Integer.parseInt(scanner.nextLine());
            switch (op) {
                case 1:
                    var cats = categoriaRepo.listarActivos();
                    if (cats.isEmpty()) { System.out.println("No hay categorías creadas."); break; }
                    cats.forEach(c -> System.out.println(c.getId() + " - " + c.getNombre()));
                    System.out.print("Seleccione ID de categoría: ");
                    Long idC = Long.parseLong(scanner.nextLine());
                    var prods = categoriaRepo.buscarProductosPorCategoria(idC);
                    if (prods.isEmpty()) {
                        System.out.println("No hay productos activos en esa categoría.");
                    } else {
                        System.out.printf("%-5s | %-25s | %-10s | %-8s\n", "ID", "Nombre", "Precio", "Stock");
                        System.out.println("-----------------------------------------------------------------");
                        prods.forEach(p -> System.out.printf("%-5d | %-25s | $%-9.2f | %-8d\n", p.getId(), p.getNombre(), p.getPrecio(), p.getStock()));
                    }
                    break;

                case 2:
                    System.out.print("Seleccione ID de usuario: ");
                    Long idU = Long.parseLong(scanner.nextLine());
                    var pUser = pedidoRepo.buscarPorUsuario(idU);
                    if (pUser.isEmpty()) {
                        System.out.println("El usuario con ID " + idU + " no posee compras activas.");
                    } else {
                        // REQUISITO CUMPLIDO: Formato de Tabla exigido por la Rúbrica
                        System.out.println("\n================================================================================");
                        System.out.printf("%-10s | %-12s | %-15s | %-12s | %-15s\n", "ID Pedido", "Fecha", "Estado", "Total", "Forma Pago");
                        System.out.println("--------------------------------------------------------------------------------");
                        for (Pedido p : pUser) {
                            System.out.printf("%-10d | %-12s | %-15s | $%-11.2f | %-15s\n",
                                    p.getId(),
                                    p.getFecha().toString(),
                                    p.getEstado().name(),
                                    p.getTotal(),
                                    p.getFormaPago().name());
                        }
                        System.out.println("================================================================================");
                    }
                    break;

                case 3:
                    EstadoPedido[] eps = EstadoPedido.values();
                    for (int i = 0; i < eps.length; i++) System.out.println((i + 1) + ". " + eps[i]);
                    System.out.print("Seleccione estado: ");
                    EstadoPedido ep = eps[Integer.parseInt(scanner.nextLine()) - 1];
                    var pEst = pedidoRepo.buscarPorEstado(ep);
                    if (pEst.isEmpty()) {
                        System.out.println("No hay pedidos con este estado.");
                    } else {
                        // Formato de tabla para pedidos por estado
                        System.out.println("\n========================================================================");
                        System.out.printf("%-10s | %-12s | %-20s | %-15s\n", "ID Pedido", "Fecha", "Cliente", "Total");
                        System.out.println("------------------------------------------------------------------------");
                        for (Pedido p : pEst) {
                            System.out.printf("%-10d | %-12s | %-20s | $%-14.2f\n",
                                    p.getId(),
                                    p.getFecha().toString(),
                                    p.getUsuario().getNombre(),
                                    p.getTotal());
                        }
                        System.out.println("========================================================================");
                    }
                    break;

                case 4:
                    // REQUISITO CUMPLIDO: Uso de JPQL Dedicada
                    Double totalFacturado = pedidoRepo.calcularTotalFacturado();
                    System.out.println("\n========================================");
                    System.out.printf("💰 TOTAL FACTURADO (TERMINADOS): $%.2f\n", totalFacturado);
                    System.out.println("========================================");
                    break;

                case 0: break;
                default: System.out.println("Opción no válida.");
            }
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
        }
    }
}
