let url = window.location.href;
let swDirect = "/20213-PWA-MALF-U2-P5/sw.js";

if (navigator.serviceWorker) {
  if (url.includes("localhost")) {
    swDirect = "/sw.js";
  }
  navigator.serviceWorker.register(swDirect);
} else {
  console.log("Ups, cambia de navegador");
}
