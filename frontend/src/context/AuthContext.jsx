import { createContext, useContext, useEffect, useState } from 'react';
import { iniciarSesion, cerrarSesion, validarSesion } from '../services/authService';

/**
 * Por qué Context: el usuario autenticado y el token deben estar
 * disponibles en componentes muy distintos entre sí (Navbar, rutas
 * protegidas, formularios) sin pasar props manualmente por cada nivel
 * intermedio ("prop drilling"). Es información realmente global.
 */
const AuthContext = createContext(null);

const CLAVE_TOKEN = 'sistemaUsuarios_token';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Al montar la aplicación, si hay un token guardado en localStorage,
  // se valida contra el backend para restaurar la sesión sin pedir
  // la contraseña de nuevo.
  useEffect(() => {
    const tokenGuardado = localStorage.getItem(CLAVE_TOKEN);

    if (!tokenGuardado) {
      setCargandoSesion(false);
      return;
    }

    validarSesion(tokenGuardado).then((usuarioValidado) => {
      if (usuarioValidado) {
        setUsuario(usuarioValidado);
        setToken(tokenGuardado);
      } else {
        localStorage.removeItem(CLAVE_TOKEN);
      }
      setCargandoSesion(false);
    });
  }, []);

  async function login(email, password) {
    const { token: tokenNuevo, usuario: usuarioAutenticado } = await iniciarSesion(email, password);
    // Solo el token viaja a localStorage; nunca la contraseña.
    localStorage.setItem(CLAVE_TOKEN, tokenNuevo);
    setToken(tokenNuevo);
    setUsuario(usuarioAutenticado);
    return usuarioAutenticado;
  }

  async function logout() {
    if (token) {
      await cerrarSesion(token);
    }
    localStorage.removeItem(CLAVE_TOKEN);
    setToken(null);
    setUsuario(null);
  }

  const valor = {
    usuario,
    token,
    estaAutenticado: usuario !== null,
    cargandoSesion,
    login,
    logout,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

/** Hook de acceso rápido al contexto de autenticación. */
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.');
  }
  return contexto;
}
