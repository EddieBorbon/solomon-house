/**
 * Mecanismos de Sostenibilidad (roadmap 8.6) — configuración.
 *
 * Canales de aporte económico para el mantenimiento de la infraestructura,
 * priorizando pasarelas no extractivas (cooperativas, de código abierto o
 * sin comisión depredadora) y soporte técnico remunerado opcional.
 *
 * Para activar un canal real: completa su `url` (cuenta del proyecto) y
 * pon `enabled: true`. La página /apoyo solo muestra canales habilitados.
 */

export interface DonationChannel {
  name: string;
  description: string;
  url: string;
  enabled: boolean;
  /** Comisión aproximada de la pasarela, para transparencia */
  feeNote: string;
}

export interface SupportTier {
  name: string;
  description: string;
  suggestedAmount: string;
}

export const DONATION_CHANNELS: DonationChannel[] = [
  {
    name: 'LiberaPay',
    description:
      'Plataforma de donaciones recurrentes, software libre y sin ánimo de lucro — la opción más alineada con la soberanía tecnológica del proyecto.',
    url: process.env.NEXT_PUBLIC_LIBERAPAY_URL || '',
    enabled: Boolean(process.env.NEXT_PUBLIC_LIBERAPAY_URL),
    feeNote: '0% de comisión de plataforma (solo tarifas del procesador)',
  },
  {
    name: 'Open Collective',
    description:
      'Finanzas transparentes: cada aporte y cada gasto de infraestructura quedan publicados para la comunidad.',
    url: process.env.NEXT_PUBLIC_OPENCOLLECTIVE_URL || '',
    enabled: Boolean(process.env.NEXT_PUBLIC_OPENCOLLECTIVE_URL),
    feeNote: 'Comisión de alojamiento fiscal según el colectivo anfitrión',
  },
  {
    name: 'GitHub Sponsors',
    description: 'Micro-patrocinio mensual vinculado al repositorio de código abierto (AGPL-3.0).',
    url: process.env.NEXT_PUBLIC_GITHUB_SPONSORS_URL || '',
    enabled: Boolean(process.env.NEXT_PUBLIC_GITHUB_SPONSORS_URL),
    feeNote: '0% de comisión para cuentas personales',
  },
];

export const SUPPORT_TIERS: SupportTier[] = [
  {
    name: 'Instalación acompañada',
    description:
      'Sesión remota para desplegar el stack autohospedado (Docker, modo LAN, base de datos local) en tu institución o colectivo.',
    suggestedAmount: 'Aporte sugerido: el equivalente a 2 horas de trabajo en tu economía local',
  },
  {
    name: 'Residencia técnica',
    description:
      'Acompañamiento a artistas en residencia: preparación de galerías, perfiles HRTF, mapeos paramétricos y partituras topológicas.',
    suggestedAmount: 'Aporte sugerido: a convenir según el alcance de la obra',
  },
  {
    name: 'Taller pedagógico',
    description:
      'Formación para tutores: niveles paramétricos N1-N4, panel del tutor, exámenes psicoacústicos y guías de uso en el aula.',
    suggestedAmount: 'Gratuito para escuelas públicas rurales; aporte solidario en otros casos',
  },
];

export const SUPPORT_CONTACT =
  process.env.NEXT_PUBLIC_SUPPORT_CONTACT || 'eddieyogar@gmail.com';

/** Costos mensuales aproximados de la infraestructura pública, para transparencia. */
export const INFRA_COSTS: { concept: string; note: string }[] = [
  { concept: 'Alojamiento web (Vercel/nube pública)', note: 'capa gratuita mientras el tráfico lo permita' },
  { concept: 'Base de datos colaborativa (Firebase)', note: 'capa gratuita; sustituible por el stack autohospedado (7.2)' },
  { concept: 'Servidor de señalización WebRTC', note: 'instancia mínima o autohospedada (Docker)' },
  { concept: 'Dominio y certificados', note: 'costo anual fijo' },
];
