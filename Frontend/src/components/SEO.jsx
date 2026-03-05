import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
//  * SEO Component for managing dynamic meta tags.
 * The SEO team can provide values for these props for each page.
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the page
 * @param {string} props.description - The meta description
 * @param {string} [props.keywords] - Comma-separated keywords
 * @param {string} [props.name] - Site name or author
 * @param {string} [props.type] - OG Type (e.g., website, article)
 * @param {string} [props.image] - OG Image URL
 * @param {string} [props.canonical] - Canonical link URL
 */
const SEO = ({ title, description, keywords, name = "Jagannath Darshan Yatra", type = "website", image, canonical }) => {
  const siteTitle = `${title} | ${name}`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name='description' content={description} />
      {keywords && <meta name='keywords' content={keywords} />}
      
      {/* Canonical link */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
