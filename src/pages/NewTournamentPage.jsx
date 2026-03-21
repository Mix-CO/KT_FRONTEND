import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTournament } from '../api/tournaments';

export default function NewTournamentPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    category: 'MALE',
    startDate: '',
    endDate: '',
    semester: '',
    minTeams: 4,
    maxTeams: 16,
    minPlayersPerTeam: 7,
    maxPlayersPerTeam: 12,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await createTournament(form);
      navigate('/tournaments');
    } catch (e) {
      setError('Could not create tournament. Check all fields.');
    } finally {
      setLoading(false);
    }
  };

  // Vista previa calculada
  const estimatedMatches = Math.round((form.maxTeams * (form.maxTeams - 1)) / 2);
  const estimatedPlayers = form.maxTeams * form.minPlayersPerTeam;

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Torneo</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configura los detalles para la nueva competición universitaria.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/tournaments')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Borrador'}
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">

        {/* Formulario */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Información General */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="text-green-500">ℹ</span> Información General
            </h2>

            {/* Nombre */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Nombre del Torneo
              </label>
              <input
                type="text"
                placeholder="Torneo Interfacultades 2024"
                value={form.name}
                onChange={(e) => handle('name', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 transition"
              />
            </div>

            {/* Semestre + Categoría */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Semestre
                </label>
                <input
                  type="text"
                  placeholder="2024-2"
                  value={form.semester}
                  onChange={(e) => handle('semester', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 transition"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Categoría
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handle('category', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 transition bg-white"
                >
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Femenino</option>
                </select>
              </div>
            </div>

            {/* Fechas */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handle('startDate', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 transition"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Fecha de Finalización
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handle('endDate', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Reglas de Inscripción */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="text-green-500">⇌</span> Reglas de Inscripción
            </h2>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Máx. Equipos
                </label>
                <input
                  type="number"
                  value={form.maxTeams}
                  onChange={(e) => handle('maxTeams', parseInt(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 transition"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Mín. Equipos
                </label>
                <input
                  type="number"
                  value={form.minTeams}
                  onChange={(e) => handle('minTeams', parseInt(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 transition"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Mín. Jugadores/Equipo
                </label>
                <input
                  type="number"
                  value={form.minPlayersPerTeam}
                  onChange={(e) => handle('minPlayersPerTeam', parseInt(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 transition"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Máx. Jugadores/Equipo
                </label>
                <input
                  type="number"
                  value={form.maxPlayersPerTeam}
                  onChange={(e) => handle('maxPlayersPerTeam', parseInt(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 transition"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* Vista Previa */}
        <div className="w-72 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-green-500">👁</span> Vista Previa
            </h2>

            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Total Partidos Est.</span>
              <span className="text-green-500 font-bold text-xl">{estimatedMatches}</span>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <div>
                  <p className="text-xs text-gray-400">Semestre</p>
                  <p className="font-semibold text-gray-800">{form.semester || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                <div>
                  <p className="text-xs text-gray-400">Capacidad</p>
                  <p className="font-semibold text-gray-800">
                    {form.maxTeams} Equipos · {estimatedPlayers}+ Jugadores
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🏷</span>
                <div>
                  <p className="text-xs text-gray-400">Categoría</p>
                  <p className="font-semibold text-gray-800">
                    {form.category === 'MALE' ? 'Masculino' : 'Femenino'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              🚀 Publicar Torneo
            </button>
          </div>

          {/* Ayuda */}
          <div className="bg-gray-900 rounded-2xl p-5">
            <p className="text-white font-bold text-sm mb-1">¿Necesitas ayuda?</p>
            <p className="text-gray-400 text-xs mb-3">
              Consulta la guía de formatos de competición universitaria.
            </p>
            <button className="text-green-400 text-xs font-semibold hover:underline">
              Ver Documentación ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}