import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogged, setKeepLogged] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      navigate('/tournaments');
    } catch (e) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">

      {/* Panel izquierdo — imagen */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center flex-col justify-between p-10"
        style={{ backgroundImage: "url('/field.jpg')" }}
      >
        <div className="flex items-center gap-2">
          <div className="bg-green-500 rounded-lg p-2">
            <span className="text-white font-bold text-lg">⚙</span>
          </div>
          <span className="text-white font-bold text-xl">KickTime</span>
        </div>

        <div>
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            ⚡ AI-Powered Efficiency
          </span>
          <h1 className="text-white text-4xl font-bold mt-4 leading-tight">
            Smart Scheduling<br />for the Next<br />Generation.
          </h1>
          <p className="text-gray-300 mt-4 text-sm max-w-xs">
            Join hundreds of universities across the nation using KickTime to manage
            their tournaments with precision and speed.
          </p>

          <div className="flex gap-8 mt-8">
            <div>
              <p className="text-white font-bold text-2xl">500+</p>
              <p className="text-gray-300 text-sm">Active Leagues</p>
            </div>
            <div>
              <p className="text-white font-bold text-2xl">12k+</p>
              <p className="text-gray-300 text-sm">Matches Scheduled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-2 mb-8">
            Please enter your institutional details to continue.
          </p>

          {/* Email */}
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Institutional Email
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 mb-4">
            <span className="text-gray-400 mr-2">✉</span>
            <input
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>

          {/* Password */}
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <button className="text-green-500 text-sm font-semibold hover:underline">
              Forgot Password?
            </button>
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 mb-4">
            <span className="text-gray-400 mr-2">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          {/* Keep me logged in */}
          <div className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              id="keep"
              checked={keepLogged}
              onChange={(e) => setKeepLogged(e.target.checked)}
              className="accent-green-500"
            />
            <label htmlFor="keep" className="text-sm text-gray-600">
              Keep me logged in
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          {/* Botón Sign In */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          {/* Registro */}
          <p className="text-center text-gray-500 text-sm mt-6">
            New to the tournament?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-green-500 font-semibold hover:underline"
            >
              Register your team
            </button>
          </p>

          {/* Footer */}
          <div className="flex justify-center gap-6 mt-12 text-xs text-gray-400">
            <button className="hover:text-gray-600">HELP CENTER</button>
            <button className="hover:text-gray-600">PRIVACY</button>
            <button className="hover:text-gray-600">TERMS</button>
          </div>
        </div>
      </div>
    </div>
  );
}