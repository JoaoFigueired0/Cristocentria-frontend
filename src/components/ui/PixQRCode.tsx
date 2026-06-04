'use client'

import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { generatePixPayload } from '@/lib/pix'
import { siteConfig } from '@/lib/site-config'

interface PixQRCodeProps {
  amount: number
  description?: string
  size?: number
}

export function PixQRCode({ amount, description, size = 200 }: PixQRCodeProps) {
  const payload = useMemo(
    () =>
      generatePixPayload({
        key:         siteConfig.pix.key,
        name:        siteConfig.pix.name,
        city:        'Brasil',
        amount,
        description: description?.slice(0, 72),
      }),
    [amount, description]
  )

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl border border-green-200 bg-white p-4 shadow-sm">
        <QRCodeSVG
          value={payload}
          size={size}
          bgColor="#ffffff"
          fgColor="#0a0a0a"
          level="M"
          marginSize={1}
        />
      </div>
      <p className="text-center text-xs text-green-700">
        Abra o app do seu banco e escaneie o QR Code
      </p>
    </div>
  )
}
