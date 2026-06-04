export const siteConfig = {
  name: 'Cristocentria',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@cristocentria.com.br',
  instagram: 'https://instagram.com/cristocentria',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? '',

  pix: {
    key:     process.env.NEXT_PUBLIC_PIX_KEY  ?? '565.521.378-85',
    type:    process.env.NEXT_PUBLIC_PIX_TYPE ?? 'CPF',
    name:    process.env.NEXT_PUBLIC_PIX_NAME ?? 'Cristocentria',
  },

  pickup: {
    // Retirada em endereço fixo (loja, ponto de coleta, etc.)
    local: {
      address: process.env.NEXT_PUBLIC_PICKUP_ADDRESS ?? 'Endereço não configurado',
      info:    process.env.NEXT_PUBLIC_PICKUP_INFO    ?? 'Horário: Seg–Sex 9h–18h',
    },
    // Retirada direto com o vendedor (combinar via WhatsApp/Instagram)
    seller: {
      info: 'Entraremos em contato para combinar a retirada.',
    },
  },
} as const
