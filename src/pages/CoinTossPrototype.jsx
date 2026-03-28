import { useEffect, useMemo, useRef, useState } from 'react';

const CAPTAINS = [
  { id: 'a', team: 'Ingenieria FC', name: 'Alex Johnson', side: 'CARA' },
  { id: 'b', team: 'Los Halcones', name: 'Maria Perez', side: 'SELLO' },
];

const STORAGE_KEY = 'coin-toss-prototype-v1';
const CHANNEL_NAME = 'coin-toss-prototype';

const INITIAL_SESSION = {
  ready: { a: false, b: false },
  isFlipping: false,
  result: null,
  rotation: 0,
  updatedAt: 0,
};

export default function CoinTossPrototype() {
  const [session, setSession] = useState(INITIAL_SESSION);
  const channelRef = useRef(null);

  const { ready, isFlipping, result, rotation } = session;
  const bothReady = ready.a && ready.b;

  const persistAndBroadcast = (nextSession) => {
    const enriched = {
      ...nextSession,
      updatedAt: Date.now(),
    };
    setSession(enriched);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
    if (channelRef.current) {
      channelRef.current.postMessage(enriched);
    }
  };

  useEffect(() => {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage) {
      try {
        const parsed = JSON.parse(fromStorage);
        setSession((prev) => ({ ...prev, ...parsed }));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if ('BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        const incoming = event.data;
        if (!incoming?.updatedAt) return;
        setSession((prev) => {
          if ((prev.updatedAt || 0) >= incoming.updatedAt) return prev;
          return incoming;
        });
      };
    }

    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const incoming = JSON.parse(event.newValue);
        setSession((prev) => {
          if ((prev.updatedAt || 0) >= (incoming.updatedAt || 0)) return prev;
          return incoming;
        });
      } catch {
    
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, []);

  const phase = useMemo(() => {
    if (isFlipping) return 'Lanzando moneda...';
    if (result) return `Resultado: ${result.side}`;
    return 'Esperando confirmacion de capitanes';
  }, [isFlipping, result]);

  const toggleReady = (captainId) => {
    if (isFlipping) return;
    const nextReady = { ...ready, [captainId]: !ready[captainId] };
    persistAndBroadcast({
      ...session,
      ready: nextReady,
      result: null,
    });
  };

  const reset = () => {
    persistAndBroadcast(INITIAL_SESSION);
  };

  const toss = () => {
    if (!bothReady || isFlipping) return;

    const spins = 6 + Math.floor(Math.random() * 5);
    const winner = Math.random() < 0.5 ? CAPTAINS[0] : CAPTAINS[1];
    const finalY = winner.side === 'CARA' ? 0 : 180;
    const nextRotation = rotation + spins * 360 + finalY;

    persistAndBroadcast({
      ...session,
      isFlipping: true,
      result: null,
      rotation: nextRotation,
    });

    window.setTimeout(() => {
      persistAndBroadcast({
        ...session,
        ready,
        isFlipping: false,
        rotation: nextRotation,
        result: { side: winner.side, captain: winner.name, team: winner.team },
      });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50 to-slate-100 p-6 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Prototipo UI</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Lanzamiento de Moneda</h1>
          <p className="mt-1 text-sm text-slate-500">Demo frontend sin backend para visualizar animacion.</p>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {CAPTAINS.map((captain) => {
                const isReady = ready[captain.id];
                return (
                  <div key={captain.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{captain.team}</p>
                    <p className="mt-1 text-xl font-black text-slate-900">{captain.name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-emerald-700">Elige: {captain.side}</p>

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

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="mx-auto flex w-full max-w-sm flex-col items-center">
                <div className="relative h-40 w-40" style={{ perspective: '1000px' }}>
                  <div
                    className="relative h-full w-full"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: `translateY(${isFlipping ? -12 : 0}px) rotateX(${isFlipping ? 18 : 0}deg) rotateY(${rotation}deg)`,
                      transition: isFlipping
                        ? 'transform 1.8s cubic-bezier(0.15, 0.82, 0.2, 1)'
                        : 'transform 0.28s ease-out',
                    }}
                  >
                    <div
                      className="absolute inset-0 grid place-items-center rounded-full border-4 border-yellow-200 bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 text-lg font-black text-slate-800 shadow-lg"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      CARA
                    </div>
                    <div
                      className="absolute inset-0 grid place-items-center rounded-full border-4 border-lime-200 bg-gradient-to-br from-lime-200 via-emerald-400 to-green-600 text-lg font-black text-white shadow-lg"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      SELLO
                    </div>
                  </div>
                </div>

                <div className="mt-5 min-h-14 text-center">
                  <p className="text-sm font-semibold text-emerald-700">{phase}</p>
                  {result && (
                    <p className="mt-1 text-sm text-slate-600">
                      Gana {result.captain} ({result.team})
                    </p>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={toss}
                    disabled={!bothReady || isFlipping}
                    className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    Lanzar Moneda
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Regla del prototipo</h2>
              <ol className="mt-3 space-y-2 text-sm text-slate-600">
                <li>1. Ambos capitanes confirman que estan listos.</li>
                <li>2. Se habilita el boton de lanzamiento.</li>
                <li>3. La moneda gira y publica el ganador.</li>
              </ol>
            </div>

          </aside>
        </section>
      </div>
    </div>
  );
}
