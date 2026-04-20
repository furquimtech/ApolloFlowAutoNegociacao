/**
 * Ilustração hero para a tela de entrada.
 * Usa CSS custom properties do tema ativo — funciona com FTech e TW Capital.
 */
export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 520"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    >
      {/* ── Fundo ── */}
      <rect width="480" height="520" fill="var(--brand-primary)" />

      {/* Círculos decorativos de fundo */}
      <circle cx="420" cy="60"  r="130" fill="var(--brand-primary-hover)" opacity="0.5" />
      <circle cx="-20"  cy="440" r="160" fill="var(--brand-primary-hover)" opacity="0.4" />
      <circle cx="240" cy="260" r="340" fill="none" stroke="var(--brand-accent)" strokeWidth="1" opacity="0.08" />
      <circle cx="240" cy="260" r="260" fill="none" stroke="var(--brand-accent)" strokeWidth="1" opacity="0.1" />
      <circle cx="240" cy="260" r="180" fill="none" stroke="var(--brand-accent)" strokeWidth="1" opacity="0.12" />

      {/* ── Skyline abstrata ── */}
      <g opacity="0.18" fill="var(--brand-accent)">
        <rect x="20"  y="340" width="28" height="120" rx="3" />
        <rect x="56"  y="300" width="22" height="160" rx="3" />
        <rect x="86"  y="320" width="18" height="140" rx="3" />
        <rect x="112" y="270" width="32" height="190" rx="3" />
        <rect x="152" y="310" width="20" height="150" rx="3" />
        <rect x="180" y="285" width="26" height="175" rx="3" />
        <rect x="314" y="295" width="26" height="165" rx="3" />
        <rect x="348" y="265" width="34" height="195" rx="3" />
        <rect x="390" y="308" width="22" height="152" rx="3" />
        <rect x="420" y="330" width="18" height="130" rx="3" />
        <rect x="446" y="350" width="30" height="110" rx="3" />
      </g>

      {/* ── Documento central ── */}
      <g transform="translate(145, 100)">
        {/* Sombra */}
        <rect x="8" y="10" width="190" height="240" rx="14" fill="rgba(0,0,0,0.25)" />
        {/* Corpo */}
        <rect width="190" height="240" rx="14" fill="var(--brand-surface)" />
        {/* Orelha dobrada */}
        <path d="M148 0 L190 42 L148 42 Z" fill="var(--brand-border)" opacity="0.5" />
        <path d="M148 0 L190 0 L190 42 Z" fill="var(--brand-accent-light)" />
        {/* Linhas de texto */}
        <rect x="20" y="24" width="110" height="8"  rx="4" fill="var(--brand-border)" />
        <rect x="20" y="42" width="80"  height="6"  rx="3" fill="var(--brand-border)" opacity="0.6" />
        <rect x="20" y="72" width="150" height="6"  rx="3" fill="var(--brand-border)" opacity="0.5" />
        <rect x="20" y="86" width="130" height="6"  rx="3" fill="var(--brand-border)" opacity="0.5" />
        <rect x="20" y="100" width="140" height="6" rx="3" fill="var(--brand-border)" opacity="0.5" />
        <rect x="20" y="114" width="100" height="6" rx="3" fill="var(--brand-border)" opacity="0.5" />
        {/* Separador */}
        <rect x="20" y="132" width="150" height="1" rx="1" fill="var(--brand-border)" />
        {/* Valores */}
        <rect x="20"  y="144" width="60" height="6" rx="3" fill="var(--brand-border)" opacity="0.5" />
        <rect x="110" y="144" width="60" height="6" rx="3" fill="var(--brand-accent)" opacity="0.7" />
        <rect x="20"  y="158" width="50" height="6" rx="3" fill="var(--brand-border)" opacity="0.5" />
        <rect x="120" y="158" width="50" height="6" rx="3" fill="var(--brand-accent)" opacity="0.5" />
        {/* Área do check */}
        <rect x="20" y="178" width="150" height="44" rx="8" fill="var(--brand-accent)" opacity="0.12" />
        {/* Checkmark */}
        <circle cx="95" cy="200" r="16" fill="var(--brand-accent)" />
        <polyline points="86,200 92,207 105,193" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* ── Badge flutuante: acordo ── */}
      <g transform="translate(306, 122)">
        <rect width="118" height="56" rx="12" fill="var(--brand-accent)" />
        <circle cx="22" cy="28" r="14" fill="rgba(255,255,255,0.18)" />
        <polyline points="15,28 20,34 30,21" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="42" y="23" fill="rgba(255,255,255,0.8)" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="600">ACORDO</text>
        <text x="42" y="38" fill="#fff" fontSize="11" fontFamily="Inter, sans-serif" fontWeight="800">Aprovado</text>
      </g>

      {/* ── Badge flutuante: resolução ── */}
      <g transform="translate(48, 144)">
        <rect width="106" height="56" rx="12" fill="var(--brand-surface)" />
        <circle cx="22" cy="28" r="14" fill="var(--brand-accent-light)" />
        {/* Ícone de cadeado aberto */}
        <rect x="15" y="28" width="14" height="11" rx="3" fill="var(--brand-accent)" />
        <path d="M18 28 Q18 20 22 20 Q26 20 26 24" fill="none" stroke="var(--brand-accent)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="22" cy="33" r="2" fill="#fff" />
        <text x="42" y="24" fill="var(--brand-text-muted)" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="600">DESCONTO</text>
        <text x="42" y="39" fill="var(--brand-primary)" fontSize="11" fontFamily="Inter, sans-serif" fontWeight="800">Liberado</text>
      </g>

      {/* ── Gráfico de tendência ── */}
      <g transform="translate(52, 360)" opacity="0.9">
        <rect width="160" height="88" rx="12" fill="var(--brand-surface)" opacity="0.95" />
        <text x="12" y="22" fill="var(--brand-text-muted)" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="600">PENDÊNCIA RESOLVIDA</text>
        {/* Linha de tendência crescente */}
        <polyline
          points="14,68  38,56  62,60  86,44  110,36  134,22  152,16"
          fill="none"
          stroke="var(--brand-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Área preenchida */}
        <polygon
          points="14,68  38,56  62,60  86,44  110,36  134,22  152,16  152,76  14,76"
          fill="var(--brand-accent)"
          opacity="0.12"
        />
        {/* Ponto final */}
        <circle cx="152" cy="16" r="4" fill="var(--brand-accent)" />
      </g>

      {/* ── Partículas decorativas ── */}
      <circle cx="68"  cy="280" r="4" fill="var(--brand-accent)" opacity="0.6" />
      <circle cx="400" cy="220" r="3" fill="var(--brand-accent)" opacity="0.5" />
      <circle cx="430" cy="320" r="5" fill="var(--brand-accent)" opacity="0.35" />
      <circle cx="110" cy="460" r="3" fill="var(--brand-accent)" opacity="0.4" />
      <circle cx="370" cy="410" r="4" fill="var(--brand-accent)" opacity="0.45" />

      {/* ── Linha de grade sutil ── */}
      <g opacity="0.04" stroke="#fff" strokeWidth="1">
        {[80, 160, 240, 320, 400].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="520" />
        ))}
        {[80, 160, 240, 320, 400, 480].map(y => (
          <line key={y} x1="0" y1={y} x2="480" y2={y} />
        ))}
      </g>

      {/* ── Texto hero na parte inferior ── */}
      <g transform="translate(0, 440)">
        <text x="240" y="30" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="18" fontFamily="Inter, sans-serif" fontWeight="800">Resolva agora.</text>
        <text x="240" y="52" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Inter, sans-serif" fontWeight="400">Negocie sua dívida 100% online, rápido e seguro.</text>
      </g>
    </svg>
  );
}
