const MY_NAME_KEY = 'regalos-navidad:my-name';

export function getSavedName(): string {
  try {
    return localStorage.getItem(MY_NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(MY_NAME_KEY, name);
  } catch {
    /* storage unavailable (private mode): ignore */
  }
}
