-- =====================================================================
-- Vacía TODOS los usuarios y sesiones para volver al estado inicial.
-- Después de ejecutarlo, la app muestra la pantalla de "Configuración
-- inicial" y la primera cuenta que se registre queda como dueño.
--
-- No borra la base ni la tabla "roles": solo los datos de usuarios.
-- Ejecutar desde phpMyAdmin: elegir la base "sistema_usuarios",
-- pestaña "SQL", pegar este contenido y presionar "Continuar".
-- =====================================================================

USE sistema_usuarios;

DELETE FROM sesiones;
DELETE FROM usuarios;

ALTER TABLE sesiones AUTO_INCREMENT = 1;
ALTER TABLE usuarios AUTO_INCREMENT = 1;
