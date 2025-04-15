const API_KEY = '6c9fff3ac7c1425aaf1f04dba03abd77';
const partidosContainer = document.getElementById('partidos-container');
const resumenSeleccion = document.getElementById('resumen-seleccion');

const COMPETICIONES_VALIDAS = ['MEX', 'CL', 'MLS', 'PD', 'PL', 'SA', 'BL1', 'FL1'];

async function cargarPartidos() {
  try {
    const res = await fetch('https://api.football-data.org/v4/matches', {
      headers: { 'X-Auth-Token': API_KEY }
    });
    const data = await res.json();
    const partidos = data.matches.filter(match => COMPETICIONES_VALIDAS.includes(match.competition.code));
    partidos.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    partidosContainer.innerHTML = '';
    partidos.forEach((match, index) => {
      const div = document.createElement('div');
      div.className = 'partido';
      div.innerHTML = `
        <div class="opciones">
          <label>
            <input type="radio" name="partido-${index}" value="L" onchange="actualizarResumen()">
            ${match.homeTeam.name}
          </label>
          <label>
            <input type="radio" name="partido-${index}" value="E" onchange="actualizarResumen()">
            Empate
          </label>
          <label>
            <input type="radio" name="partido-${index}" value="V" onchange="actualizarResumen()">
            ${match.awayTeam.name}
          </label>
        </div>
      `;
      partidosContainer.appendChild(div);
    });

    document.getElementById('inicio-quiniela').textContent = new Date(partidos[0].utcDate).toLocaleString();
    document.getElementById('cierre-quiniela').textContent = new Date(partidos[partidos.length - 1].utcDate).toLocaleString();
  } catch (error) {
    partidosContainer.innerHTML = '<p>Error al cargar partidos.</p>';
    console.error(error);
  }
}

function actualizarResumen() {
  const resumen = [];
  document.querySelectorAll('.partido').forEach((p, i) => {
    const seleccionado = document.querySelector(`input[name="partido-${i}"]:checked`);
    if (seleccionado) {
      resumen.push(seleccionado.value);
    } else {
      resumen.push('-');
    }
  });
  resumenSeleccion.textContent = resumen.join(' | ');
}

cargarPartidos();
