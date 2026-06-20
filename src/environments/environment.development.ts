export const environment = {
  production: false,
  // En dev, on passe par le proxy Angular (proxy.conf.json) plutôt que d'appeler
  // noujoumstore.com directement : ça évite le blocage WAF "Tiger Protect"
  // d'o2switch, qui considère les requêtes cross-origin venant de localhost
  // comme suspectes. Le proxy relaie côté serveur, donc le navigateur ne voit
  // qu'une requête same-origin.
  apiUrl: '/api',
  // Le proxy ne couvre que /api : les images servies sous /storage doivent
  // toujours pointer vers le vrai domaine.
  storageBaseUrl: 'https://noujoumstore.com',
  appName: 'Noujoum Store (dev)',
};
