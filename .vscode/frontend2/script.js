const pageContent = document.getElementById('pageContent');
const menuItems = document.querySelectorAll('.menu-item');

const state = {
  view: 'inicio',
  user: {
    name: 'Maria',
    role: 'Cliente'
  },
  professionals: [
    { id: 1, name: 'Polyana', role: 'Maquiadora', services: ['Maquiagem Natural', 'Maquiagem Social'], image: '../../imagem/polyana.jpg' },
    { id: 2, name: 'Iara', role: 'Manicure', services: ['Remoção de Cutículas', 'Esmaltação'], image: '../../imagem/iara.jpg' },
    { id: 3, name: 'Suerllainy', role: 'Cabeleireira', services: ['Corte', 'Hidratação', 'Escova'], image: '../../imagem/suerllainy.jpg' }
  ],
  agenda: [
    { time: '07:00', client: 'Maria Silva', service: 'Remoção de Cutículas' },
    { time: '10:00', client: 'Juliana Costa', service: 'Esmaltação' },
    { time: '11:00', client: 'Ambrosia Madeira', service: 'Esmaltação' },
    { time: '12:00', client: 'Laura Rikaely', service: 'Remoção de Cutículas' }
  ],
  services: ['Maquiagem Natural', 'Maquiagem Social', 'Remoção de Cutículas', 'Esmaltação', 'Corte', 'Hidratação', 'Escova'],
  selectedDate: '24',
  selectedHour: '',
  appointments: JSON.parse(localStorage.getItem('auraAppointments') || '[]')
};

const monthNames = ['Maio'];

function render() {
  pageContent.innerHTML = getPageContent();

  if (state.view === 'agendar') {
    const dateButtons = document.querySelectorAll('.date');
    dateButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedDate = btn.dataset.day;
        render();
      });
    });

    const timeButtons = document.querySelectorAll('.time-item');
    timeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedHour = btn.dataset.time;
        render();
      });
    });

    const form = document.getElementById('agendarForm');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const servico = document.getElementById('servico').value;
        const observacao = document.getElementById('observacao').value.trim();

        if (!nome || !servico || !state.selectedHour) {
          alert('Preencha o nome, o serviço e escolha o horário.');
          return;
        }

        const novoAgendamento = {
          id: Date.now(),
          time: state.selectedHour,
          client: nome,
          service: servico,
          date: `2026-05-${state.selectedDate}`,
          note: observacao || 'Sem observação'
        };

        state.appointments.push(novoAgendamento);
        localStorage.setItem('auraAppointments', JSON.stringify(state.appointments));
        state.view = 'agenda';
        state.selectedHour = '';
        render();
      });
    }
  }

  if (state.view === 'agenda') {
    const list = document.querySelectorAll('.agenda-item');
    list.forEach((item) => {
      item.addEventListener('click', () => {
        alert('Agendamento visualizado.');
      });
    });
  }
}

