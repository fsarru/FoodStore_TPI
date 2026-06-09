package com.tup.programacion3.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(callSuper = true, exclude = "productos")
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Categoria extends Base {
    @EqualsAndHashCode.Include
    private String nombre;
    private String descripcion;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "categoria_id")
    @Builder.Default
    private Set<Producto> productos = new HashSet<>();

    public void addProducto(Producto p) {
        this.productos.add(p);
    }
}