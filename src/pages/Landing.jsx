import { Link } from "react-router-dom";

// Página pública da barbearia — foco em marca e conversão.
// O agendamento do cliente acontece pelo WhatsApp (fluxo real da
// barbearia descrito no case); o sistema interno fica em /login.

// Número fictício — troque pelo WhatsApp real da barbearia
const WHATSAPP_URL =
  "https://wa.me/5511999990000?text=Ol%C3%A1!%20Quero%20agendar%20um%20hor%C3%A1rio%20na%20Barbearia%20Vintage.";

const SERVICES = [
  { name: "Corte", price: "R$ 60", desc: "Tesoura e máquina, acabamento na navalha e toalha quente." },
  { name: "Barba", price: "R$ 45", desc: "Navalha, toalha quente e balm — o ritual completo." },
  { name: "Corte + Barba", price: "R$ 95", desc: "O combo da casa. Saia pronto para qualquer ocasião.", featured: true },
  { name: "Sobrancelha", price: "R$ 20", desc: "Alinhamento na navalha, natural e discreto." },
  { name: "Acabamento (pezinho)", price: "R$ 25", desc: "Contorno renovado entre um corte e outro." },
];

const TESTIMONIALS = [
  { quote: "Único lugar onde eu não preciso explicar o corte. Sentei, conversei, saí novo.", name: "João F.", detail: "cliente há 3 anos" },
  { quote: "A barba na toalha quente é outro nível. Virou meu programa de sábado.", name: "Rafael S.", detail: "cliente desde a inauguração" },
  { quote: "Marquei pelo WhatsApp às 9h, às 10h já estava na cadeira. Respeitam seu tempo.", name: "André O.", detail: "cliente há 1 ano" },
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
          <a className="btn btn--primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            Agendar horário
          </a>
        </div>
      </nav>
      <div className="pole-stripe" />

      {/* Hero */}
      <header className="hero" id="topo">
        <p className="hero__eyebrow">Est. 2023 · Barbearia de bairro · São Paulo</p>
        <h1 className="hero__title">
          O clássico nunca
          <br />
          sai de <em>moda.</em>
        </h1>
        <p className="hero__sub">
          Corte, barba e navalha na toalha quente — sem pressa, do jeito que deve ser.
          Marque seu horário em um minuto pelo WhatsApp.
        </p>
        <div className="hero__cta">
          <a className="btn btn--primary btn--lg" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            Agendar pelo WhatsApp
          </a>
          <a className="btn btn--ghost btn--lg" href="#servicos">
            Ver serviços
          </a>
        </div>
        <p className="hero__proof">★★★★★ <strong>4,9</strong> no bairro · mais de 3.000 cortes desde 2023</p>
        <figure className="hero__photo">
          <img
            src="/img/hero.jpg"
            alt="Cliente recebendo acabamento de barba na tesoura, reclinado na cadeira da barbearia"
          />
        </figure>
      </header>

      {/* Serviços */}
      <section className="band" id="servicos">
        <div className="band__inner">
          <p className="band__eyebrow">Tabela da casa</p>
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
            <a className="btn btn--primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
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

      {/* A casa */}
      <section className="band band--warm" id="a-casa">
        <div className="band__inner band__inner--split">
          <div>
            <p className="band__eyebrow">Desde 2023 no mesmo endereço</p>
            <h2 className="band__title">Uma cadeira com o seu nome</h2>
            <p className="band__text">
              A Barbearia Vintage nasceu para ser a barbearia do bairro: aquela em que o barbeiro
              sabe seu nome, lembra como você gosta do corte e recebe você com café passado na hora.
              Cada cliente tem uma ficha com suas preferências — máquina, tesoura, alergias — para
              que qualquer cadeira seja a sua cadeira.
            </p>
            <p className="band__text">
              Agendou, chegou, sentou. Aqui seu horário é respeitado — confirmamos cada agendamento
              por e-mail e o barbeiro já está esperando por você.
            </p>
            <figure className="photo-frame">
              <img src="/img/casa-pole.jpg" alt="Barber pole e letreiro na fachada da barbearia" loading="lazy" />
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
                <dd>WhatsApp ou telefone<br />(11) 99999-0000</dd>
              </div>
            </dl>
              <a className="btn btn--primary btn--block" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Chamar no WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="band">
        <div className="band__inner">
          <p className="band__eyebrow">Quem senta na cadeira, volta</p>
          <h2 className="band__title">Palavra de cliente</h2>
          <div className="quote-grid">
            {TESTIMONIALS.map((t) => (
              <blockquote className="quote" key={t.name}>
                <p>“{t.quote}”</p>
                <footer>
                  <strong>{t.name}</strong> · {t.detail}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="closer">
        <h2>Seu horário te espera.</h2>
        <p>Sem fila, sem espera, sem surpresa. Agende agora e chegue na hora certa.</p>
        <a className="btn btn--lg closer__btn" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
          Agendar pelo WhatsApp
        </a>
      </section>

      {/* Rodapé */}
      <footer className="site-foot">
        <div className="site-foot__inner">
          <span className="site-foot__brand">
            Barbearia <em>Vintage</em> — Est. 2023
          </span>
          <Link to="/login" className="site-foot__staff">
            Área do funcionário
          </Link>
        </div>
      </footer>
    </div>
  );
}
