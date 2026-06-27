package com.tp.jpa.repository;

import com.tp.jpa.model.Pedido;
import java.util.List;

public class PedidoRepository extends BaseRepository<Pedido> {

    public PedidoRepository() {
        super(Pedido.class);
    }

    /**
     * Consulta y flujo atómico detallado para el Alta de un Pedido Completo.
     * Ejecuta las búsquedas, reducción de inventario de stock y persistencias
     * bajo el ciclo de vida de un único EntityManager y una sola transacción.
     * Ante cualquier anomalía se ejecuta un rollback completo (todo o nada).
     */
    public Pedido guardarPedidoCompleto(Long idUsuario, List<Long> productosIds, List<Integer> cantidades, com.tp.jpa.model.enums.FormaPago formaPago) throws Exception {
        jakarta.persistence.EntityManager em = com.tp.jpa.util.JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            em.getTransaction().begin();

            // 1. Recuperar al Usuario activo que quedará asociado al contexto
            com.tp.jpa.model.Usuario usuario = em.find(com.tp.jpa.model.Usuario.class, idUsuario);
            if (usuario == null || usuario.isEliminado()) {
                throw new Exception("El usuario seleccionado no existe o está inactivo.");
            }

            // 2. Instanciar el objeto raíz Pedido original
            Pedido pedido = Pedido.builder()
                    .usuario(usuario)
                    .fecha(java.time.LocalDate.now())
                    .estado(com.tp.jpa.model.enums.EstadoPedido.PENDIENTE)
                    .formaPago(formaPago)
                    .build();

            // 3. Iterar sobre las estructuras temporales para poblar detalles y alterar stock
            for (int i = 0; i < productosIds.size(); i++) {
                Long idProd = productosIds.get(i);
                int cantidad = cantidades.get(i);

                com.tp.jpa.model.Producto producto = em.find(com.tp.jpa.model.Producto.class, idProd);
                if (producto == null || producto.isEliminado()) {
                    throw new Exception("El producto con ID " + idProd + " ya no se encuentra en el catálogo.");
                }
                if (!producto.getDisponible()) {
                    throw new Exception("El producto '" + producto.getNombre() + "' no está disponible.");
                }
                if (producto.getStock() < cantidad) {
                    throw new Exception("Stock insuficiente de última hora para '" + producto.getNombre() + "'. Disponibles: " + producto.getStock());
                }

                // Descontar inventario (se sincronizará automáticamente al estar la entidad "Managed")
                producto.setStock(producto.getStock() - cantidad);

                // Agregar la línea de detalle usando tu lógica del modelo de dominio
                pedido.addDetallePedido(cantidad, producto);
            }

            // 4. Calcular el total final unificado invocando la interfaz Calculable
            pedido.calcularTotal();

            // 5. Persistir en cascada (CascadeType.ALL guarda automáticamente las líneas de detalle)
            em.persist(pedido);

            // Confirmar de forma atómica en el archivo de base de datos H2
            em.getTransaction().commit();
            return pedido;

        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback(); // Se revierte todo el lote ante cualquier error
            }
            throw e; // Propagar para que el Main lo informe por consola
        } finally {
            em.close(); // Liberar y cerrar de forma obligatoria el EntityManager para evitar fugas de memoria
        }
    }

    // Consulta JPQL: retorna todos los pedidos activos de un usuario específico
    public List<Pedido> buscarPorUsuario(Long idUsuario) {
        jakarta.persistence.EntityManager em = com.tp.jpa.util.JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            String jpql = "SELECT p FROM Pedido p WHERE p.usuario.id = :uid AND p.eliminado = false";
            return em.createQuery(jpql, Pedido.class)
                    .setParameter("uid", idUsuario)
                    .getResultList();
        } finally {
            em.close();
        }
    }

    public Double calcularTotalFacturado() {
        jakarta.persistence.EntityManager em = com.tp.jpa.util.JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            // Usamos SUM() para que la base de datos haga el trabajo pesado
            String jpql = "SELECT SUM(p.total) FROM Pedido p WHERE p.estado = :estado AND p.eliminado = false";
            Double total = em.createQuery(jpql, Double.class)
                    .setParameter("estado", com.tp.jpa.model.enums.EstadoPedido.TERMINADO)
                    .getSingleResult();

            return total != null ? total : 0.0;
        } finally {
            em.close();
        }
    }

    // Consulta JPQL: retorna todos los pedidos activos con un estado específico
    public List<Pedido> buscarPorEstado(com.tp.jpa.model.enums.EstadoPedido estado) {
        jakarta.persistence.EntityManager em = com.tp.jpa.util.JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            String jpql = "SELECT p FROM Pedido p WHERE p.estado = :estado AND p.eliminado = false";
            return em.createQuery(jpql, Pedido.class)
                    .setParameter("estado", estado)
                    .getResultList();
        } finally {
            em.close();
        }
    }
}