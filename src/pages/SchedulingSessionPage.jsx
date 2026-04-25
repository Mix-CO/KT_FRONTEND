import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getAllTimeSlots } from '../api/timeslots';
import { getMatchesByTournament } from '../api/matches';
import { createReservation, updateReservationStatus, getReservationsForMatch } from '../api/reservations';
import useWebSocket from '../hooks/useWebSocket';

const DAY_LABELS = {
  MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
};

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const TIME_SLOTS_ORDER = ['07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];

// Componente animación moneda
function CoinFlipModal({ result, onClose }) {
  const [phase, setPhase] = useState('flipping'); // flipping | result

  useEffect(() => {
    const timer = setTimeout(() => setPhase('result'), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'result') {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 text-center">
          ⚡ Conflicto de franja
        </h2>
        <p className="text-gray-500 text-sm text-center">
          Dos capitanes pidieron la misma franja — se decide al azar
        </p>

        {/* Moneda */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg
          ${phase === 'flipping'
            ? 'animate-spin bg-yellow-400'
            : result === 'won'
              ? 'bg-green-400 scale-110 transition-transform duration-500'
              : 'bg-red-400 scale-110 transition-transform duration-500'
          }`}
        >
          {phase === 'flipping' ? '🪙' : result === 'won' ? '🏆' : '😔'}
        </div>

        {phase === 'result' && (
          <div className="text-center">
            {result === 'won' ? (
              <>
                <p className="text-green-600 font-bold text-lg">¡Ganaste!</p>
                <p className="text-gray-500 text-sm mt-1">La franja es tuya — espera confirmación del rival</p>
              </>
            ) : (
              <>
                <p className="text-red-500 font-bold text-lg">Perdiste el sorteo</p>
                <p className="text-gray-500 text-sm mt-1">Selecciona otra franja para tu partido</p>
              </>
            )}
          </div>
        )}

        {phase === 'flipping' && (
          <p className="text-gray-400 text-xs animate-pulse">Decidiendo...</p>
        )}
      </div>
    </div>
  );
}

export default function SchedulingSessionPage() {
  const { tournamentId } = useParams();

  const [timeSlots, setTimeSlots] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [coinFlip, setCoinFlip] = useState(null); // { result: 'won' | 'lost' }

  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const isSlotClickable = (slot) => slot && slot.status !== 'RESERVED';

  const refreshMatches = useCallback(() => {
    getMatchesByTournament(tournamentId).then((matchList) => {
      setMatches(matchList.filter((m) => m.status === 'SCHEDULED'));
    });
  }, [tournamentId]);

  const handleTimeSlotUpdate = useCallback((data) => {
    console.log('>>> WebSocket update received:', data);
    const { timeSlotId, status, conflictResolved, winnerId, loserId } = data;

    // Actualiza estado de la franja
    setTimeSlots((prev) =>
      prev.map((ts) => ts.id === timeSlotId ? { ...ts, status } : ts)
    );

    // Maneja conflicto
    if (conflictResolved) {
      const myReservationWon = winnerId && String(winnerId) === String(userId);
      const myReservationLost = loserId && String(loserId) === String(userId);

      if (myReservationWon) {
        setCoinFlip({ result: 'won' });
      } else if (myReservationLost) {
        setCoinFlip({ result: 'lost' });
        // Refresca reservas del partido seleccionado
        if (selectedMatch) {
          getReservationsForMatch(selectedMatch.id).then(setReservations);
        }
      }
      return; // No mostrar notificación genérica en caso de conflicto
    }

    // Notificaciones normales
    if (status === 'RESERVED') {
      refreshMatches();
      setSelectedMatch(null);
      showNotification('¡Franja confirmada!', 'success');
    } else if (status === 'LOCKED') {
      showNotification('Una franja fue bloqueada por otro capitán', 'warning');
    } else if (status === 'EXPIRED') {
      showNotification('Una franja expiró y volvió a estar disponible', 'info');
    } else if (status === 'AVAILABLE') {
      showNotification('Una franja fue liberada', 'info');
    }
  }, [refreshMatches, selectedMatch, userId]);

  const { subscribeToTimeSlot } = useWebSocket({
    onTimeSlotUpdate: handleTimeSlotUpdate,
    onConnect: () => {
      console.log('>>> WS onConnect fired');
      setWsConnected(true);
    },
  });

  useEffect(() => {
    if (!wsConnected || timeSlots.length === 0) return;
    timeSlots.forEach((ts) => subscribeToTimeSlot(ts.id));
  }, [wsConnected, timeSlots, subscribeToTimeSlot]);

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
    if (!isSlotClickable(slot)) {
      showNotification('Esta franja ya está reservada', 'warning');
      return;
    }
    try {
      await createReservation({
        matchId: selectedMatch.id,
        timeSlotId: slot.id,
        userId,
      });

      if (slot.status === 'LOCKED') {
        showNotification('⚡ Franja disputada — se resolvió el conflicto al azar', 'warning');
      } else {
        showNotification('Franja propuesta — esperando confirmación del capitán rival', 'success');
      }

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
    if (slot.status === 'RESERVED') return 'bg-red-100 border-red-300 cursor-not-allowed';
    if (slot.status === 'LOCKED') return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200 cursor-pointer';
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
      {/* Modal conflicto */}
      {coinFlip && (
        <CoinFlipModal
          result={coinFlip.result}
          onClose={() => setCoinFlip(null)}
        />
      )}

      <div className="p-6">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sesión de Programación</h1>
            <p className="text-gray-500 text-sm mt-1">
              Selecciona un partido y haz click en una franja para proponerla.
              Las franjas amarillas están disputadas — también puedes retarlas si otro capitán la bloqueó.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-200 inline-block border border-green-400"></span> Disponible
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-200 inline-block border border-yellow-400"></span> Disputada
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-200 inline-block border border-red-400"></span> Reservada
            </span>
          </div>
        </div>

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
                              disabled={!isSlotClickable(slot)}
                              aria-label={
                                slot.status === 'LOCKED'
                                  ? 'Disputar franja bloqueada'
                                  : slot.status === 'RESERVED'
                                    ? 'Franja reservada'
                                    : 'Proponer franja'
                              }
                              title={
                                slot.status === 'LOCKED'
                                  ? 'Franja bloqueada: haz clic para disputarla'
                                  : slot.status === 'RESERVED'
                                    ? 'Franja reservada'
                                    : 'Franja disponible: haz clic para proponerla'
                              }
                              style={{ cursor: isSlotClickable(slot) ? 'pointer' : 'not-allowed' }}
                              className={`w-full h-10 rounded-lg border text-xs font-medium transition-all ${getSlotStyle(slot)} ${slot.status === 'LOCKED' ? 'ring-1 ring-yellow-400' : ''}`}
                            >
                              {slot.status === 'LOCKED' && '⚡'}
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