import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AddGiftDialog } from '../components/AddGiftDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorState, Loading, ReconnectingBanner } from '../components/StatusMessage';
import { TrashIcon } from '../components/TrashIcon';
import { es } from '../i18n/es';
import { api, ApiError } from '../lib/api';
import type { CreatedGift, Gift, PersonWithGifts } from '../lib/types';
import { isHttpUrl } from '../lib/url';
import { useLatestRequest } from '../lib/useLatestRequest';
import { ChangePayload, TableName, useRealtime } from '../lib/useRealtime';
import { useToast } from '../lib/useToast';

const byNewest = (a: Gift, b: Gift) => b.createdAt.localeCompare(a.createdAt);

function rowToGift(row: Record<string, unknown>): Gift {
  return {
    id: String(row.id),
    personId: String(row.person_id),
    name: String(row.name),
    url: typeof row.url === 'string' ? row.url : null,
    store: typeof row.store === 'string' ? row.store : null,
    createdAt: String(row.created_at),
  };
}

export function PersonPage() {
  const { id = '' } = useParams();
  const [person, setPerson] = useState<PersonWithGifts | null>(null);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<Gift | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const run = useLatestRequest();
  const toast = useToast();
  const navigate = useNavigate();

  const markFresh = (giftId: string) => {
    setFresh((s) => new Set(s).add(giftId));
    setTimeout(
      () =>
        setFresh((s) => {
          const next = new Set(s);
          next.delete(giftId);
          return next;
        }),
      2000,
    );
  };

  const addGift = useCallback((gift: Gift) => {
    setPerson((p) => {
      if (!p || gift.personId !== p.id || p.gifts.some((g) => g.id === gift.id)) return p;
      return { ...p, gifts: [gift, ...p.gifts].sort(byNewest) };
    });
  }, []);

  const removeGift = useCallback((giftId: string) => {
    setPerson((p) => (p ? { ...p, gifts: p.gifts.filter((g) => g.id !== giftId) } : p));
  }, []);

  const load = useCallback(() => {
    run(
      () => api.getPerson(id),
      (data) => {
        setPerson(data);
        setError(null);
      },
      (e) =>
        setError({
          message: e instanceof Error ? e.message : es.person.loadError,
          notFound: e instanceof ApiError && (e.status === 404 || e.status === 400),
        }),
    );
  }, [id, run]);

  useEffect(() => {
    setPerson(null);
    setError(null);
    load();
  }, [load]);

  const onChange = useCallback(
    (table: TableName, payload: ChangePayload) => {
      if (table !== 'gifts') return;
      if (payload.eventType === 'INSERT') {
        const gift = rowToGift(payload.new);
        if (gift.personId === id) {
          addGift(gift);
          markFresh(gift.id);
        }
      } else if (payload.eventType === 'DELETE') {
        const oldId = (payload.old as { id?: string }).id;
        if (oldId) removeGift(oldId);
      }
    },
    [id, addGift, removeGift],
  );

  const disconnected = useRealtime({ onChange, onResync: load });

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.deleteGift(toDelete.id);
      removeGift(toDelete.id);
      setToDelete(null);
      toast(es.confirmDelete.deleted);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        // Someone else already deleted it.
        removeGift(toDelete.id);
        setToDelete(null);
        toast(e.message, 'error');
      } else {
        setDeleteError(e instanceof Error ? e.message : es.errors.generic);
      }
    } finally {
      setDeleting(false);
    }
  }

  function handleCreated(gift: CreatedGift) {
    setDialogOpen(false);
    toast(es.form.success(gift.name, gift.person.name));
    if (gift.person.id === id) {
      addGift(gift);
      markFresh(gift.id);
    } else {
      navigate(`/persona/${gift.person.id}`);
    }
  }

  const dateFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' });

  return (
    <main id="contenido">
      <header className="band">
        <div className="band__inner">
          <nav>
            <Link to="/" className="button button--on-dark button--sm" aria-label={es.person.backLabel}>
              {es.person.back}
            </Link>
          </nav>
          {person && (
            <>
              <h1 className="band__title">{es.person.heading(person.name)}</h1>
              <p className="band__count">{es.giftCount(person.gifts.length)}</p>
              <button type="button" className="button button--gold" onClick={() => setDialogOpen(true)}>
                <span aria-hidden="true">🎁</span> {es.person.addGift}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="page">
      <ReconnectingBanner show={disconnected} />

      {error && !person ? (
        error.notFound ? (
          <div className="status">
            <p>{es.person.notFound}</p>
            <Link to="/" className="button button--primary">
              {es.person.goHome}
            </Link>
          </div>
        ) : (
          <ErrorState message={error.message || es.person.loadError} onRetry={load} />
        )
      ) : !person ? (
        <Loading />
      ) : (
        <>
          {person.gifts.length === 0 ? (
            <p className="empty">
              <span className="empty__emoji" aria-hidden="true">
                🎄
              </span>
              {es.person.empty}
            </p>
          ) : (
            <ul className="gift-list">
              {person.gifts.map((g) => (
                <li key={g.id} className={`gift${fresh.has(g.id) ? ' gift--new' : ''}`}>
                  <span className="gift__icon" aria-hidden="true">
                    🎁
                  </span>
                  <div className="gift__body">
                    <p className="gift__name">{g.name}</p>
                    {g.url && isHttpUrl(g.url) ? (
                      <a
                        className="gift__link"
                        href={g.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={es.person.viewInStoreLabel(g.name, g.store)}
                      >
                        {es.person.viewInStore(g.store)} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      g.store && <p className="gift__store">{es.person.findAt(g.store)}</p>
                    )}
                    <p className="gift__date">{es.person.addedOn(dateFormat.format(new Date(g.createdAt)))}</p>
                  </div>
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    onClick={() => {
                      setDeleteError('');
                      setToDelete(g);
                    }}
                    aria-label={es.person.deleteLabel(g.name)}
                    title={es.person.deleteLabel(g.name)}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        giftName={toDelete?.name}
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
      <AddGiftDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={handleCreated} />
    </main>
  );
}
