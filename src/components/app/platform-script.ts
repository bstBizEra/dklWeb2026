// Runs before the first paint, so Android phones never flash the iOS look: marks <html data-platform>
// and gives the Android status bar the Material surface colour. Everything else stays iOS style.
// It also holds Chrome's install prompt, which can fire before React loads, for the Install button.
// And it sets <html lang="lo"> on /app/lo/... (the layout renders "en"): the language switch always
// loads a new page, so this runs on every change of language.
export const platformScript = `(function(){try{if(/^\\/app\\/lo(\\/|$)/.test(location.pathname))document.documentElement.lang="lo";var a=/Android/i.test(navigator.userAgent);document.documentElement.dataset.platform=a?"android":"ios";window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__dklaoInstall=e;window.dispatchEvent(new Event("dklao-install-ready"))});if(!a)return;var t=function(){var m=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<m.length;i++){m[i].setAttribute("content",/dark/.test(m[i].media)?"#111318":"#f9f9ff")}};t();document.addEventListener("DOMContentLoaded",t)}catch(e){}})();`;
