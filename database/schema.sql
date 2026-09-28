-- =====================================================================
-- Base de datos: sistema_usuarios
-- Motor: MySQL / MariaDB (compatible con XAMPP)
--
-- Diseño relacional normalizado:
--   - roles(id, nombre_rol)          -> catálogo de roles posibles
--   - usuarios(...)                  -> datos propios de cada usuario
--   - sesiones(...)                  -> tokens de sesión activos (login)
--
-- 1FN: todas las columnas guardan un único valor atómico
--      (por ejemplo, no se guarda "roles" como una lista separada por comas).
-- 2FN: las claves primarias son simples (id autoincremental), por lo que
--      no existen dependencias parciales de una clave compuesta.
-- 3FN: el nombre del rol NO se repite dentro de "usuarios"; se guarda una
--      sola vez en "roles" y se referencia mediante rol_id (sin dependencias
--      transitivas: ningún atributo de usuarios depende de otro atributo
--      no clave).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS sistema_usuarios
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_usuarios;

-- ---------------------------------------------------------------------
-- Tabla: roles
-- Catálogo de rangos jerárquicos del sistema:
--   1 = usuario        (rol por defecto de cualquier registro público)
--   2 = administrador  (solo el dueño puede otorgar/quitar este rango)
--   3 = dueño          (único; se asigna automáticamente al primer
--                        registro que exista en toda la base)
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(30) NOT NULL UNIQUE
);

INSERT INTO roles (nombre_rol) VALUES ('usuario'), ('administrador'), ('dueño');

-- ---------------------------------------------------------------------
-- Tabla: usuarios
-- Almacena los datos principales de cada usuario registrado.
-- La contraseña se guarda SIEMPRE hasheada (nunca en texto plano).
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL,
  apellido VARCHAR(60) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL DEFAULT 1,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_rol
    FOREIGN KEY (rol_id) REFERENCES roles(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Tabla: sesiones
-- Guarda los tokens emitidos al iniciar sesión, para poder validar
-- y cerrar sesiones desde el backend sin depender solo del cliente.
-- ---------------------------------------------------------------------
CREATE TABLE sesiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token CHAR(64) NOT NULL UNIQUE,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATETIME NOT NULL,
  CONSTRAINT fk_sesiones_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- No se insertan usuarios de ejemplo con contraseña: el hash de la
-- contraseña se genera únicamente desde el backend (password_hash de PHP).
-- Para tener usuarios de prueba, registrarlos desde el formulario de la
-- aplicación (Sistema 1 o Sistema 2); así el hash siempre es válido.
