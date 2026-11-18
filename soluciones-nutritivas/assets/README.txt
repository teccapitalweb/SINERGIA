Assets y configuración pendientes para /soluciones-nutritivas/:

- ponente.jpg       -> LISTA (18-nov-2026): foto real del Ing. Gustavo Sánchez Díaz ya conectada en el index.
- promo-social.jpg  -> imagen Open Graph 1200x630 para Facebook Ads
                       (Britney diseñará en Canva; ya está referenciada en
                       og:image y twitter:image).
- STRIPE_LINK       -> Payment Link del curso (Britney creará el producto en
                       Stripe: Price ID + Payment Link URL; pegar en la
                       variable STRIPE_LINK del index.html, hoy vacía).
- Backend           -> endpoint /stripe/soluciones-nutritivas/checkout-session
                       en el repo sinergia-webhook (el equipo lo agregará
                       cuando Britney tenga el Price ID). Mientras no exista,
                       el CTA cae al fallback de WhatsApp.
