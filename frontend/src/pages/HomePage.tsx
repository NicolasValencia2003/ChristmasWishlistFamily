import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AddGiftDialog } from '../components/AddGiftDialog';
import { ErrorState, Loading, ReconnectingBanner } from '../components/StatusMessage';
import { es } from '../i18n/es';
import { api } from '../lib/api';
import type { CreatedGift, PersonSummary } from '../lib/types';
import { useLatestRequest } from '../lib/useLatestRequest';
import { useRealtime } from '../lib/useRealtime';
import { useToast } from '../lib/useToast';

export function HomePage() {
  const [people, setPeople] = useState<PersonSummary[] | null>(null);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  // Ids/counts that changed live, used to play a small highlight animation.
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const previous = useRef<Map<string, number> | null>(null);
  const run = useLatestRequest();
  const toast = useToast();
  const navigate = useNavigate();

  const load = useCallback(() => {
    run(
      api.listPeople,
      (list) => {
        const prev = previous.current;
        if (prev) {
          const changed = list.filter((p) => prev.get(p.id) !== p.giftCount).map((p) => p.id);
          if (changed.length) {
            setFresh(new Set(changed));
            setTimeout(() => setFresh(new Set()), 1600);
          }
        }
        previous.current = new Map(list.map((p) => [p.id, p.giftCount]));
        setPeople(list);
        setError('');
      },
      (e) => setError(e instanceof Error ? e.message : es.home.loadError),
    );
  }, [run]);

  useEffect(() => {
    load();
  }, [load]);

  // Any insert/delete on people or gifts changes names or counts: refetch (debounced).
  const timer = useRef<number>();
  const scheduleLoad = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(load, 150);
  }, [load]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const disconnected = useRealtime({ onChange: scheduleLoad, onResync: scheduleLoad });

  function handleCreated(gift: CreatedGift) {
    setDialogOpen(false);
    toast(es.form.success(gift.name, gift.person.name));
    navigate(`/persona/${gift.person.id}`);
  }

  return (
    <main id="contenido">
      <header className="hero">
        <div className="hero__inner">
          <p className="hero__eyebrow" aria-hidden="true">
            ✨ ⭐ ✨
          </p>
          <h1 className="hero__title">
            {es.home.title} <span aria-hidden="true">{es.home.titleEmoji}</span>
          </h1>
          <p className="hero__subtitle">{es.home.subtitle}</p>
          <button type="button" className="button button--gold button--lg" onClick={() => setDialogOpen(true)}>
            <span aria-hidden="true">🎁</span> {es.home.addGift}
          </button>
        </div>
      </header>

      <div className="page">
      <ReconnectingBanner show={disconnected} />

      <section aria-labelledby="people-heading">
        <h2 id="people-heading" className="visually-hidden">
          {es.home.peopleHeading}
        </h2>
        {error && !people ? (
          <ErrorState message={error || es.home.loadError} onRetry={load} />
        ) : !people ? (
          <Loading />
        ) : people.length === 0 ? (
          <p className="empty">
            <span className="empty__emoji" aria-hidden="true">
              ⛄
            </span>
            {es.home.empty}
          </p>
        ) : (
          <ul className="people-grid">
            {people.map((p) => (
              <li key={p.id} className={fresh.has(p.id) ? 'pop-in' : undefined}>
                <Link to={`/persona/${p.id}`} className="person-card" aria-label={es.home.openList(p.name)}>
                  <span className="person-card__avatar" aria-hidden="true">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="person-card__name">{p.name}</span>
                  <span className={`person-card__count${p.giftCount === 0 ? ' is-empty' : ''}`}>
                    {es.giftCount(p.giftCount)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>

      <AddGiftDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={handleCreated} />
    </main>
  );
}
