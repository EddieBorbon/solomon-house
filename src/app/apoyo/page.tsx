'use client';

import Link from 'next/link';
import {
  DONATION_CHANNELS,
  SUPPORT_TIERS,
  SUPPORT_CONTACT,
  INFRA_COSTS,
} from '../../lib/sustainability/supportConfig';

/**
 * Página de sostenibilidad (roadmap 8.6): donaciones por pasarelas no
 * extractivas, soporte técnico remunerado opcional y transparencia de
 * los costos de infraestructura.
 */
export default function SupportPage() {
  const activeChannels = DONATION_CHANNELS.filter((channel) => channel.enabled);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-mono p-8">
      <div className="max-w-2xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl text-white mb-2">♥ Sostener La Casa de Salomón</h1>
          <p className="text-sm text-gray-400">
            Esta plataforma es software libre (AGPL-3.0) y se mantiene sin
            extractivismo: sin publicidad, sin venta de datos, sin muros de
            pago. Los aportes cubren la infraestructura pública y el tiempo
            de desarrollo.
          </p>
          <Link href="/" className="text-xs text-cyan-300 hover:text-cyan-100">
            ← Volver al lienzo colaborativo
          </Link>
        </header>

        <section>
          <h2 className="text-xl text-white mb-3">Donaciones</h2>
          {activeChannels.length === 0 && (
            <p className="text-sm text-gray-500 border border-white/10 rounded-lg p-4">
              Los canales de donación aún no están configurados. El proyecto
              prioriza pasarelas no extractivas (LiberaPay, Open Collective,
              GitHub Sponsors); se activan definiendo sus URLs en las
              variables de entorno <code className="text-gray-400">NEXT_PUBLIC_LIBERAPAY_URL</code>,{' '}
              <code className="text-gray-400">NEXT_PUBLIC_OPENCOLLECTIVE_URL</code> o{' '}
              <code className="text-gray-400">NEXT_PUBLIC_GITHUB_SPONSORS_URL</code>.
            </p>
          )}
          <div className="space-y-3">
            {activeChannels.map((channel) => (
              <a
                key={channel.name}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-white/15 hover:border-pink-400/60 rounded-lg p-4 transition-colors"
              >
                <h3 className="text-white">{channel.name} ↗</h3>
                <p className="text-xs text-gray-400 mt-1">{channel.description}</p>
                <p className="text-xs text-emerald-300 mt-1">{channel.feeNote}</p>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl text-white mb-3">Soporte técnico remunerado (opcional)</h2>
          <p className="text-xs text-gray-400 mb-3">
            La plataforma es y seguirá siendo gratuita. Quien necesite
            acompañamiento puede solicitar estos servicios escribiendo a{' '}
            <a href={`mailto:${SUPPORT_CONTACT}`} className="text-cyan-300 hover:text-cyan-100">
              {SUPPORT_CONTACT}
            </a>
            .
          </p>
          <div className="space-y-3">
            {SUPPORT_TIERS.map((tier) => (
              <div key={tier.name} className="border border-white/15 rounded-lg p-4">
                <h3 className="text-white">{tier.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{tier.description}</p>
                <p className="text-xs text-amber-300 mt-1">{tier.suggestedAmount}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl text-white mb-3">Transparencia de costos</h2>
          <p className="text-xs text-gray-400 mb-3">
            Lo que cuesta mantener la plataforma en la nube pública — y cómo
            el stack autohospedado (Docker + modo LAN) permite reducirlo a
            cero en despliegues comunitarios:
          </p>
          <ul className="space-y-1">
            {INFRA_COSTS.map((cost) => (
              <li key={cost.concept} className="text-xs text-gray-300">
                • {cost.concept} — <span className="text-gray-500">{cost.note}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
