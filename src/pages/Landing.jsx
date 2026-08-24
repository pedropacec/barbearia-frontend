import { Link } from "react-router-dom";
import BookingPanel from "../components/BookingPanel.jsx";

// Página pública da barbearia — foco em marca e conversão.
// O agendamento do cliente acontece pelo WhatsApp (fluxo real da
// barbearia descrito no case); o sistema interno fica em /login.

// Número fictício — troque pelo WhatsApp real da barbearia
const WHATSAPP_URL =
  "https://wa.me/5511999990000?text=Ol%C3%A1!%20Quero%20agendar%20um%20hor%C3%A1rio%20na%20Barbearia%20Vintage.";

const SERVICES = [
  { name: "Corte", price: "R$ 60", desc: "Na tesoura e na máquina, com acabamento de navalha." },
  { name: "Barba", price: "R$ 45", desc: "O ritual completo de navalha e toalha quente." },
  { name: "Corte + Barba", price: "R$ 95", desc: "Corte completo e barba feita numa sessão só.", featured: true },
  { name: "Sobrancelha", price: "R$ 20", desc: "Alinhamento discreto, feito na navalha." },
  { name: "Acabamento (pezinho)", price: "R$ 25", desc: "Contorno renovado entre um corte e outro." },
];

export default function Landing() {
  return (
    <div className="site">
      {/* Navegação */}
      <nav className="site-nav">
        <div className="site-nav__inner">
          <a href="#topo" className="site-nav__brand">
            Barbearia <em>Vintage</em>
          </a>
          <div className="site-nav__links">
            <a href="#servicos">Serviços</a>
            <a href="#a-casa">A casa</a>
          </div>
          <a className="btn btn--primary" href="#agendar">
            Agendar horário
          </a>
        </div>
      </nav>
      <div className="pole-stripe" />

      {/* Hero */}
      <header className="hero" id="topo">
        <p className="hero__eyebrow">Est. 2023 · Barbearia clássica · São Paulo</p>
        <h1 className="hero__title">
          O clássico nunca
          <br />
          sai de <em>moda.</em>
        </h1>
        <p className="hero__sub">
          Cortes clássicos e barba feita na navalha, sempre com hora marcada.
          Escolha seu horário aqui mesmo, em menos de um minuto.
        </p>
        <div className="hero__cta">
          <a className="btn btn--primary btn--lg" href="#agendar">
            Agendar horário
          </a>
          <a className="btn btn--ghost btn--lg" href="#servicos">
            Ver serviços
          </a>
        </div>
        <p className="hero__proof">Há três anos atendendo com hora marcada em São Paulo.</p>
        <figure className="hero__photo">
          <img
            src="/img/interior.jpg"
            alt="Salão da Barbearia Vintage: cadeiras de couro vinho, espelhos redondos e piso quadriculado"
          />
        </figure>
      </header>

      {/* Serviços */}
      <section className="band" id="servicos">
        <div className="band__inner">
          <h2 className="band__title">Serviços</h2>
          <div className="svc-grid">
            {SERVICES.map((s) => (
              <article className={`svc ${s.featured ? "svc--featured" : ""}`} key={s.name}>
                {s.featured && <span className="svc__tag">Mais pedido</span>}
                <div className="svc__head">
                  <h3>{s.name}</h3>
                  <span className="svc__dots" aria-hidden="true" />
                  <span className="svc__price">{s.price}</span>
                </div>
                <p className="svc__desc">{s.desc}</p>
              </article>
            ))}
          </div>
          <div className="band__cta">
            <a className="btn btn--primary" href="#agendar">
              Garantir meu horário
            </a>
          </div>
        </div>
      </section>

      {/* O ofício — fotos */}
      <section className="gallery" aria-label="O ofício da casa">
        <figure>
          <img src="/img/oficio-1.jpg" alt="Barbeiro de chapéu e suspensórios alinhando o corte de um cliente" loading="lazy" />
        </figure>
        <figure>
          <img src="/img/oficio-2.jpg" alt="Acabamento de barba feito na tesoura" loading="lazy" />
        </figure>
        <figure>
          <img src="/img/oficio-3.jpg" alt="Riscado do corte feito na navalha" loading="lazy" />
        </figure>
      </section>

      {/* Agendamento online */}
      <section className="band" id="agendar">
        <div className="band__inner">
          <h2 className="band__title">Agende seu horário</h2>
          <BookingPanel />
        </div>
      </section>

      {/* A casa */}
      <section className="band band--warm" id="a-casa">
        <div className="band__inner band__inner--split">
          <div>
            <h2 className="band__title">Uma cadeira com o seu nome</h2>
            <p className="band__text">
              A Barbearia Vintage nasceu para ser a barbearia de sempre: aquela em que o barbeiro
              sabe seu nome e lembra como você gosta do corte. Cada cliente tem uma ficha com as
              próprias preferências, e qualquer cadeira vira a sua cadeira.
            </p>
            <p className="band__text">
              Seu horário é respeitado. Cada agendamento é confirmado por e-mail e o barbeiro já
              está esperando quando você chega.
            </p>
            <figure className="photo-frame">
              <img
                src="/img/fachada.jpg"
                alt="Fachada da Barbearia Vintage: letreiro dourado sobre madeira vinho e barber pole ao lado da porta"
                loading="lazy"
              />
            </figure>
          </div>
          <aside className="band__aside">
            <figure className="photo-frame">
              <img src="/img/casa-cadeira.jpg" alt="Cadeira clássica de barbeiro na luz da janela" loading="lazy" />
            </figure>
            <div className="info-card">
            <h3>Visite a casa</h3>
            <dl>
              <div>
                <dt>Endereço</dt>
                <dd>Rua dos Pinheiros, 402 — São Paulo/SP</dd>
              </div>
              <div>
                <dt>Horários</dt>
                <dd>Ter – Sex · 9h às 19h<br />Sábado · 8h às 18h</dd>
              </div>
              <div>
                <dt>Agendamento</dt>
                <dd>Pelo WhatsApp da casa, com confirmação por e-mail</dd>
              </div>
            </dl>
              <a className="btn btn--primary btn--block" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Chamar no WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA final */}
      <section className="closer">
        <h2>Seu horário te espera.</h2>
        <p>Escolha o horário, receba a confirmação por e-mail e chegue na hora marcada.</p>
        <a className="btn btn--lg closer__btn" href="#agendar">
          Agendar horário
        </a>
      </section>

      {/* Rodapé */}
      <footer className="site-foot">
        <div className="site-foot__inner">
          <span className="site-foot__brand">
            Barbearia <em>Vintage</em> · Est. 2023
          </span>
          <Link to="/login" className="site-foot__staff">
            Área do funcionário
          </Link>
        </div>
      </footer>
    </div>
  );
}
