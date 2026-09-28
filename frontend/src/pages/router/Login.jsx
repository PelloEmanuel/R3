import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from '../../components/LoginForm';

/**
 * Página de inicio de sesión, compartida por cualquier rango.
 * Si quien inicia sesión resulta ser el dueño, no hace falta redirigir
 * a ningún lado: el componente Portero (en App.jsx) detecta el rol y
 * cambia solo al panel del dueño en el siguiente render.
 */
export function Login() {
  const { login } = useAuth();
  const navegar = useNavigate();

  async function manejarLogin(email, password) {
    const usuarioAutenticado = await login(email, password);
    if (usuarioAutenticado.rol !== 'dueño') {
      navegar('/usuarios');
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-5">
        <h2 className="mb-4">Iniciar sesión</h2>
        <LoginForm onEnviar={manejarLogin} />
      </div>
    </div>
  );
}
