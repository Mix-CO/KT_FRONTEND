import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const FACULTIES = [
  'Facultad de Ingenieria',
  'Facultad de Arquitectura',
  'Facultad de Medicina',
  'Facultad de Derecho',
  'Facultad de Economia',
];

export default function EditProfilePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: 'Juan Perez',
    email: 'juan.perez@universidad.edu',
    faculty: 'Facultad de Ingenieria',
    major: 'Ingenieria de Sistemas',
    preferredRole: 'Ej. Desarrollador Frontend',
    universityId: '202345678',
  });

  const [notifications, setNotifications] = useState({
    coordinationResults: true,
    scheduleChanges: true,
    readConfirmations: false,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleNotification = (field) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const Toggle = ({ enabled, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 rounded-full transition ${enabled ? 'bg-green-500' : 'bg-gray-200'}`}
      aria-label="Cambiar estado"
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? 'left-5' : 'left-0.5'}`}
      />
    </button>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
        <div className="mx-auto max-w-[1080px] space-y-6">

          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-orange-300 border-2 border-lime-300" />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center"
                >
                  ✎
                </button>
              </div>

              <div>
                <h1 className="text-4xl font-black text-gray-900">Editar Perfil</h1>
                <p className="text-gray-500 mt-1">Personaliza tu informacion y disponibilidad</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition"
              >
                Guardar Cambios
              </button>
            </div>
          </header>

          <section className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
            <h2 className="text-2xl font-black text-gray-900 mb-5">Informacion Personal</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full rounded-xl border border-green-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                  Correo Institucional
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full rounded-xl border border-green-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                  Facultad
                </label>
                <select
                  value={form.faculty}
                  onChange={(e) => handleChange('faculty', e.target.value)}
                  className="w-full rounded-xl border border-green-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 transition"
                >
                  {FACULTIES.map((faculty) => (
                    <option key={faculty} value={faculty}>{faculty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                  Carrera
                </label>
                <input
                  type="text"
                  value={form.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  className="w-full rounded-xl border border-green-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                  Posicion Preferida
                </label>
                <input
                  type="text"
                  value={form.preferredRole}
                  onChange={(e) => handleChange('preferredRole', e.target.value)}
                  className="w-full rounded-xl border border-green-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                  ID Universitario
                </label>
                <input
                  type="text"
                  value={form.universityId}
                  onChange={(e) => handleChange('universityId', e.target.value)}
                  className="w-full rounded-xl border border-green-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 transition"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Preferencias de Notificacion</h2>
            <div className="border-t border-gray-100 mt-4 pt-3 space-y-5">

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-bold text-gray-800">Resultados de Coordinacion</p>
                  <p className="text-sm text-gray-500">Notificarme cuando se generen horarios grupales</p>
                </div>
                <Toggle
                  enabled={notifications.coordinationResults}
                  onClick={() => toggleNotification('coordinationResults')}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-bold text-gray-800">Cambios de Horario</p>
                  <p className="text-sm text-gray-500">Alertas si un miembro del equipo cambia disponibilidad</p>
                </div>
                <Toggle
                  enabled={notifications.scheduleChanges}
                  onClick={() => toggleNotification('scheduleChanges')}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-bold text-gray-800">Confirmaciones de Lectura</p>
                  <p className="text-sm text-gray-500">Recibir avisos cuando otros vean mi disponibilidad</p>
                </div>
                <Toggle
                  enabled={notifications.readConfirmations}
                  onClick={() => toggleNotification('readConfirmations')}
                />
              </div>

            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}