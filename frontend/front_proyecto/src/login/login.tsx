import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:9090/api/empleados');
            if (!response.ok) {
                throw new Error('Error al conectar con la API');
            }
            const users = await response.json();
            const user = users.find(
                (u: any) => u.nombre === username && u.contraseña === password
            );
            if (user) {
                setError('');
                // Guarda un "token" de sesión para las rutas privadas
                localStorage.setItem("token", "tokenDePrueba123");
                console.log('Usuario autenticado:', user);
                // Redirige a la página de administración
                navigate('/administracion');
            } else {
                setError('Usuario o contraseña incorrectos');
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Inicio de Sesion</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <button type="submit" className="btn-login">Iniciar Sesion</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
