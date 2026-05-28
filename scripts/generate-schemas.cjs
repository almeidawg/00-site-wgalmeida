const fs = require('fs');
const path = require('path');

const SCHEMA_DIR = path.resolve(__dirname, '../public/schemas');

if (!fs.existsSync(SCHEMA_DIR)) {
    fs.mkdirSync(SCHEMA_DIR, { recursive: true });
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Grupo WG Almeida",
  "url": "https://wgalmeida.com.br",
  "logo": "https://wgalmeida.com.br/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-11-99999-9999",
    "contactType": "customer service",
    "areaServed": "BR",
    "availableLanguage": "Portuguese"
  },
  "sameAs": [
    "https://www.instagram.com/wgalmeida",
    "https://www.linkedin.com/company/grupo-wg-almeida"
  ]
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "William Almeida",
  "jobTitle": "CEO & Founder",
  "worksFor": {
    "@type": "Organization",
    "name": "Grupo WG Almeida"
  },
  "url": "https://wgalmeida.com.br/sobre",
  "sameAs": [
    "https://www.linkedin.com/in/williamalmeida"
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quais serviços o Grupo WG Almeida oferece?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oferecemos serviços completos de Arquitetura, Engenharia e Marcenaria sob medida, focados em alto padrão e tecnologia BuildTech."
      }
    },
    {
      "@type": "Question",
      "name": "Como funciona o processo BuildTech?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nosso processo integra design inteligente, gestão eficiente de obra e fabricação própria de marcenaria para garantir prazos e qualidade superior."
      }
    }
  ]
};

fs.writeFileSync(path.join(SCHEMA_DIR, 'organization.json'), JSON.stringify(organizationSchema, null, 2));
fs.writeFileSync(path.join(SCHEMA_DIR, 'person.json'), JSON.stringify(personSchema, null, 2));
fs.writeFileSync(path.join(SCHEMA_DIR, 'faq-general.json'), JSON.stringify(faqSchema, null, 2));

console.log('Schemas JSON-LD generated in public/schemas/');
