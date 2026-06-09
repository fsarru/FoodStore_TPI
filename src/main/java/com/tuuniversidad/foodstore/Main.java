package com.tup.programacion3;

import com.tup.programacion3.entities.*;
import com.tup.programacion3.enums.Estado;
import com.tup.programacion3.enums.FormaPago;
import com.tup.programacion3.enums.Rol;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public class Main {
    public static void main(String[] args) {

        // Inicializamos el EntityManager
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("miUnidad");
        EntityManager em = emf.createEntityManager();

        try {
            em.getTransaction().begin();

            // ====================================================================
            // PUNTO 4.c y 4.d: Instanciar 3 Categorías y 10 Productos
            // ====================================================================

            Categoria catHardware = Categoria.builder().nombre("Hardware").descripcion("Componentes para programación").build();
            Producto p1 = Producto.builder().nombre("AMD Ryzen 5 7600").precio(250000.0).stock(10).build();
            Producto p2 = Producto.builder().nombre("Motherboard ASUS B650M-A").precio(150000.0).stock(5).build();
            Producto p3 = Producto.builder().nombre("Memoria RAM DDR5 32GB").precio(120000.0).stock(15).build();
            catHardware.addProducto(p1);
            catHardware.addProducto(p2);
            catHardware.addProducto(p3);

            Categoria catJuegos = Categoria.builder().nombre("Suscripciones").descripcion("PlayStation y Digitales").build();
            Producto p4 = Producto.builder().nombre("Suscripción PlayStation Plus").precio(80000.0).stock(100).build();
            Producto p5 = Producto.builder().nombre("Juego PS5 Digital").precio(70000.0).stock(50).build();
            Producto p6 = Producto.builder().nombre("Tarjeta de Regalo PS Store").precio(20000.0).stock(200).build();
            catJuegos.addProducto(p4);
            catJuegos.addProducto(p5);
            catJuegos.addProducto(p6);

            Categoria catSuper = Categoria.builder().nombre("Alimentos").descripcion("Compras de supermercado").build();
            Producto p7 = Producto.builder().nombre("Yerba Mate 1Kg").precio(4500.0).stock(50).build();
            Producto p8 = Producto.builder().nombre("Costillar para Asado").precio(15000.0).stock(10).build();
            Producto p9 = Producto.builder().nombre("Bolsa de Carbón").precio(2500.0).stock(30).build();
            Producto p10 = Producto.builder().nombre("Fardo de Leña").precio(3500.0).stock(20).build(); // Este lo borraremos luego
            catSuper.addProducto(p7);
            catSuper.addProducto(p8);
            catSuper.addProducto(p9);
            catSuper.addProducto(p10);

            // Al persistir las categorías, por el CascadeType.ALL se persisten automáticamente sus productos
            em.persist(catHardware);
            em.persist(catJuegos);
            em.persist(catSuper);


            // ====================================================================
            // PUNTO 4.a y 4.b: Instanciar 2 Usuarios y 3 Pedidos (con 2 detalles c/u)
            // ====================================================================

            Usuario usuario1 = Usuario.builder()
                    .nombre("Franco").apellido("Sarrú").mail("franco.sarru@mail.com")
                    .celular("3411234567").contraseña("pass123").rol(Rol.ADMIN)
                    .build();

            Usuario usuario2 = Usuario.builder()
                    .nombre("Walter").apellido("Sarrú").mail("walter@mail.com")
                    .celular("3419876543").contraseña("pass456").rol(Rol.USUARIO)
                    .build();

            // Pedido 1 (Para Franco)
            Pedido pedido1 = Pedido.builder().estado(Estado.CONFIRMADO).formaPago(FormaPago.TARJETA).build();
            pedido1.addDetallePedido(1, p1); // 1 Procesador
            pedido1.addDetallePedido(1, p2); // 1 Motherboard
            usuario1.addPedido(pedido1);

            // Pedido 2 (Para Franco)
            Pedido pedido2 = Pedido.builder().estado(Estado.TERMINADO).formaPago(FormaPago.TRANSFERENCIA).build();
            pedido2.addDetallePedido(2, p7); // 2 de Yerba Mate
            pedido2.addDetallePedido(1, p4); // 1 Suscripción PS Plus
            usuario1.addPedido(pedido2);

            // Pedido 3 (Para Walter)
            Pedido pedido3 = Pedido.builder().estado(Estado.PENDIENTE).formaPago(FormaPago.EFECTIVO).build();
            pedido3.addDetallePedido(3, p8); // 3 Costillares
            pedido3.addDetallePedido(2, p9); // 2 Bolsas de carbón
            usuario2.addPedido(pedido3);

            // Persistimos los usuarios (por CascadeType.ALL se guardan sus pedidos y los detalles)
            em.persist(usuario1);
            em.persist(usuario2);

            // Forzamos la sincronización con la base de datos para que asigne todos los IDs
            em.flush();

            System.out.println("--- Se persistieron usuarios, pedidos, categorías y productos con éxito ---");


            // ====================================================================
            // PUNTO 5: Actualizar al menos 2 productos
            // ====================================================================

            p1.setPrecio(265000.0);
            p7.setPrecio(4800.0);
            em.merge(p1);
            em.merge(p7);
            System.out.println("--- Se actualizaron 2 productos ---");


            // ====================================================================
            // PUNTO 6: Buscar Usuario por id
            // ====================================================================

            Usuario usuarioBuscado = em.find(Usuario.class, usuario1.getId());
            System.out.println("--- Usuario buscado por ID: " + usuarioBuscado.getNombre() + " " + usuarioBuscado.getApellido() + " ---");


            // ====================================================================
            // PUNTO 7: Buscar Usuario por mail
            // ====================================================================

            Usuario usuarioPorMail = em.createQuery("SELECT u FROM Usuario u WHERE u.mail = :mail", Usuario.class)
                    .setParameter("mail", "walter@mail.com")
                    .getSingleResult();
            System.out.println("--- Usuario buscado por mail: " + usuarioPorMail.getNombre() + " ---");


            // ====================================================================
            // PUNTO 8: Borrar 1 producto
            // ====================================================================

            em.remove(p10);
            System.out.println("--- Producto 'Fardo de Leña' eliminado ---");


            // Confirmamos la transacción
            em.getTransaction().commit();

        } catch (Exception e) {
            em.getTransaction().rollback();
            e.printStackTrace();
        } finally {
            em.close();
            emf.close();
        }
    }
}