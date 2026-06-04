// Gera o payload EMV/QR Code estático do PIX (padrão Banco Central do Brasil).
// Documentação: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf

function crc16(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

function tlv(tag: string, value: string): string {
  // Comprimento em code points (não code units) — necessário para emoji e caracteres suplementares
  const len = Array.from(value).length
  return `${tag}${String(len).padStart(2, '0')}${value}`
}

export function generatePixPayload({
  key,
  name,
  city,
  amount,
  description = '',
  txId = '***',
}: {
  key: string
  name: string
  city: string
  amount?: number
  description?: string
  txId?: string
}): string {
  const cleanKey = key.replace(/[.\-\/]/g, '').replace(/\s/g, '')

  // 26 — Merchant Account Information
  const mai =
    tlv('00', 'BR.GOV.BCB.PIX') +
    tlv('01', cleanKey) +
    (description ? tlv('02', description.slice(0, 72)) : '')

  // 62 — Additional Data (txId)
  const additionalData = tlv('05', txId.slice(0, 25))

  const parts = [
    tlv('00', '01'),                           // Payload Format Indicator
    tlv('01', '12'),                           // Point of Initiation (static)
    tlv('26', mai),                            // Merchant Account Info
    tlv('52', '0000'),                         // Merchant Category Code
    tlv('53', '986'),                          // Currency (BRL)
    ...(amount != null ? [tlv('54', amount.toFixed(2))] : []),
    tlv('58', 'BR'),                           // Country Code
    tlv('59', name.normalize('NFC').slice(0, 25)),
    tlv('60', city.normalize('NFC').slice(0, 15)),
    tlv('62', additionalData),
    '6304',                                    // CRC placeholder
  ]

  const payload = parts.join('')
  return payload + crc16(payload)
}
