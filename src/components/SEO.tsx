import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: 'website' | 'article';
}

const BASE_URL = 'https://easycertify.lovable.app';
const DEFAULT_TITLE = 'CertifyHub - Préparation Certifications Symfony & Sylius';
const DEFAULT_DESCRIPTION = 'Préparez vos certifications Symfony 7.0 et Sylius v2 avec des fiches pédagogiques structurées, quiz interactifs, suivi de progression et navigation intuitive.';

export function SEO({ 
  title, 
  description = DEFAULT_DESCRIPTION, 
  path = '/',
  type = 'website'
}: SEOProps) {
  const fullTitle = title ? `${title} | CertifyHub` : DEFAULT_TITLE;
  const canonicalUrl = `${BASE_URL}${path}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CertifyHub',
    description: DEFAULT_DESCRIPTION,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: BASE_URL
      }
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="CertifyHub" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
    </Helmet>
  );
}

interface TopicSEOProps {
  certificationName: string;
  certificationVersion: string;
  categoryTitle: string;
  topicTitle: string;
  path: string;
}

export function TopicSEO({ 
  certificationName, 
  certificationVersion,
  categoryTitle, 
  topicTitle, 
  path 
}: TopicSEOProps) {
  const title = `${topicTitle} - ${categoryTitle} | ${certificationName} ${certificationVersion}`;
  const description = `Fiche de révision sur ${topicTitle} pour la certification ${certificationName} ${certificationVersion}. Catégorie: ${categoryTitle}. Quiz interactif et suivi de progression inclus.`;

  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: topicTitle,
    description: description,
    author: {
      '@type': 'Organization',
      name: 'CertifyHub'
    },
    publisher: {
      '@type': 'Organization',
      name: 'CertifyHub'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://easycertify.lovable.app${path}`
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={`https://easycertify.lovable.app${path}`} />

      <meta property="og:type" content="article" />
      <meta property="og:url" content={`https://easycertify.lovable.app${path}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <script type="application/ld+json">
        {JSON.stringify(articleData)}
      </script>
    </Helmet>
  );
}
