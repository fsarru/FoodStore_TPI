package com.tuuniversidad.foodstore.repository;

import com.tuuniversidad.foodstore.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByMail(String mail);
}{
}
