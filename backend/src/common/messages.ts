/**
 * User-facing API messages (Spanish). The frontend shows these directly.
 */
export const MSG = {
  personNameRequired: 'Tu nombre es obligatorio',
  personNameText: 'Tu nombre debe ser texto',
  personNameMax: 'Tu nombre puede tener máximo 60 caracteres',
  giftNameRequired: 'El nombre del regalo es obligatorio',
  giftNameText: 'El nombre del regalo debe ser texto',
  giftNameMax: 'El nombre del regalo puede tener máximo 60 caracteres',
  linkOrStoreRequired: 'Agrega el enlace del regalo o el nombre de la tienda',
  storeText: 'El nombre de la tienda debe ser texto',
  storeMax: 'El nombre de la tienda puede tener máximo 60 caracteres',
  detailsText: 'Las especificaciones deben ser texto',
  detailsMax: 'Las especificaciones pueden tener máximo 300 caracteres',
  urlInvalid: 'El enlace debe ser una URL válida (http o https)',
  urlMax: 'El enlace es demasiado largo (máximo 2000 caracteres)',
  invalidId: 'El identificador no es válido',
  personNotFound: 'No encontramos a esta persona',
  giftNotFound: 'Este regalo ya no existe (quizás alguien lo eliminó)',
  badRequest: 'La solicitud no es válida',
  notFound: 'No encontramos lo que buscas',
  tooLarge: 'La solicitud es demasiado grande',
  server: 'Algo salió mal en el servidor. Inténtalo de nuevo en un momento.',
  database: 'No pudimos guardar o leer los datos. Inténtalo de nuevo en un momento.',
} as const;
