'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { useToastStore } from '@/store/toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatBRL, maskCPF, maskPhone, maskCEP } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/site-config'
import { PixQRCode } from '@/components/ui/PixQRCode'

type Step = 1 | 2 | 3
type DeliveryMethod = 'DELIVERY' | 'PICKUP_LOCAL' | 'PICKUP_SELLER'

interface PersonalData {
  name: string; email: string; cpf: string; phone: string
}
interface AddressData {
  zipCode: string; street: string; number: string; complement: string
  neighborhood: string; city: string; state: string
}
interface ShippingOption {
  id: number; name: string; company: string; price: number; deliveryDays: number
}
interface SavedAddress {
  id: string; label: string; recipientName: string
  zipCode: string; street: string; number: string; complement?: string | null
  neighborhood: string; city: string; state: string; isDefault: boolean
}

const STEPS = ['Dados', 'Entrega', 'Pagamento']

function Stepper({ current }: { current: Step }) {
  return (
    <nav aria-label="Etapas do checkout">
      <ol className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const step = (i + 1) as Step
          const done = step < current
          const active = step === current
          return (
            <li key={label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  done  && 'bg-brand-pix text-white',
                  active && 'bg-brand-black text-white',
                  !done && !active && 'bg-brand-border text-brand-muted'
                )}>
                  {done ? '✓' : step}
                </div>
                <span className={cn(
                  'hidden text-sm sm:block',
                  active && 'font-semibold text-brand-black',
                  !active && 'text-brand-muted'
                )}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('mx-2 h-0.5 w-8 sm:w-16', step < current ? 'bg-brand-pix' : 'bg-brand-border')} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const pixSubtotal = useCartStore((s) => s.pixSubtotal())
  const clearCart = useCartStore((s) => s.clear)
  const addToast = useToastStore((s) => s.add)

  const [step, setStep] = useState<Step>(1)
  const [personal, setPersonal] = useState<PersonalData>({ name: '', email: '', cpf: '', phone: '' })
  const [address, setAddress] = useState<AddressData>({ zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' })
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('PICKUP_LOCAL')
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>(null)
  const [cepLoading, setCepLoading] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; total: number } | null>(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pré-preenche dados do perfil e endereços salvos quando logado
  useEffect(() => {
    if (!session?.user) return

    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        setPersonal((p) => ({
          name:  p.name  || data.name  || '',
          email: p.email || session.user?.email || '',
          cpf:   p.cpf   || (data.cpf   ? maskCPF(data.cpf)     : ''),
          phone: p.phone || (data.phone ? maskPhone(data.phone)  : ''),
        }))
      })
      .catch(() => {})

    fetch('/api/user/addresses')
      .then((r) => r.json())
      .then((data: SavedAddress[]) => {
        if (!Array.isArray(data) || data.length === 0) {
          setSelectedAddressId('new')
          return
        }
        setSavedAddresses(data)
        const def = data.find((a) => a.isDefault) ?? data[0]
        setSelectedAddressId(def.id)
      })
      .catch(() => setSelectedAddressId('new'))
  }, [session])

  // Calcula frete automaticamente ao selecionar um endereço salvo
  useEffect(() => {
    if (deliveryMethod !== 'DELIVERY' || !selectedAddressId || selectedAddressId === 'new') return
    const addr = savedAddresses.find((a) => a.id === selectedAddressId)
    if (!addr) return
    const clean = addr.zipCode.replace(/\D/g, '')
    if (clean.length === 8) fetchShipping(clean)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId, deliveryMethod])

  // Redirect se carrinho vazio e não há pedido em andamento
  useEffect(() => {
    if (items.length === 0 && !placedOrder) router.replace('/carrinho')
  }, [items, placedOrder, router])

  const shippingCost = deliveryMethod === 'DELIVERY' ? (selectedShipping?.price ?? 0) : 0
  const total = pixSubtotal + shippingCost
  const savings = subtotal - pixSubtotal

  async function handleCEP(cep: string) {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setAddress((a) => ({
          ...a,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }))
        // Calcula frete
        await fetchShipping(clean)
      } else {
        setErrors((e) => ({ ...e, zipCode: 'CEP não encontrado' }))
      }
    } catch {
      addToast('Erro ao buscar CEP', 'error')
    } finally {
      setCepLoading(false)
    }
  }

  async function fetchShipping(cep: string) {
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destCep: cep,
          items: items.map((i) => ({
            id: i.variantId,
            width: 20, height: 5, length: 30,
            weight: 0.3,
            quantity: i.quantity,
          })),
        }),
      })
      if (res.ok) {
        const opts: ShippingOption[] = await res.json()
        setShippingOptions(opts)
        if (opts.length > 0) setSelectedShipping(opts[0])
      }
    } catch {
      // Frete grátis como fallback
      setShippingOptions([{ id: 0, name: 'Transportadora', company: 'Correios', price: 0, deliveryDays: 7 }])
    }
  }

  function validateStep1(): boolean {
    const e: Record<string, string> = {}
    if (!personal.name.trim()) e.name = 'Nome obrigatório'
    if (!personal.email.includes('@')) e.email = 'Email inválido'
    if (personal.cpf.replace(/\D/g, '').length !== 11) e.cpf = 'CPF inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2(): boolean {
    if (deliveryMethod !== 'DELIVERY') return true
    // Endereço salvo selecionado — só exige opção de frete
    if (selectedAddressId && selectedAddressId !== 'new') {
      if (!selectedShipping) {
        setErrors({ shipping: 'Selecione uma opção de frete' })
        return false
      }
      return true
    }
    // Endereço manual
    const e: Record<string, string> = {}
    if (address.zipCode.replace(/\D/g, '').length !== 8) e.zipCode = 'CEP inválido'
    if (!address.street.trim()) e.street = 'Rua obrigatória'
    if (!address.number.trim()) e.number = 'Número obrigatório'
    if (!selectedShipping) e.shipping = 'Selecione uma opção de frete'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePlaceOrder() {
    setOrderLoading(true)
    try {
      const usingSavedAddress = deliveryMethod === 'DELIVERY' && selectedAddressId && selectedAddressId !== 'new'

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          paymentMethod: 'PIX',
          deliveryMethod,
          ...(usingSavedAddress
            ? { addressId: selectedAddressId }
            : deliveryMethod === 'DELIVERY'
            ? { address: { recipientName: personal.name, ...address } }
            : {}),
          shippingService: selectedShipping?.name,
          guest: { email: personal.email, name: personal.name, cpf: personal.cpf },
          shippingCost,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        addToast(err.error ?? 'Erro ao criar pedido', 'error')
        return
      }

      const order = await res.json()
      setPlacedOrder({ orderNumber: order.orderNumber, total: Number(order.total) })
      clearCart()
    } catch {
      addToast('Erro ao processar pedido. Tente novamente.', 'error')
    } finally {
      setOrderLoading(false)
    }
  }

  if (items.length === 0 && !placedOrder) return null

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <Stepper current={step} />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Formulário */}
        <div className="lg:col-span-2">

          {/* ETAPA 1 — Dados pessoais */}
          {step === 1 && (
            <section aria-label="Dados pessoais">
              <h2 className="mb-6 font-display text-2xl text-brand-black">SEUS DADOS</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nome completo" value={personal.name} required error={errors.name}
                  onChange={(e) => setPersonal((p) => ({ ...p, name: e.target.value }))} />
                <Input label="Email" type="email" value={personal.email} required error={errors.email}
                  onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))} />
                <Input label="CPF" value={personal.cpf} required error={errors.cpf} maxLength={14}
                  onChange={(e) => setPersonal((p) => ({ ...p, cpf: maskCPF(e.target.value) }))} />
                <Input label="Celular" value={personal.phone} type="tel" maxLength={15}
                  onChange={(e) => setPersonal((p) => ({ ...p, phone: maskPhone(e.target.value) }))} />
              </div>
              <Button variant="primary" size="lg" className="mt-6"
                onClick={() => validateStep1() && setStep(2)}>
                Continuar →
              </Button>
            </section>
          )}

          {/* ETAPA 2 — Método de entrega */}
          {step === 2 && (
            <section aria-label="Método de entrega">
              <h2 className="mb-6 font-display text-2xl text-brand-black">COMO QUER RECEBER?</h2>

              {/* Seleção do método */}
              <div className="flex flex-col gap-3" role="radiogroup" aria-label="Método de entrega">

                {/* Retirada no local */}
                <label className={cn(
                  'flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors',
                  deliveryMethod === 'PICKUP_LOCAL'
                    ? 'border-brand-black bg-brand-surface2'
                    : 'border-brand-border hover:border-brand-graphite'
                )}>
                  <input type="radio" name="delivery" value="PICKUP_LOCAL" checked={deliveryMethod === 'PICKUP_LOCAL'}
                    onChange={() => setDeliveryMethod('PICKUP_LOCAL')} className="mt-0.5 accent-brand-black" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <span className="font-semibold text-brand-black">Retirada no local</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">Grátis</span>
                    </div>
                    <p className="mt-0.5 text-xs text-brand-muted">{siteConfig.pickup.local.address}</p>
                    <p className="text-xs text-brand-muted">{siteConfig.pickup.local.info}</p>
                  </div>
                </label>

                {/* Combinar com o vendedor */}
                <label className={cn(
                  'flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors',
                  deliveryMethod === 'PICKUP_SELLER'
                    ? 'border-brand-black bg-brand-surface2'
                    : 'border-brand-border hover:border-brand-graphite'
                )}>
                  <input type="radio" name="delivery" value="PICKUP_SELLER" checked={deliveryMethod === 'PICKUP_SELLER'}
                    onChange={() => setDeliveryMethod('PICKUP_SELLER')} className="mt-0.5 accent-brand-black" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🤝</span>
                        <span className="font-semibold text-brand-black">Combinar com o vendedor</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">Grátis</span>
                    </div>
                    <p className="mt-0.5 text-xs text-brand-muted">{siteConfig.pickup.seller.info}</p>
                  </div>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>← Voltar</Button>
                <Button variant="primary" size="lg" onClick={() => validateStep2() && setStep(3)}>
                  Continuar →
                </Button>
              </div>
            </section>
          )}

          {/* ETAPA 3 — Pagamento */}
          {step === 3 && !placedOrder && (
            <section aria-label="Forma de pagamento">
              <h2 className="mb-6 font-display text-2xl text-brand-black">PAGAMENTO</h2>

              <div className="rounded-xl border border-brand-pix/30 bg-brand-pix/5 p-5">
                <p className="font-semibold text-green-800">⚡ Pague com PIX</p>
                <p className="mt-1 text-sm text-green-700">Aprovação em segundos. Preço com desconto já aplicado.</p>
                <p className="mt-3 text-2xl font-bold text-green-800">{formatBRL(total)}</p>
                {savings > 0 && (
                  <p className="text-sm text-green-600">Você economiza {formatBRL(savings)} pagando no PIX</p>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)}>← Voltar</Button>
                <Button variant="primary" size="lg" loading={orderLoading} onClick={handlePlaceOrder}>
                  Confirmar Pagamento →
                </Button>
              </div>
            </section>
          )}

          {/* Confirmação + instruções PIX */}
          {placedOrder && (
            <section aria-label="Pagamento PIX">
              {/* Cabeçalho de sucesso */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-brand-black">Pedido {placedOrder.orderNumber} criado!</p>
                  <p className="text-sm text-brand-muted">Agora realize o pagamento via PIX.</p>
                </div>
              </div>

              {/* QR Code PIX */}
              <div className="mb-6 flex justify-center">
                <PixQRCode
                  amount={placedOrder.total}
                  description={`Pedido ${placedOrder.orderNumber}`}
                  size={192}
                />
              </div>

              {/* Card de instrução PIX */}
              <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                <p className="mb-4 text-sm font-semibold text-green-800">⚡ Dados para o pagamento</p>

                <div className="space-y-4">
                  {/* Valor */}
                  <div>
                    <p className="text-xs text-green-700">Valor a pagar</p>
                    <p className="text-2xl font-bold text-green-900">{formatBRL(placedOrder.total)}</p>
                  </div>

                  {/* Tipo + nome */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-green-700">Tipo de chave</p>
                      <p className="font-medium text-green-900">{siteConfig.pix.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700">Favorecido</p>
                      <p className="font-medium text-green-900">{siteConfig.pix.name}</p>
                    </div>
                  </div>

                  {/* Chave PIX */}
                  <div>
                    <p className="mb-1.5 text-xs text-green-700">Chave PIX</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={siteConfig.pix.key}
                        className="flex-1 rounded-lg border border-green-300 bg-white px-4 py-2.5 font-mono text-sm font-semibold text-brand-black focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(siteConfig.pix.key)
                          addToast('Chave PIX copiada!', 'success')
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-green-700">
                  Após o pagamento, enviaremos a confirmação por e-mail e você pode acompanhar em Minha Conta.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/pedido/${placedOrder.orderNumber}`}
                  className="flex flex-1 items-center justify-center rounded-lg bg-brand-black py-3 text-sm font-semibold text-white hover:opacity-80"
                >
                  Ver meu pedido
                </Link>
                <Link
                  href="/colecao"
                  className="flex flex-1 items-center justify-center rounded-lg border border-brand-border py-3 text-sm text-brand-graphite hover:text-brand-black"
                >
                  Continuar comprando
                </Link>
              </div>
            </section>
          )}
        </div>

        {/* Resumo lateral */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-brand-border bg-white p-5">
            <h3 className="mb-4 font-display text-lg text-brand-black">RESUMO</h3>
            <ul className="divide-y divide-brand-border">
              {items.map((item) => (
                <li key={item.variantId} className="flex items-center gap-3 py-3">
                  <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-brand-surface2">
                    <Image src={item.product.images[0] ?? '/images/placeholder.jpg'} alt={item.product.name}
                      fill sizes="40px" className="object-cover" />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-black text-[10px] text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-brand-black">{item.product.name}</p>
                    <p className="text-xs text-brand-muted">{item.variant.color} / {item.variant.size}</p>
                  </div>
                  <span className="text-xs font-medium">
                    {formatBRL(item.product.pixPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-graphite">Subtotal</dt>
                <dd>{formatBRL(pixSubtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-graphite">Frete</dt>
                <dd className={shippingCost === 0 ? 'text-green-600' : ''}>
                  {shippingCost === 0 ? 'Grátis' : formatBRL(shippingCost)}
                </dd>
              </div>
              {deliveryMethod !== 'DELIVERY' && (
                <div className="flex justify-between text-xs">
                  <dt className="text-brand-muted">
                    {deliveryMethod === 'PICKUP_LOCAL' ? '📍 Retirada no local' : '🤝 Combinar com vendedor'}
                  </dt>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-border pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{formatBRL(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