function getPageContent() {
  if (state.view === 'inicio') {
    return `
      <div class="page">
        <div class="home-grid">
          <div class="home-left">
            <div class="welcome">
              <h2>Olá, Maria!</h2>
              <p>Bem-vinda ao painel do seu salão.</p>
            </div>

            <div class="next-appointment">
              <h3>Seu próximo horário:</h3>
              <strong>Escova - 14:00</strong>
            </div>

            <div class="scene">
              <div class="mirror"></div>
              <div class="lamp"></div>
              <div class="plant"></div>
              <div class="chair"></div>
            </div>
          </div>

          <div class="home-right">
            <div class="card-list">
              ${state.professionals
                .map(
                  (professional) => `
                    <div class="prof-card">
                      <div class="prof-avatar">
                        <img src="${professional.image}" alt="${professional.name}" />
                      </div>
                      <div class="prof-info">
                        <h4>${professional.name}</h4>
                        <p>${professional.role}</p>
                      </div>
                    </div>
                  `
                )
                .join('')}
            </div>

            <div class="services-box">
              <h3>Serviços Ofertados</h3>
              <ul>
                ${state.professionals
                  .flatMap((professional) => professional.services)
                  .map((service) => `<li>${service}</li>`)
                  .join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (state.view === 'agendar') {
    return `
      <div class="page">
        <div class="agendar-page">
          <div class="form-side">
            <h2>Novo Agendamento</h2>
            <p>Preencha as informações para agendar.</p>

            <form id="agendarForm">
              <div class="form-field">
                <label for="nome">Nome</label>
                <input id="nome" type="text" placeholder="Digite seu nome..." />
              </div>

              <div class="form-field">
                <label for="servico">Serviço</label>
                <select id="servico">
                  <option value="">Selecione o serviço</option>
                  ${state.services
                    .map((service) => `<option value="${service}">${service}</option>`)
                    .join('')}
                </select>
              </div>

              <div class="form-field">
                <label for="data">Data</label>
                <input id="data" type="text" value="24/05/2026" readonly />
              </div>

              <div class="form-field">
                <label for="horario">Horário</label>
                <input id="horario" type="text" value="${state.selectedHour || 'Selecione o horário'}" readonly />
              </div>

              <div class="form-field">
                <label for="observacao">Observação (opcional)</label>
                <textarea id="observacao" placeholder="Adicione uma observação..."></textarea>
              </div>

              <button class="btn-primary" type="submit">Confirmar Agendamento</button>
            </form>
          </div>

          <div class="right-panel">
            <div class="calendar-box">
              <div class="calendar-header">
                <button type="button">‹</button>
                <span>Maio 2026</span>
                <button type="button">›</button>
              </div>

              <div class="calendar-grid">
                <div class="day-name">D</div>
                <div class="day-name">S</div>
                <div class="day-name">T</div>
                <div class="day-name">Q</div>
                <div class="day-name">Q</div>
                <div class="day-name">S</div>
                <div class="day-name">S</div>

                <div class="date muted">1</div>
                <div class="date muted">2</div>
                <div class="date muted">3</div>
                <div class="date muted">4</div>
                <div class="date muted">5</div>
                <div class="date muted">6</div>
                <div class="date muted">7</div>

                <div class="date muted">8</div>
                <div class="date muted">9</div>
                <div class="date muted">10</div>
                <div class="date muted">11</div>
                <div class="date muted">12</div>
                <div class="date muted">13</div>
                <div class="date muted">14</div>

                <div class="date muted">15</div>
                <div class="date muted">16</div>
                <div class="date muted">17</div>
                <div class="date muted">18</div>
                <div class="date muted">19</div>
                <div class="date muted">20</div>
                <div class="date muted">21</div>

                <div class="date muted">22</div>
                <div class="date muted">23</div>
                <div class="date active" data-day="24">24</div>
                <div class="date" data-day="25">25</div>
                <div class="date" data-day="26">26</div>
                <div class="date" data-day="27">27</div>
                <div class="date" data-day="28">28</div>

                <div class="date" data-day="29">29</div>
                <div class="date" data-day="30">30</div>
                <div class="date" data-day="31">31</div>
                <div class="date muted">1</div>
                <div class="date muted">2</div>
                <div class="date muted">3</div>
                <div class="date muted">4</div>
              </div>
            </div>

            <div class="time-box">
              <h3>Horários Disponíveis</h3>
              <div class="time-list">
                ${['08:00', '09:00', '13:00', '14:00', '17:00']
                  .map(
                    (time) => `
                      <button type="button" class="time-item ${time === state.selectedHour ? 'selected' : ''}" data-time="${time}">
                        ${time}
                      </button>
                    `
                  )
                  .join('')}
              </div>
            </div>

            <div class="note-box">
              <h4>Importante</h4>
              <p>O agendamento só será confirmado após a seleção do horário.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (state.view === 'agenda') {
    const agendaItems = [...state.agenda, ...state.appointments];

    return `
      <div class="page">
        <div class="agenda-page">
          <div class="agenda-header">
            <h2>Agenda</h2>
          </div>

          <div class="agenda-list">
            ${agendaItems
              .map(
                (item) => `
                  <div class="agenda-item">
                    <div class="agenda-time">${item.time}</div>
                    <div class="agenda-info">
                      <strong>${item.client}</strong>
                      <span>${item.service}</span>
                    </div>
                    <div class="agenda-status">Confirmado</div>
                  </div>
                `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

menuItems.forEach((item) => {
  item.addEventListener('click', () => {
    state.view = item.dataset.view;

    menuItems.forEach((btn) => btn.classList.toggle('active', btn === item));
    render();
  });
});

render();
