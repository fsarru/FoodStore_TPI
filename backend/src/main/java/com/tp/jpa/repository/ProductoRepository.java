package com.tp.jpa.repository;

import com.tp.jpa.model.Categoria;
import com.tp.jpa.model.Producto;
import jakarta.persistence.EntityManager;

import java.util.List;

/**
 * Repositorio de Producto. Además del CRUD heredado implementa la consulta
 * de productos activos por categoría.
 */
public class ProductoRepository extends BaseRepository<Producto> {

    public ProductoRepository() {
        super(Producto.class);
    }

    /**
     * Retorna los productos activos que pertenecen a la categoría indicada.
     */
    public List<Producto> buscarPorCategoria(Long categoriaId) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Producto p WHERE p.categoria.id = :idCat AND p.eliminado = false";
            return em.createQuery(jpql, Producto.class)
                    .setParameter("idCat", categoriaId)
                    .getResultList();
        } finally {
            em.close();
        }
    }
}
