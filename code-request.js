// El navegador solo envía el correo; las credenciales y SendGrid viven en Supabase.
(() => {
 'use strict';
 const endpoint='https://qunaajvvtkuamgwmwnjw.supabase.co/functions/v1/kart-code-email';
 document.addEventListener('DOMContentLoaded',()=>{
  let pending=null,timeout=null,version=0;
  const dialog=document.createElement('dialog');dialog.id='code-request-dialog';dialog.className='code-request-dialog';dialog.setAttribute('aria-labelledby','code-request-title');dialog.setAttribute('aria-describedby','code-request-description');
  dialog.innerHTML=`<div class="code-request-header"><h2 id="code-request-title">Obtener mi código</h2><button type="button" class="btn secondary" id="close-code-request">Cerrar</button></div><p id="code-request-description">Ingresa tu correo corporativo para solicitar tu código de acceso.</p><form id="code-request-form" novalidate><label for="corporate-email">Tu correo corporativo</label><input class="field" id="corporate-email" type="email" name="email" autocomplete="email" placeholder="nombre.apellido@vzorsuite.com" maxlength="254" required aria-required="true" aria-describedby="code-request-help code-request-error"><p class="input-help" id="code-request-help">Solo correos @vzorsuite.com.</p><p class="code-request-error" id="code-request-error" role="alert"></p><button class="btn" id="send-code-request" type="submit">Enviar mi código</button></form><div id="code-request-result" hidden><p id="code-request-status" role="status" aria-live="polite"></p><p class="muted">Revisa tu bandeja de entrada y la carpeta de correo no deseado. Tu código actual no cambia.</p></div>`;
  document.body.append(dialog);
  const form=dialog.querySelector('form'),input=dialog.querySelector('input'),send=dialog.querySelector('#send-code-request'),error=dialog.querySelector('#code-request-error'),result=dialog.querySelector('#code-request-result'),close=dialog.querySelector('#close-code-request');
  function reset(){version++;pending?.abort();pending=null;clearTimeout(timeout);form.reset();form.hidden=false;result.hidden=true;error.textContent='';input.removeAttribute('aria-invalid');send.disabled=false;send.removeAttribute('aria-busy');send.textContent='Enviar mi código'}
  dialog.addEventListener('close',reset);close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close()}});
  input.addEventListener('input',()=>{error.textContent='';input.removeAttribute('aria-invalid')});
  form.addEventListener('submit',async e=>{
   e.preventDefault();if(pending)return;const email=input.value.trim().toLowerCase();
   if(!email||!input.validity.valid||!/^[^@\s]+@vzorsuite\.com$/.test(email)){input.setAttribute('aria-invalid','true');error.textContent='Ingresa un correo válido terminado en @vzorsuite.com.';input.focus();return}
   const current=++version;pending=new AbortController();const signal=pending.signal;timeout=setTimeout(()=>pending?.abort(),15000);error.textContent='';input.removeAttribute('aria-invalid');send.disabled=true;send.setAttribute('aria-busy','true');send.textContent='Solicitando código…';
   try{
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email}),signal});
    if(current!==version)return;
    if(response.status!==202)throw new Error('request');
    form.hidden=true;result.hidden=false;dialog.querySelector('#code-request-status').textContent='Si tu correo está registrado, recibirás tu código en unos minutos.';close.focus();
   }catch{if(current===version)error.textContent='No pudimos procesar la solicitud. Espera un momento e inténtalo nuevamente.'}
   finally{if(current===version){clearTimeout(timeout);pending=null;send.disabled=false;send.removeAttribute('aria-busy');send.textContent='Enviar mi código'}}
  });
  const mount=()=>{
   const panel=document.querySelector('#access .access-login');if(!panel||panel.querySelector('#get-code-button'))return;
   const button=document.createElement('button');button.type='button';button.id='get-code-button';button.className='btn secondary';button.textContent='Obtener mi código';button.addEventListener('click',()=>{reset();dialog.showModal();input.focus()});panel.querySelector('.input-help').before(button);
  };mount();new MutationObserver(mount).observe(document.querySelector('#access'),{childList:true});
  const openFromLink=()=>{if(location.hash==='#obtener-mi-codigo'&&!dialog.open){reset();dialog.showModal();input.focus()}};
  window.addEventListener('hashchange',openFromLink);openFromLink();
 });
})();
