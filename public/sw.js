let o="",i="",s="",n="",t="global-data-cache",c=0,r={},e=(self.addEventListener("message",a=>{var t,e;"INIT_DATA"===a.data?.type&&({API_DOMAIN:t,APP_VERSION:e}=a.data.payload,o=t,i=e,s="cache-v"+i,n=o+"/api/domain",console.log("Service Worker received INIT_DATA:",{apiDomain:o,appVersion:i,CACHE_NAME:s,API_URL:n}),p()),"GET_GLOBAL_DATA"===a.data?.type&&a.ports[0].postMessage(r)}),a=>JSON.stringify(a)!==JSON.stringify(r)),l=a=>{"granted"===Notification.permission?self.registration.showNotification("Data Updated",{body:"New data is available!",icon:"/icon.png",data:{url:"https://your-website.com"}}):console.warn("No notification permission granted.")},d=async()=>{var a=await(await caches.open(t)).match("globalData");return a?(a=await a.json(),console.log("Retrieved global data from cache:",a),a):{}},g=async a=>{await(await caches.open(t)).put("globalData",new Response(JSON.stringify(a))),console.log("Stored global data to cache:",a)},p=async()=>{if(o&&i)try{var a;r=await d()||{},0===Object.keys(r).length&&(a=await fetch(n),r=await a.json(),await g(r)),console.log("Initialized global data:",r),(await self.clients.matchAll()).forEach(a=>{a.postMessage({type:"GLOBAL_DATA_INITIALIZE",data:r})})}catch(a){console.error("Error initializing global data:",a)}else console.warn("API_DOMAIN or APP_VERSION is not set. Initialization skipped.")},A=async()=>{if(n)try{var a=await(await fetch(n)).json();e(a)&&(r=a,await g(r),(await self.clients.matchAll()).forEach(a=>a.postMessage({type:"GLOBAL_DATA_UPDATE",data:r})),l(a),c+=a.count||1,navigator.setAppBadge?.(c).catch(console.error))}catch(a){console.error("Error syncing data:",a)}else console.warn("API_URL is not set. Synchronization skipped.")},a=(self.addEventListener("activate",a=>{console.log("Service Worker activating..."),a.waitUntil((async()=>{var a=await caches.keys();await Promise.all(a.map(a=>{if(a!==s)return caches.delete(a)})),await self.clients.claim()})())}),self.addEventListener("sync",a=>{console.log("Sync event triggered: "+a.tag),"sync-data"===a.tag&&a.waitUntil(A())}),self.addEventListener("message",a=>{"GET_GLOBAL_DATA"===a.data?.type&&a.ports[0].postMessage(r)}),self.addEventListener("push",a=>{var t,e;a.data&&(t=a.data.json(),console.log("Push event data:",t),e={body:t.body,icon:t.icon||"/icon.png",badge:"/badge.png",vibrate:[100,50,100],data:{url:t.url||"https://your-website.com"}},c+=t.count||1,navigator.setAppBadge?.(c).catch(console.error),a.waitUntil(self.registration.showNotification(t.title,e)))}),async(t,e)=>{(await self.clients.matchAll()).forEach(a=>{a.postMessage({type:t,data:e})})});