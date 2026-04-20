/**
 * Service Worker för Val 2026
 * Möjliggör offline-läsning
 */

const CACHE_NAME = 'val2026-v12';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './partier.html',
  './kompass.html',
  './quiz.html',
  './sakfragor.html',
  './tidslinje.html',
  './opinion.html',
  './historik.html',
  './koalition.html',
  './gissa.html',
  './budget.html',
  './rostningar.html',
  './jamfor.html',
  './mandat.html',
  './debatter.html',
  './kandidater.html',
  './om.html',
  './styles.css',
  './app.js',
  './shared/constants.js',
  './components/header.js',
  './tools/compass.js',
  './tools/quiz.js',
  './tools/compare.js',
  './tools/timeline.js',
  './tools/coalition.js',
  './tools/guess.js',
  './tools/pollgraph.js',
  './tools/budget.js',
  './tools/votes.js',
  './tools/history.js',
  './tools/partycompare.js',
  './tools/seatcalc.js',
  './tools/debates.js',
  './tools/candidates.js',
  './data/parties.json',
  './data/debates.json',
  './data/candidates.json',
  './data/compass-positions.json',
  './data/quiz-questions.json',
  './data/issues.json',
  './data/timeline.json',
  './data/quotes.json',
  './data/votes.json',
  './data/budget.json',
  './data/polls-history.json',
  './data/election-history.json',
  './data/constituencies.json',
  './assets/logos/V.png',
  './assets/logos/S.png',
  './assets/logos/MP.png',
  './assets/logos/C.png',
  './assets/logos/L.png',
  './assets/logos/KD.png',
  './assets/logos/M.png',
  './assets/logos/SD.png',
  './assets/favicon.svg',
  './assets/icon-192.svg',
  './manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('./index.html');
      })
  );
});
