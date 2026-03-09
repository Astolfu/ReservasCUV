import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!username || !password) {
            setError('Por favor llena todos los campos');
            return;
        }

        const result = await login(username, password);
        if (result.success) {
            navigate('/dashboard'); // dashboard redirige según el role (admin/student)
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container glass-panel animate-enter">
                <div className="login-header">
                    <h2>Bienvenido</h2>
                    <p>Reserva de Espacios Escolares</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label className="input-label">Usuario</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Ej. admin"
                        />
                    </div>
                    
                    <div className="input-group">
                        <label className="input-label">Contraseña</label>
                        <input 
                            type="password" 
                            className="input-field" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        <LogIn size={18} />
                        Iniciar Sesión
                    </button>
                </form>
            </div>
            <style>{`
                .login-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--color-primary-light) 0%, #ffffff 100%);
                }
                .login-container {
                    width: 100%;
                    max-width: 400px;
                    padding: 2.5rem;
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .login-header h2 {
                    font-size: 1.75rem;
                    color: var(--color-primary);
                    margin-bottom: 0.5rem;
                }
                .error-message {
                    background-color: var(--color-danger-bg);
                    color: var(--color-danger);
                    padding: 0.75rem;
                    border-radius: var(--border-radius-sm);
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                    text-align: center;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default Login;
