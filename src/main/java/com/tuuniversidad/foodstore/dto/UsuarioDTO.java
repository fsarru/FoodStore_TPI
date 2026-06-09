package com.tup.programacion3.dtos;

import com.tup.programacion3.entities.Pedido;
import java.util.Set;

public record UsuarioDTO(
        Long id,
        String nombre,
        String apellido,
        String mail,
        String celular,
        Set<Pedido> pedidos
) {}
