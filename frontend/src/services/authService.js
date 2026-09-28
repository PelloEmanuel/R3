import { API_BASE_URL } from './apiConfig';

async function procesarRespuesta(respuesta) {
  const cuerpo = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const mensaje =
      cuerpo.error || (cuerpo.errores && cuerpo.errores.join(' ')) || 'Ocurrió un error inesperado.';
    throw new Error(mensaje);
  }

  return cuerpo;
}

/**
 * Consulta si ya existe algún usuario registrado (es decir, si ya existe
 * un dueño). No requiere sesión: se usa para decidir qué pantalla mostrar
 * antes de que la persona inicie sesión.
 */
export async function consultarEstadoInicial() {
  const respuesta = await fetch(`${API_BASE_URL}/auth/estado.php`);
  const cuerpo = await procesarRespuesta(respuesta);
  return cuerpo.existeDueño;
}

/** Envía email y contraseña; devuelve { token, usuario } si son correctos. */
export async function iniciarSesion(email, password) {
  const respuesta = await fetch(`${API_BASE_URL}/auth/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return procesarRespuesta(respuesta);
}

/** Avisa al backend que invalide el token actual. */
export async function cerrarSesion(token) {
  await fetch(`${API_BASE_URL}/auth/logout.php`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Valida un token guardado y devuelve el usuario dueño, o null si no es válido. */
export async function validarSesion(token) {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/auth/me.php`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!respuesta.ok) return null;
    const cuerpo = await respuesta.json();
    return cuerpo.usuario;
  } catch {
    return null;
  }
}
