package com.tp.jpa.repository;

import com.tp.jpa.model.Categoria;
import com.tp.jpa.model.Producto;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import java.util.List;

public class CategoriaRepository extends BaseRepository<Categoria> {

    public CategoriaRepository() {
        super(Categoria.class);
    }

    // Consulta JPQL: retorna los productos activos de una categoría.
    // Se filtra por el id de la categoría (parámetro nombrado :catId) y
    // por p.eliminado = false para excluir las bajas lógicas.
    public List<Producto> buscarProductosPorCategoria(Long catId) {
        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            String jpql = "SELECT p FROM Producto p WHERE p.categoria.id = :catId AND p.eliminado = false";
            return em.createQuery(jpql, Producto.class)
                    .setParameter("catId", catId)
                    .getResultList();
        } finally {
            em.close();
        }
    }
}