import Link from "next/link";

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow hero-kicker">Reserva online para padel</p>
        <h1>
          Encontra tu cancha y
          <br />
          reserva en minutos.
        </h1>
        <p>
          Viborita conecta jugadores y complejos con una experiencia mas clara,
          rapida y pensada para convertir desde el primer vistazo.
        </p>
        <div className="hero-points">
          <span>Disponibilidad en tiempo real</span>
          <span>Reservas para usuarios e invitados</span>
          <span>Cancelaciones visibles y simples</span>
        </div>
        <div className="hero-actions">
          <a href="#complejos" className="primary-button">
            Ver complejos
          </a>
          <Link href="/register" className="ghost-button">
            Crear cuenta
          </Link>
        </div>
      </div>

      <aside className="hero-panel">
        <div className="hero-panel__badge">Hecho para clubes y jugadores</div>
        <div className="hero-visual">
          <div className="hero-visual__court" />
          <div className="hero-visual__ball" />
          <div className="hero-visual__card hero-visual__card--top">
            <strong>Reserva en 3 pasos</strong>
            <span>Elegis sede, horario y confirmas.</span>
          </div>
          <div className="hero-visual__card hero-visual__card--bottom">
            <strong>Padel con identidad propia</strong>
            <span>Un look mas premium para vender mejor.</span>
          </div>
        </div>
      </aside>
    </section>
  );
}
