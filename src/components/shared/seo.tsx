import { Helmet } from 'react-helmet-async'

type SeoProps = {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
}

const SITE_NAME = 'SketchSpace'
const DEFAULT_DESCRIPTION = 'SketchSpace — the home where artists improve together.'
const DEFAULT_OG = '/og.png'

export function Seo({ title, description, canonical, ogImage }: SeoProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  const url = canonical ? `${window.location.origin}${canonical}` : undefined

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description ?? DEFAULT_DESCRIPTION} />
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description ?? DEFAULT_DESCRIPTION} />
      <meta property="og:image" content={ogImage ?? DEFAULT_OG} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description ?? DEFAULT_DESCRIPTION} />
      <meta name="twitter:image" content={ogImage ?? DEFAULT_OG} />
    </Helmet>
  )
}
