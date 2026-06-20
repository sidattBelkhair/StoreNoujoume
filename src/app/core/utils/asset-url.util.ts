import { environment } from '../../../environments/environment';

const STORAGE_BASE_URL = environment.storageBaseUrl;

// L'API renvoie icon_url en chemin relatif (ex: /storage/app-icons/x.jpg)
// alors que screenshots/avatar_url sont déjà des URLs absolues.
export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  return /^https?:\/\//.test(url) ? url : `${STORAGE_BASE_URL}${url}`;
}
