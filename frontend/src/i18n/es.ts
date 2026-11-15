/**
 * All user-facing text for the website (Latin American Spanish, "tú").
 * Edit the strings here to change what the family sees.
 */
export const es = {
  meta: {
    title: 'Lista de Regalos de Navidad de la Familia 🎄',
  },
  common: {
    loading: 'Cargando...',
    retry: 'Intentar de nuevo',
    close: 'Cerrar',
    cancel: 'Cancelar',
    reconnecting: 'Reconectando para ver los cambios en vivo...',
    skipToContent: 'Saltar al contenido',
  },
  home: {
    title: 'Lista de Regalos de Navidad de la Familia',
    titleEmoji: '🎄',
    subtitle: 'Toca un nombre para ver lo que le gustaría recibir esta Navidad.',
    addGift: 'Agregar un regalo',
    peopleHeading: 'La familia',
    empty: 'Todavía no hay nadie en la lista. ¡Agrega el primer regalo y aparecerás aquí!',
    loadError: 'No pudimos cargar la lista de la familia.',
    openList: (name: string) => `Ver la lista de ${name}`,
  },
  giftCount: (n: number) => (n === 0 ? 'Sin regalos aún' : n === 1 ? '1 regalo' : `${n} regalos`),
  person: {
    back: '← Volver',
    backLabel: 'Volver a la familia',
    heading: (name: string) => `Lo que quiere ${name}`,
    empty: 'Aún no hay nada aquí, ¡sé el primero en agregar algo!',
    loadError: 'No pudimos cargar esta lista.',
    notFound: 'No encontramos a esta persona. Quizás el enlace está mal escrito.',
    goHome: 'Ir al inicio',
    viewInStore: 'Ver en la tienda',
    viewInStoreLabel: (gift: string) => `Ver ${gift} en la tienda (se abre en una pestaña nueva)`,
    deleteLabel: (gift: string) => `Eliminar regalo: ${gift}`,
    addGift: 'Agregar un regalo',
    addedOn: (date: string) => `Agregado el ${date}`,
  },
  form: {
    title: 'Agregar a mi lista',
    intro: 'Escribe tu nombre y el regalo que te gustaría. Si tu nombre ya está, lo sumamos a tu lista.',
    personName: 'Tu nombre',
    personNamePlaceholder: 'Ej.: María',
    giftName: 'Nombre del regalo',
    giftNamePlaceholder: 'Ej.: Juego de Nintendo Switch',
    url: 'Enlace de la tienda',
    urlPlaceholder: 'https://www.tienda.com/producto',
    urlHint: 'Copia y pega el enlace del producto.',
    submit: 'Agregar a mi lista',
    submitting: 'Agregando...',
    success: (gift: string, person: string) => `¡Listo! Agregamos «${gift}» a la lista de ${person}.`,
    errors: {
      personNameRequired: 'Tu nombre es obligatorio',
      giftNameRequired: 'El nombre del regalo es obligatorio',
      urlRequired: 'El enlace es obligatorio',
      urlInvalid: 'El enlace debe ser una URL válida (http o https)',
      max: 'Máximo 60 caracteres',
    },
  },
  confirmDelete: {
    title: 'Eliminar regalo',
    message: '¿Seguro que quieres eliminar este regalo?',
    confirm: 'Sí, eliminar',
    deleting: 'Eliminando...',
    deleted: 'Regalo eliminado.',
  },
  errors: {
    network: 'No pudimos conectarnos con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.',
    generic: 'Algo salió mal. Inténtalo de nuevo en un momento.',
  },
  notFoundPage: {
    title: 'Página no encontrada',
    message: 'Parece que esta página se perdió en la nieve. ❄️',
  },
} as const;
