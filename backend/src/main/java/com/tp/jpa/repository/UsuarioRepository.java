package com.tp.jpa.repository;

import com.tp.jpa.model.Usuario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de Usuario. Además del CRUD heredado implementa la búsqueda
 * de un usuario activo por su mail.
 */
public class UsuarioRepository extends BaseRepository<Usuario> {

    public UsuarioRepository() {
        super(Usuario.class);
    }

    /**
     * Retorna el usuario activo con el mail indicado.
     */
    public java.util.Optional<com.tp.jpa.model.Usuario> buscarPorMail(String mail) {
        jakarta.persistence.EntityManager em = com.tp.jpa.util.JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            String jpql = "SELECT u FROM Usuario u WHERE u.mail = :mail AND u.eliminado = false";
            java.util.List<com.tp.jpa.model.Usuario> res = em.createQuery(jpql, com.tp.jpa.model.Usuario.class)
                    .setParameter("mail", mail)
                    .getResultList();
            return res.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(res.get(0));
        } finally {
            em.close();
        }
    }
}
