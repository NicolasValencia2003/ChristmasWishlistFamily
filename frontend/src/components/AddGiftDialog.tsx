import { FormEvent, useEffect, useRef, useState } from 'react';
import { es } from '../i18n/es';
import { api } from '../lib/api';
import { getSavedName, saveName } from '../lib/storage';
import type { CreatedGift } from '../lib/types';
import { isHttpUrl, withProtocol } from '../lib/url';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (gift: CreatedGift) => void;
}

type Field = 'personName' | 'giftName' | 'url' | 'store' | 'details';
type Errors = Partial<Record<Field, string>>;

const MAX = 60;
const DETAILS_MAX = 300;
const t = es.form;

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  const personName = values.personName.trim();
  const giftName = values.giftName.trim();
  if (!personName) errors.personName = t.errors.personNameRequired;
  else if (personName.length > MAX) errors.personName = t.errors.max;
  if (!giftName) errors.giftName = t.errors.giftNameRequired;
  else if (giftName.length > MAX) errors.giftName = t.errors.max;
  const url = values.url.trim();
  const store = values.store.trim();
  if (!url && !store) errors.url = t.errors.linkOrStoreRequired;
  else if (url && !isHttpUrl(withProtocol(url))) errors.url = t.errors.urlInvalid;
  if (store.length > MAX) errors.store = t.errors.max;
  if (values.details.trim().length > DETAILS_MAX) errors.details = t.errors.detailsMax;
  return errors;
}

export function AddGiftDialog({ open, onClose, onCreated }: Props) {
  const [values, setValues] = useState<Record<Field, string>>({
    personName: '',
    giftName: '',
    url: '',
    store: '',
    details: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const giftRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const storeRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);

  // Reset the form (with the remembered name) every time it opens.
  useEffect(() => {
    if (!open) return;
    const saved = getSavedName();
    setValues({ personName: saved, giftName: '', url: '', store: '', details: '' });
    setErrors({});
    setServerError('');
    requestAnimationFrame(() => (saved ? giftRef : nameRef).current?.focus());
  }, [open]);

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    // Typing a store also clears the "link or store required" error shown on the link field.
    const clears: Field[] = field === 'store' && errors.url === t.errors.linkOrStoreRequired ? [field, 'url'] : [field];
    if (clears.some((f) => errors[f])) {
      setErrors((er) => ({ ...er, ...Object.fromEntries(clears.map((f) => [f, undefined])) }));
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setServerError('');
    if (found.personName) return nameRef.current?.focus();
    if (found.giftName) return giftRef.current?.focus();
    if (found.url) return urlRef.current?.focus();
    if (found.store) return storeRef.current?.focus();
    if (found.details) return detailsRef.current?.focus();

    setSubmitting(true);
    try {
      const gift = await api.createGift({
        personName: values.personName.trim(),
        giftName: values.giftName.trim(),
        url: values.url.trim() ? withProtocol(values.url) : null,
        store: values.store.trim().replace(/\s+/g, ' ') || null,
        details: values.details.trim() || null,
      });
      saveName(values.personName.trim().replace(/\s+/g, ' '));
      onCreated(gift);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : es.errors.generic);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldProps = (field: Field) => ({
    id: `gift-${field}`,
    value: values[field],
    onChange: set(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby':
      [errors[field] && `gift-${field}-error`, (field === 'url' || field === 'store') && 'gift-link-hint']
        .filter(Boolean)
        .join(' ') || undefined,
    disabled: submitting,
  });

  return (
    <Modal open={open} title={t.title} onClose={onClose} busy={submitting}>
      <p className="modal__intro">{t.intro}</p>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="gift-personName">{t.personName}</label>
          <input
            ref={nameRef}
            {...fieldProps('personName')}
            type="text"
            autoComplete="given-name"
            maxLength={MAX}
            placeholder={t.personNamePlaceholder}
          />
          {errors.personName && (
            <p id="gift-personName-error" className="field__error">
              {errors.personName}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="gift-giftName">{t.giftName}</label>
          <input
            ref={giftRef}
            {...fieldProps('giftName')}
            type="text"
            autoComplete="off"
            maxLength={MAX}
            placeholder={t.giftNamePlaceholder}
          />
          {errors.giftName && (
            <p id="gift-giftName-error" className="field__error">
              {errors.giftName}
            </p>
          )}
        </div>

        <p id="gift-link-hint" className="field__hint">
          {t.linkOrStoreHint}
        </p>

        <div className="field">
          <label htmlFor="gift-url">
            {t.url} <span className="field__optional">{t.optional}</span>
          </label>
          <input
            ref={urlRef}
            {...fieldProps('url')}
            type="url"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={t.urlPlaceholder}
          />
          {errors.url && (
            <p id="gift-url-error" className="field__error">
              {errors.url}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="gift-store">
            {t.store} <span className="field__optional">{t.optional}</span>
          </label>
          <input
            ref={storeRef}
            {...fieldProps('store')}
            type="text"
            autoComplete="off"
            maxLength={MAX}
            placeholder={t.storePlaceholder}
          />
          {errors.store && (
            <p id="gift-store-error" className="field__error">
              {errors.store}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="gift-details">
            {t.details} <span className="field__optional">{t.optional}</span>
          </label>
          <textarea
            ref={detailsRef}
            {...fieldProps('details')}
            rows={3}
            maxLength={DETAILS_MAX}
            placeholder={t.detailsPlaceholder}
          />
          {errors.details && (
            <p id="gift-details-error" className="field__error">
              {errors.details}
            </p>
          )}
        </div>

        {serverError && (
          <p className="alert alert--error" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="button button--primary button--block" disabled={submitting}>
          {submitting ? t.submitting : t.submit}
        </button>
      </form>
    </Modal>
  );
}
