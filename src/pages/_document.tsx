import { Html, Head, Main, NextScript } from "next/document";
import { SEOElements } from "@/components/SEO";

export default function Document() {
  // Schema.org JSON-LD para SEO avanzado
  const schemaOrgData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://centrodeamor.com/#organization",
        "name": "Portal Espiritual",
        "url": "https://centrodeamor.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://centrodeamor.com/og-image.png",
          "width": 1200,
          "height": 630
        },
        "description": "Servicios de lectura de tarot y guía espiritual online con maestros certificados",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "MX",
          "addressLocality": "México"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": ["Spanish"]
        },
        "sameAs": []
      },
      {
        "@type": "WebSite",
        "@id": "https://centrodeamor.com/#website",
        "url": "https://centrodeamor.com",
        "name": "Portal Espiritual - Lectura de Tarot Online",
        "description": "Descubre tu destino con lecturas de tarot personalizadas",
        "publisher": {
          "@id": "https://centrodeamor.com/#organization"
        },
        "inLanguage": "es-MX"
      },
      {
        "@type": "Service",
        "@id": "https://centrodeamor.com/#service",
        "serviceType": "Lectura de Tarot y Consulta Espiritual",
        "provider": {
          "@id": "https://centrodeamor.com/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "México"
        },
        "availableChannel": {
          "@type": "ServiceChannel",
          "serviceUrl": "https://centrodeamor.com",
          "serviceType": "Online Service"
        },
        "description": "Lecturas de tarot personalizadas con maestros espirituales certificados. Consultas místicas online para descubrir tu destino."
      }
    ]
  };

  return (
    <Html lang="es-MX">
      <Head>
        <SEOElements />
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgData) }}
        />

        {/* Google Fonts - Cormorant Garamond y Raleway */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Preload important resources */}
        <link rel="preload" href="/og-image.png" as="image" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
