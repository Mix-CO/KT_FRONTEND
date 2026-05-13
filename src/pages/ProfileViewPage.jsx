import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getAllTimeSlots } from '../api/timeslots';
import { getUserAvailability, createAvailability, deleteAvailability } from '../api/availability';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS = { MONDAY: 'LUN', TUESDAY: 'MAR', WEDNESDAY: 'MIE', THURSDAY: 'JUE', FRIDAY: 'VIE', SATURDAY: 'SAB', SUNDAY: 'DOM' };

function getUserFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function formatTime(timeStr) {
  // "10:00:00" -> "10:00"
  return timeStr?.slice(0, 5) || '';
}

export default function ProfileViewPage() {
  const navigate = useNavigate();

  const [timeSlots, setTimeSlots] = useState([]);
  const [availability, setAvailability] = useState([]); // AvailabilityResponseDTO[]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const user = getUserFromToken();
  const userId = user?.userId;
  const userName = user?.name || user?.sub || 'Usuario';

  // Cargar timeslots y disponibilidad del usuario
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const [slots, userAvail] = await Promise.all([
          getAllTimeSlots(),
          getUserAvailability(userId),
        ]);
        setTimeSlots(slots);
        setAvailability(userAvail);
      } catch (err) {
        setError('No se pudo cargar la disponibilidad.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Extraer franjas únicas ordenadas por hora de inicio
  const uniqueSlots = [...new Map(
    timeSlots.map(s => [`${s.start}-${s.end}`, { start: s.start, end: s.end }])
  ).values()].sort((a, b) => a.start.localeCompare(b.start));

  // Buscar timeSlot por día y franja
  const getTimeSlot = useCallback((dayOfWeek, start, end) => {
    return timeSlots.find(s => s.dayOfWeek === dayOfWeek && s.start === start && s.end === end);
  }, [timeSlots]);

  // Verificar si una celda está marcada y obtener el availabilityId
  const getAvailabilityEntry = useCallback((timeSlotId) => {
    return availability.find(a => a.timeSlotId === timeSlotId);
  }, [availability]);

  const handleToggle = async (dayOfWeek, start, end) => {
    const slot = getTimeSlot(dayOfWeek, start, end);
    if (!slot) return;

    const existing = getAvailabilityEntry(slot.id);
    setSaving(true);
    try {
      if (existing) {
        // Desmarcar — DELETE
        await deleteAvailability(existing.id);
        setAvailability(prev => prev.filter(a => a.id !== existing.id));
      } else {
        // Marcar — POST
        const created = await createAvailability(userId, slot.id);
        setAvailability(prev => [...prev, created]);
      }
    } catch (err) {
      console.error('Error al actualizar disponibilidad:', err);
    } finally {
      setSaving(false);
    }
  };

  const availableCount = availability.length;
  const totalCells = uniqueSlots.length * DAY_ORDER.length;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
        <div className="mx-auto max-w-[1320px] space-y-5">

          {/* Header */}
          <header className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 flex flex-col xl:flex-row gap-5 xl:items-center">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-green-500 bg-gradient-to-br from-orange-200 to-orange-400" />
                <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl font-black text-gray-900">{userName}</h1>
                  <span className="rounded-full bg-green-100 text-green-700 text-xs font-bold px-3 py-1 uppercase">
                    {user?.role || 'Jugador'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{user?.sub || ''}</p>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/profile/edit')}
                    className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 transition"
                  >
                    Editar Perfil
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Disponibilidad */}
          <article className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Disponibilidad Semanal</h2>
                <p className="text-sm text-gray-500">Marca los horarios en los que puedes jugar</p>
              </div>
              {saving && (
                <span className="text-xs text-green-600 font-semibold animate-pulse">Guardando...</span>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-gray-400 font-semibold">Cargando disponibilidad...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead>
                      <tr>
                        <th className="w-36" />
                        {DAY_ORDER.map((day) => (
                          <th key={day} className="text-center py-2 text-[11px] font-bold text-gray-500 uppercase">
                            {DAY_LABELS[day]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueSlots.map((slot) => (
                        <tr key={`${slot.start}-${slot.end}`}>
                          <td className="text-xs font-semibold text-gray-400 py-2 pr-2 whitespace-nowrap">
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                          </td>
                          {DAY_ORDER.map((day) => {
                            const ts = getTimeSlot(day, slot.start, slot.end);
                            const avail = ts ? getAvailabilityEntry(ts.id) : null;
                            const isEnabled = !!avail;
                            const noSlot = !ts;
                            return (
                              <td key={day} className="py-1 px-1">
                                <button
                                  type="button"
                                  disabled={noSlot || saving}
                                  onClick={() => handleToggle(day, slot.start, slot.end)}
                                  className={`h-9 w-full rounded-md border transition ${
                                    noSlot
                                      ? 'bg-gray-100 border-gray-100 cursor-not-allowed'
                                      : isEnabled
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-gray-50 border-gray-200 text-transparent hover:border-green-300'
                                  }`}
                                  aria-label={`${DAY_LABELS[day]} ${formatTime(slot.start)}`}
                                >
                                  ✓
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-xs text-gray-500">
                    Bloques disponibles: <span className="font-semibold text-green-600">{availableCount}</span> / {totalCells}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-3 w-3 rounded-sm bg-green-500" /> Disponible
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-3 w-3 rounded-sm bg-gray-100 border border-gray-200" /> No disponible
                    </span>
                  </div>
                </div>
              </>
            )}
          </article>

        </div>
      </div>
    </Layout>
  );
}