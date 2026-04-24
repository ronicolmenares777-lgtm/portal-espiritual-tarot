import Head from "next/head";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

/**
 * SEO Component - Wrapped in next/head for dynamic page-level SEO
 * CRITICAL: Must be exported as named export, uses flattened structure
 */
export function SEO({
  title = "Portal Espiritual - Lectura de Tarot Online | Consulta con Maestros",
  description = "Descubre tu destino con lecturas de tarot personalizadas. Maestros espirituales te guían en un viaje místico revelador. Consulta espiritual online en México y Latinoamérica.",
  image = "/og-image.png",
  url = "https://portal-espiritual.com",
  type = "website",
  keywords = "tarot online, lectura de tarot, consulta espiritual, guía espiritual, tarot gratis, lectura de cartas, maestro espiritual, tarot en línea México, consulta mística, destino espiritual"
}: SEOProps) {
  const siteTitle = title.includes("Portal Espiritual") ? title : `${title} | Portal Espiritual`;
  const fullUrl = url.startsWith("http") ? url : `https://portal-espiritual.com${url}`;
  const fullImage = image.startsWith("http") ? image : `https://portal-espiritual.com${image}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Portal Espiritual" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Spanish" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Portal Espiritual" />
      <meta property="og:locale" content="es_MX" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Theme Color */}
      <meta name="theme-color" content="#D4AF37" />
      <meta name="msapplication-TileColor" content="#1a0b2e" />

      {/* Additional Meta Tags */}
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
  );
}

/**
 * SEOElements - Raw meta tags without Head wrapper for _document.tsx
 * Used for static SEO (build-time, crawlers see immediately)
 */
export function SEOElements() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Portal Espiritual - Lectura de Tarot Online con Maestros Espirituales en México" />
      <meta name="keywords" content="tarot online, lectura espiritual, consulta mística, guía espiritual México" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    </>
  );
}