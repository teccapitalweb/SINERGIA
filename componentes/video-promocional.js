for (const panel of document.querySelectorAll('[data-sgi-video-promo]')) {
  const video = panel.querySelector('video');
  const boton = panel.querySelector('.sgi-video-sonido');
  const aviso = panel.querySelector('[data-sgi-video-espera]');
  if (!video || !boton) continue;

  const silenciado = () => video.muted || video.volume === 0;
  const pintarSonido = () => {
    boton.textContent = silenciado() ? 'Activar sonido' : 'Silenciar';
  };

  function mostrarVideo() {
    const estabaOculto = video.hidden;
    video.hidden = false;
    boton.hidden = false;
    if (aviso) aviso.hidden = true;
    pintarSonido();
    if (estabaOculto && video.autoplay && video.muted && video.paused) video.play().catch(() => {});
  }

  boton.addEventListener('click', () => {
    if (silenciado()) {
      if (video.volume === 0) video.volume = 1;
      video.muted = false;
      if (video.paused) video.play().catch(() => {});
    } else {
      video.muted = true;
    }
    pintarSonido();
  });
  video.addEventListener('volumechange', pintarSonido);
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) mostrarVideo();
  else video.addEventListener('loadedmetadata', mostrarVideo, { once: true });

  if (aviso) {
    const mostrarError = () => {
      video.hidden = true;
      boton.hidden = true;
      aviso.hidden = false;
      aviso.querySelector('small').textContent = 'No pudimos cargar la vista previa.';
    };
    video.querySelector('source:last-of-type')?.addEventListener('error', mostrarError);
    video.addEventListener('error', mostrarError);
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) mostrarError();
  }
}
