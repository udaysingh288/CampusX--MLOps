(()=>{function U(t){let e=document.querySelector(t);if(!e)throw`Pirsch script ${t} tag not found!`;return e}function v(t,e){let n="";return t.length>0&&(e<t.length?n=t[e]:n=t[t.length-1]),n}function C(t){return Z()||Q(t)||!tt(t)||et(t)}function w(t){return t?t=location.href.replace(location.hostname,t):t=location.href,t}function b(t,e){t||(t=location.href),e||(e="");let n=new URL(t);return n.pathname=e+n.pathname,n.toString()}function L(t){let e=document.referrer;return t&&(e=e.replace(location.hostname,t)),e}function Z(){return navigator.doNotTrack==="1"||localStorage.getItem("disable_pirsch")}function Q(t){return!t.hasAttribute("data-dev")&&(/^localhost(.*)$|^127(\.[0-9]{1,3}){3}$/is.test(location.hostname)||location.protocol==="file:")?(console.info("Pirsch is ignored on localhost. Add the data-dev attribute to enable it."),!0):!1}function tt(t){try{let e=t.getAttribute("data-include"),n=e?e.split(","):[];if(n.length){let i=!1;for(let c=0;c<n.length;c++)if(new RegExp(n[c]).test(location.pathname)){i=!0;break}if(!i)return!1}}catch(e){console.error(e)}return!0}function et(t){try{let e=t.getAttribute("data-exclude"),n=e?e.split(","):[];for(let i=0;i<n.length;i++)if(new RegExp(n[i]).test(location.pathname))return!0}catch(e){console.error(e)}return!1}function D(t,e,n,i,c,a,o,d,u){if(history.pushState&&!u){let l=history.pushState;history.pushState=function(g,m,f){l.apply(this,[g,m,f]),y(t,e,n,i,c,a,o,d)},window.addEventListener("popstate",()=>y(t,e,n,i,c,a,o,d))}document.body?y(t,e,n,i,c,a,o,d):window.addEventListener("DOMContentLoaded",()=>y(t,e,n,i,c,a,o,d))}function y(t,e,n,i,c,a,o,d){O(e,t.length?"":v(n,0),i,c,a,o,d);for(let u=0;u<t.length;u++)O(t[u],v(n,u),i,c,a,o,d)}function O(t,e,n,i,c,a,o){let d=L(t);t=w(t),t=b(t,e),c&&(t=t.includes("?")?t.split("?")[0]:t);let u=i+"?nc="+new Date().getTime()+"&code="+n+"&url="+encodeURIComponent(t.substring(0,1800))+"&t="+encodeURIComponent(document.title)+"&ref="+(a?"":encodeURIComponent(d))+"&w="+(o?"":screen.width)+"&h="+(o?"":screen.height),l=new XMLHttpRequest;l.open("GET",u),l.send()}function _(){window.pirsch=function(t,e){return console.log(`Pirsch event: ${t}${e?" "+JSON.stringify(e):""}`),Promise.resolve(null)}}function F(t,e,n,i,c,a,o,d){window.pirsch=function(u,l){return typeof u!="string"||!u?Promise.reject("The event name for Pirsch is invalid (must be a non-empty string)! Usage: pirsch('event name', {duration: 42, meta: {key: 'value'}})"):new Promise((g,m)=>{let f=l&&l.meta?l.meta:{};for(let h in f)f.hasOwnProperty(h)&&(f[h]=String(f[h]));T(e,t.length?"":v(n,0),i,c,a,o,d,u,l,f,g,m);for(let h=0;h<t.length;h++)T(t[h],v(n,h),i,c,a,o,d,u,l,f,g,m)})}}function T(t,e,n,i,c,a,o,d,u,l,g,m){let f=L(t);t=w(t),t=b(t,e),c&&(t=t.includes("?")?t.split("?")[0]:t),navigator.sendBeacon(i,JSON.stringify({identification_code:n,url:t.substring(0,1800),title:document.title,referrer:a?"":encodeURIComponent(f),screen_width:o?0:screen.width,screen_height:o?0:screen.height,event_name:d,event_duration:u&&u.duration&&typeof u.duration=="number"?u.duration:0,event_meta:l}))?g():m("error queuing event request")}function W(t,e,n,i,c,a,o){let d=Number.parseInt(t.getAttribute("data-interval-ms"),10)||6e4,u=setInterval(()=>{nt(e,n,i,c,a,o)},d);window.pirschClearSession=()=>{clearInterval(u)}}function nt(t,e,n,i,c,a){R(e,t.length?"":v(n,0),i,c,a);for(let o=0;o<t.length;o++)R(t[o],v(n,o),i,c,a)}function R(t,e,n,i,c){t=w(t),t=b(t,e),c&&(t=t.includes("?")?t.split("?")[0]:t);let a=i+"?nc="+new Date().getTime()+"&code="+n+"&url="+encodeURIComponent(t.substring(0,1800)),o=new XMLHttpRequest;o.open("POST",a),o.send()}(function(){"use strict";_();let t=U("#pirschextendedjs");if(C(t))return;let e=["7z","avi","csv","docx","exe","gz","key","midi","mov","mp3","mp4","mpeg","pdf","pkg","pps","ppt","pptx","rar","rtf","txt","wav","wma","wmv","xlsx","zip"].concat(t.getAttribute("data-download-extensions")?.split(",")||[]),n=t.getAttribute("data-hit-endpoint")||"https://api.pirsch.io/hit",i=t.getAttribute("data-event-endpoint")||"https://api.pirsch.io/event",c=t.getAttribute("data-session-endpoint")||"https://api.pirsch.io/session",a=t.getAttribute("data-code")||"not-set",o=t.getAttribute("data-domain")?t.getAttribute("data-domain").split(",")||[]:[],d=t.hasAttribute("data-disable-page-views"),u=t.hasAttribute("data-disable-query"),l=t.hasAttribute("data-disable-referrer"),g=t.hasAttribute("data-disable-resolution"),m=t.hasAttribute("data-disable-history"),f=t.hasAttribute("data-disable-outbound-links"),h=t.hasAttribute("data-disable-downloads"),M=t.hasAttribute("data-enable-sessions"),P=t.getAttribute("data-dev"),S=t.getAttribute("data-path-prefix")?t.getAttribute("data-path-prefix").split(",")||[]:[],k=t.getAttribute("data-outbound-link-event-name")||"Outbound Link Click",N=t.getAttribute("data-download-event-name")||"File Download",$=t.getAttribute("data-not-found-event-name")||"404 Page Not Found";d||D(o,P,S,a,n,u,l,g,m),M&&W(t,o,P,S,a,c,u),F(o,P,S,a,i,u,l,g),document.addEventListener("DOMContentLoaded",()=>{V(),z(),B(),Y()});function V(){let s=document.querySelectorAll("[pirsch-event]");for(let r of s)r.addEventListener("click",()=>{I(r)}),r.addEventListener("auxclick",()=>{I(r)})}function I(s){let r=s.getAttribute("pirsch-event");if(!r){console.error("Pirsch event attribute name must not be empty!",s);return}let E={},x;for(let p of s.attributes)p.name.startsWith("pirsch-meta-")?E[p.name.substring(12)]=p.value:p.name.startsWith("pirsch-duration")&&(x=Number.parseInt(p.value,10)??0);pirsch(r,{meta:E,duration:x})}function z(){let s=document.querySelectorAll("[class*='pirsch-event=']");for(let r of s)r.addEventListener("click",()=>{q(r)}),r.addEventListener("auxclick",()=>{q(r)})}function q(s){let r="",E={},x;for(let p of s.classList)if(p.startsWith("pirsch-event=")){if(r=p.substring(13).replaceAll("+"," "),!r){console.error("Pirsch event class name must not be empty!",s);return}}else if(p.startsWith("pirsch-meta-")){let H=p.substring(12);if(H){let A=H.split("=");A.length===2&&A[1]!==""&&(E[A[0]]=A[1].replaceAll("+"," "))}}else p.startsWith("pirsch-duration=")&&(x=Number.parseInt(p.substring(16))??0);pirsch(r,{meta:E,duration:x})}function B(){let s=document.getElementsByTagName("a");for(let r of s)!r.hasAttribute("pirsch-ignore")&&!r.classList.contains("pirsch-ignore")&&(j(r.href)?h||X(r):f||J(r))}function J(s){let r=G(s.href);r!==null&&r.hostname!==location.hostname&&(s.addEventListener("click",()=>pirsch(k,{meta:{url:r.href}})),s.addEventListener("auxclick",()=>pirsch(k,{meta:{url:r.href}})))}function X(s){let r=K(s.href);s.addEventListener("click",()=>pirsch(N,{meta:{file:r}})),s.addEventListener("auxclick",()=>pirsch(N,{meta:{file:r}}))}function j(s){let r=s.split(".").pop().toLowerCase();return e.includes(r)}function G(s){try{return new URL(s)}catch{return null}}function K(s){try{return s.toLowerCase().startsWith("http")?new URL(s).pathname:s??"(empty)"}catch{return"(error)"}}function Y(){window.pirschNotFound=function(){pirsch($,{meta:{path:location.pathname}})}}})();})();
