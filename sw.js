/* ECNESOFT 영업 방문툴 서비스워커 — 네트워크 우선(항상 최신), 오프라인 시 캐시 폴백 */
const CACHE='ecnesoft-v2';

self.addEventListener('install', e=> self.skipWaiting());

self.addEventListener('activate', e=> e.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch', e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  // 네트워크 우선: 온라인이면 항상 최신, 성공 응답은 캐시에 갱신. 실패 시 캐시 폴백.
  e.respondWith(
    fetch(req).then(res=>{
      if(res && res.status===200 && (res.type==='basic' || res.type==='cors')){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      }
      return res;
    }).catch(()=>caches.match(req))
  );
});
