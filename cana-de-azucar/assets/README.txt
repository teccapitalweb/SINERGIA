Assets y configuración pendientes para /cana-de-azucar/:

- ponente.jpg       -> foto real del M.A. Ing. Agr. Luis Alfredo Díaz Urízar
                       (Jorge subirá manual; hoy hay placeholder SVG en la
                       pestaña Ponente del index.html — el comentario TODO
                       en el HTML trae el <img> listo para pegar)
- promo-social.jpg  -> imagen Open Graph 1200x630 para Facebook Ads
                       (Britney diseñará en Canva; referenciada en og:image)
- STRIPE_LINK       -> Payment Link del curso (Britney creará el producto
                       en Stripe: Price ID + Payment Link URL; pegar en la
                       variable STRIPE_LINK del index.html)
- Backend           -> endpoint /stripe/cana-de-azucar/checkout-session en
                       el repo sinergia-webhook (el equipo lo agregará
                       cuando Britney tenga el Price ID). Mientras no
                       exista, el CTA cae al fallback de WhatsApp.
