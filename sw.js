/* Offline-first, local-only cache. Pin assets including Vite's content-hashed JS bundle. */
const CACHE='kanji-poc-r20250816-v01';
self.addEventListener('install', event => {event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const base=new URL('./',self.registration.scope);
 const page=await fetch(new URL('index.html',base),{cache:'reload'});
 if(!page.ok) throw Error('Cannot cache application shell');
 const html=await page.text();
 const paths=['./','./index.html','./style.css','./data/kanjivg-paths.json','./manifest.webmanifest','./NOTICE.txt','./LICENSE-THIRD-PARTY.txt','./icon-192.png','./icon-512.png'];
 for (const m of html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))["']/g)) {
   const url=new URL(m[1],base);if(url.origin===base.origin&&url.pathname.startsWith(base.pathname))paths.push(url.href);
 }
 await cache.addAll([...new Set(paths.map(x=>new URL(x,base).href))]);
 await self.skipWaiting();
 })());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE&&k.startsWith('kanji-poc-')).map(k=>caches.delete(k)));await self.clients.claim();
})());});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(req);if(hit)return hit;try{
  const res=await fetch(req);if(res.ok)cache.put(req,res.clone());return res;
 }catch{return new Response('Offline asset unavailable',{status:503});}})());});
