import React, { useState } from 'react';
import './login.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:9090/api/empleados');
            if (!response.ok) {
                throw new Error('Error al conectar con la API');
            }
            const users = await response.json();
            // Ajusta los nombres de las propiedades según tu API
            const user = users.find(
                (u: any) => u.nombre === username && u.contraseña === password
            );
            if (user) {
                setError('');
                alert('¡Inicio de sesión exitoso!');
                console.log('Usuario autenticado:', user);
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