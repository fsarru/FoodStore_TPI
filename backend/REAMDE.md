# Food Store - Backend & Consola JPA

Esta es la capa de lógica de persistencia para el sistema Food Store.

## Tecnologías Utilizadas
- Java
- JPA / Hibernate
- H2 Database (Persistida en archivo físico)
- Gradle

## Cómo ejecutar el proyecto
1. Abre este proyecto en tu IDE (IntelliJ IDEA o Eclipse).
2. Asegúrate de configurar la dependencia de base de datos H2.
3. Ejecuta la clase `Main.java` ubicada en `src/main/java/com/tp/jpa/Main.java`.
4. Interactúa con el menú de consola.

## Estructura de Paquetes
- `com.tp.jpa.model`: Entidades del dominio mapeadas con anotaciones JPA.
- `com.tp.jpa.repository`: Patrón Repository gestionando el `EntityManager` y JPQL.
- `com.tp.jpa.util`: Conexión de factoría EntityManager.
- `com.tp.jpa`: Ejecutable principal de consola.