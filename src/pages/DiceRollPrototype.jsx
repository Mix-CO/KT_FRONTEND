import { useEffect, useMemo, useRef, useState } from 'react';

const CAPTAINS = [
  { id: 'a', name: 'Alex Johnson', team: 'Ingenieria FC' },
  { id: 'b', name: 'Maria Perez', team: 'Los Halcones' },
];

const DICE_FACE = {
  1: ['center'],
  2: ['top-left', 'bottom-right'],
  3: ['top-left', 'center', 'bottom-right'],
  4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
  6: ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right'],
};

const PIP_POSITION = {
  'top-left': 'top-3 left-3',
  'top-right': 'top-3 right-3',
  'mid-left': 'top-1/2 -translate-y-1/2 left-3',
  'mid-right': 'top-1/2 -translate-y-1/2 right-3',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'bottom-left': 'bottom-3 left-3',
  'bottom-right': 'bottom-3 right-3',
};

function Dice({ value, isRolling }) {
  return (
    <div
      className={`relative h-28 w-28 rounded-2xl border-2 bg-white shadow-md transition-transform duration-150 ${
        isRolling ? 'animate-pulse border-emerald-400 scale-105' : 'border-slate-300'
      }`}
    >
      {DICE_FACE[value].map((point) => (
        <span
          key={point}
          className={`absolute h-3.5 w-3.5 rounded-full bg-slate-800 ${PIP_POSITION[point]}`}
        />
      ))}
    </div>
  );
}

export default function DiceRollPrototype() {
  const [ready, setReady] = useState({ a: false, b: false });
  const [values, setValues] = useState({ a: 1, b: 1 });
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);

  const rollIntervalRef = useRef(null);
  const rollTimeoutRef = useRef(null);

  const bothReady = ready.a && ready.b;

  const statusText = useMemo(() => {
    if (rolling) return 'Lanzando dados...';
    if (!result) return 'Esperando confirmacion de ambos capitanes';
    if (result.winner === 'tie') return 'Empate, vuelvan a lanzar';
    return `Gana ${result.winnerName} (${result.winnerTeam})`;
  }, [rolling, result]);

  const toggleReady = (captainId) => {
    if (rolling) return;
    setResult(null);
    setReady((prev) => ({ ...prev, [captainId]: !prev[captainId] }));
  };

  const resetDemo = () => {
    setReady({ a: false, b: false });
    setValues({ a: 1, b: 1 });
    setRolling(false);
    setResult(null);
  };

  const rollDice = () => {
    if (!bothReady || rolling) return;

    setRolling(true);
    setResult(null);

    rollIntervalRef.current = window.setInterval(() => {
      setValues({
        a: 1 + Math.floor(Math.random() * 6),
        b: 1 + Math.floor(Math.random() * 6),
      });
    }, 90);

    rollTimeoutRef.current = window.setTimeout(() => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
      }

      const finalA = 1 + Math.floor(Math.random() * 6);
      const finalB = 1 + Math.floor(Math.random() * 6);

      setValues({ a: finalA, b: finalB });
      setRolling(false);

      if (finalA === finalB) {
        setResult({ winner: 'tie' });
        return;
      }

      const winner = finalA > finalB ? CAPTAINS[0] : CAPTAINS[1];
      setResult({
        winner: winner.id,
        winnerName: winner.name,
        winnerTeam: winner.team,
      });
    }, 1700);
  };

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-lime-100 p-6 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Prototipo UI</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Sorteo con Dado</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cada capitan confirma, se lanzan dos dados y el numero mayor gana la prioridad.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CAPTAINS.map((captain) => {
              const isReady = ready[captain.id];
              const score = values[captain.id];
              const isWinner = result?.winner === captain.id;

              return (
                <div
                  key={captain.id}
                  className={`rounded-xl border p-4 transition ${
                    isWinner ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{captain.team}</p>
                  <p className="mt-1 text-xl font-black text-slate-900">{captain.name}</p>

                  <div className="mt-4 flex items-center gap-4">
                    <Dice value={score} isRolling={rolling} />
                    <div>
                      <p className="text-sm text-slate-500">Resultado</p>
                      <p className="text-4xl font-black text-slate-900 leading-none">{score}</p>
                      {isWinner && <p className="mt-2 text-xs font-bold uppercase text-emerald-700">Ganador</p>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleReady(captain.id)}
                    className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                      isReady
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isReady ? 'Listo' : 'Confirmar listo'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-emerald-700">{statusText}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={rollDice}
                  disabled={!bothReady || rolling}
                  className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  Lanzar Dados
                </button>
                <button
                  type="button"
                  onClick={resetDemo}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Regla del prototipo</h2>
          <ol className="mt-2 space-y-1 text-sm text-slate-600">
            <li>1. Ambos capitanes deben confirmar.</li>
            <li>2. Se lanzan dados simultaneamente.</li>
            <li>3. El valor mas alto gana.</li>
            <li>4. Si hay empate, se repite el lanzamiento.</li>
          </ol>
        </aside>
      </div>
    </div>
  );
}
