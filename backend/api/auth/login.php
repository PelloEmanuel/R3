<?php
/**
 * Endpoint: POST /backend/api/auth/login.php
 * Recibe { email, password } y devuelve un token de sesión si son correctos.
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(400, ['error' => 'Método HTTP no soportado.']);
}

$conexion = obtenerConexion();
$datos = leerCuerpoJson();

$email = trim($datos['email'] ?? '');
$password = $datos['password'] ?? '';

if (empty($email) || empty($password)) {
    responderJson(400, ['errores' => ['Email y contraseña son obligatorios.']]);
}

$consulta = $conexion->prepare(
    'SELECT u.id, u.nombre, u.apellido, u.email, u.password_hash, r.nombre_rol
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.email = :email'
);
$consulta->execute(['email' => $email]);
$usuario = $consulta->fetch();

// Se usa el mismo mensaje de error para email inexistente o password
// incorrecta, para no revelar si un email está registrado o no.
if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
    responderJson(401, ['error' => 'Email o contraseña incorrectos.']);
}

// Genera un token aleatorio criptográficamente seguro y lo guarda con expiración.
$token = bin2hex(random_bytes(32));
$expiracion = date('Y-m-d H:i:s', strtotime('+2 hours'));

$insercion = $conexion->prepare(
    'INSERT INTO sesiones (usuario_id, token, fecha_expiracion) VALUES (:usuario_id, :token, :expiracion)'
);
$insercion->execute([
    'usuario_id' => $usuario['id'],
    'token'      => $token,
    'expiracion' => $expiracion,
]);

// La password_hash nunca se envía al frontend.
responderJson(200, [
    'mensaje' => 'Inicio de sesión correcto.',
    'token'   => $token,
    'usuario' => [
        'id'       => (int) $usuario['id'],
        'nombre'   => $usuario['nombre'],
        'apellido' => $usuario['apellido'],
        'email'    => $usuario['email'],
        'rol'      => $usuario['nombre_rol'],
    ],
]);
