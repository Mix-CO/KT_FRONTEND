import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getAllTimeSlots } from '../api/timeslots';
import { getMatchesByTournament } from '../api/matches';
import { createReservation, updateReservationStatus, getReservationsForMatch } from '../api/reservations';
import useWebSocket from '../hooks/useWebSocket';

const DAY_LABELS = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const TIME_SLOTS_ORDER = [
  '07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30'
];

export default function SchedulingSessionPage() {
  const { tournamentId } = useParams();

  const [timeSlots, setTimeSlots] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleTimeSlotUpdate = useCallback((data) => {
    const { timeSlotId, status } = data;
    setTimeSlots((prev) =>
      prev.map((ts) => ts.id === timeSlotId ? { ...ts, status } : ts)
    );
    if (status === 'LOCKED') showNotification('Una franja fue bloqueada', 'warning');
    else if (status === 'RESERVED') showNotification('¡Franja confirmada!', 'success');
    else if (status === 'EXPIRED') showNotification('Una franja expiró', 'info');
    else if (status === 'AVAILABLE') showNotification('Una franja fue liberada', 'info');
  }, []);

  const { subscribeToTimeSlot, client } = useWebSocket({ onTimeSlotUpdate: handleTimeSlotUpdate });

  useEffect(() => {
    if (!client.current?.connected) return;
    timeSlots.forEach((ts) => subscribeToTimeSlot(ts.id));
  }, [timeSlots, subscribeToTimeSlot, client]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slots, matchList] = await Promise.all([
          getAllTimeSlots(),
          getMatchesByTournament(tournamentId),
        ]);
        setTimeSlots(slots);
        setMatches(matchList.filter((m) => m.status === 'SCHEDULED'));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournamentId]);

  const handleSelectMatch = async (match) => {
    setSelectedMatch(match);
    try {
      const res = await getReservationsForMatch(match.id);
      setReservations(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProposeSlot = async (slot) => {
    if (!selectedMatch) {
      showNotification('Selecciona un partido primero', 'warning');
      return;
    }
    if (slot.status !== 'AVAILABLE') {
      showNotification('Esta franja no está disponible', 'warning');
      return;
    }
    try {
      await createReservation({
        matchId: selectedMatch.id,
        timeSlotId: slot.id,
        userId,
      });
      showNotification('Franja propuesta — esperando confirmación del capitán rival', 'success');
      const res = await getReservationsForMatch(selectedMatch.id);
      setReservations(res);
    } catch (e) {
      showNotification(e.response?.data?.message || 'Error al proponer la franja', 'error');
    }
  };

  const handleRespond = async (reservation, accepted) => {
    try {
      await updateReservationStatus(reservation.id, {
        status: accepted ? 'ACCEPTED' : 'REJECTED',
        respondingUserId: userId,
      });
      showNotification(
        accepted ? '¡Partido programado!' : 'Franja rechazada',
        accepted ? 'success' : 'info'
      );
      const res = await getReservationsForMatch(selectedMatch.id);
      setReservations(res);
    } catch (e) {
      showNotification(e.response?.data?.message || 'Error al responder', 'error');
    }
  };

  // Organiza slots en grid: { startTime -> { dayOfWeek -> slot } }
  const grid = {};
  TIME_SLOTS_ORDER.forEach((time) => { grid[time] = {}; });
  timeSlots.forEach((slot) => {
    const start = slot.start?.substring(0, 5);
    if (grid[start] !== undefined) {
      grid[start][slot.dayOfWeek] = slot;
    }
  });

  const pendingReservations = reservations.filter(
    (r) => r.status === 'PENDING' && r.proposedByUserId !== userId
  );

  const getSlotStyle = (slot) => {
    if (!slot) return 'bg-gray-50 border-gray-100';
    if (slot.status === 'LOCKED') return 'bg-yellow-100 border-yellow-300 cursor-not-allowed';
    if (slot.status === 'RESERVED') return 'bg-red-100 border-red-300 cursor-not-allowed';
    return 'bg-green-50 border-green-300 hover:bg-green-100 hover:border-green-500 cursor-pointer';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full p-20">
          <p className="text-gray-400 animate-pulse">Cargando sesión...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sesión de Programación</h1>
            <p className="text-gray-500 text-sm mt-1">
              Selecciona un partido y luego haz click en una franja para proponerla.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-200 inline-block border border-green-400"></span> Disponible
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-200 inline-block border border-yellow-400"></span> Bloqueada
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-200 inline-block border border-red-400"></span> Reservada
            </span>
          </div>
        </div>

        {/* Notificación */}
        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${
            notification.type === 'success' ? 'bg-green-50 border-green-300 text-green-700' :
            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
            notification.type === 'error' ? 'bg-red-50 border-red-300 text-red-700' :
            'bg-blue-50 border-blue-300 text-blue-700'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="flex gap-5">

          {/* Panel izquierdo — partidos */}
          <div className="w-52 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h2 className="font-bold text-gray-800 text-sm mb-3">Partidos sin programar</h2>
              {matches.length === 0 ? (
                <p className="text-gray-400 text-xs">No hay partidos pendientes</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {matches.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => handleSelectMatch(match)}
                      className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${
                        selectedMatch?.id === match.id
                          ? 'bg-green-50 border-green-400 text-green-700 font-semibold'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-semibold">{match.homeTeamName}</p>
                      <p className="text-gray-400">vs {match.awayTeamName}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid calendario */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="w-16 px-2 py-3 text-gray-400 font-medium border-b border-gray-100"></th>
                  {DAYS_ORDER.map((day) => (
                    <th key={day} className="px-2 py-3 text-center font-bold text-gray-700 border-b border-gray-100">
                      {DAY_LABELS[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS_ORDER.map((time) => (
                  <tr key={time} className="border-b border-gray-50">
                    <td className="px-2 py-2 text-gray-400 font-medium text-right whitespace-nowrap">
                      {time}
                    </td>
                    {DAYS_ORDER.map((day) => {
                      const slot = grid[time]?.[day];
                      return (
                        <td key={day} className="px-1 py-1">
                          {slot ? (
                            <button
                              onClick={() => handleProposeSlot(slot)}
                              disabled={slot.status !== 'AVAILABLE'}
                              className={`w-full h-10 rounded-lg border text-xs font-medium transition-all ${getSlotStyle(slot)}`}
                            >
                              {slot.status === 'LOCKED' && '⏳'}
                              {slot.status === 'RESERVED' && '✓'}
                            </button>
                          ) : (
                            <div className="w-full h-10 rounded-lg bg-gray-50 border border-gray-100" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel reservas pendientes */}
        {pendingReservations.length > 0 && (
          <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
            <h2 className="font-bold text-yellow-800 mb-3 text-sm">
              ⏰ Franjas propuestas — necesitan tu confirmación
            </h2>
            <div className="flex flex-col gap-2">
              {pendingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between bg-white rounded-xl border border-yellow-200 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {DAY_LABELS[reservation.dayOfWeek]} {reservation.startTime?.substring(0, 5)} — {reservation.endTime?.substring(0, 5)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Propuesto por {reservation.proposedByName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(reservation, true)}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => handleRespond(reservation, false)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-lg transition"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}