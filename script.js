// Configuración inicial
const CSV_URL = 'https://drive.google.com/uc?export=download&id=1ZpWwsnVxdcvAzWKJFJizI8sLhOjwnJsk';
let selecciones = {};

// Función principal para cargar los partidos
async function cargarPartidos() {
  try {
    const response = await fetch(CSV_URL);
    const csvData = await response.text();
    
    const partidos = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => {
        // Normalizar nombres de encabezados
        const headersMap = {
          'date': 'date',
          'hour': 'hour',
          'local': 'local',
          'local src': 'localSrc',
          'visit': 'visit',
          'visit src': 'visitSrc',
          'televisoraW': 'televisora',
          'col-xs-4': 'porcLocal',
          'col-xs-4 (2)': 'porcEmpate',
          'col-xs-4 (3)': 'porcVisitante'
        };
        return headersMap[header.trim()] || header;
      }
    }).data;

    mostrarPartidos(partidos);
    actualizarFechas(partidos);
  } catch (error) {
    console.error('Error al cargar partidos:', error);
    mostrarError();
  }
}

// Mostrar partidos en la interfaz
function mostrarPartidos(partidos) {
  const container = document.getElementById('partidos-container');
  container.innerHTML = '';

  partidos.forEach((partido, index) => {
    const partidoHTML = `
      <div class="partido" data-id="${index}">
        <div class="equipo local">
          <img src="${partido.localSrc}" alt="${partido.local}" onerror="this.src='placeholder.png'">
          <span>${partido.local}</span>
        </div>
        
        <div class="opciones">
          <div class="opcion" data-tipo="1">
            <div class="resultado">1</div>
            <div class="porcentaje" style="width: ${partido.porcLocal}%">
              ${partido.porcLocal}%
            </div>
          </div>
          
          <div class="opcion" data-tipo="X">
            <div class="resultado">X</div>
            <div class="porcentaje" style="width: ${partido.porcEmpate}%">
              ${partido.porcEmpate}%
            </div>
          </div>
          
          <div class="opcion" data-tipo="2">
            <div class="resultado">2</div>
            <div class="porcentaje" style="width: ${partido.porcVisitante}%">
              ${partido.porcVisitante}%
            </div>
          </div>
        </div>

        <div class="equipo visitante">
          <img src="${partido.visitSrc}" alt="${partido.visit}" onerror="this.src='placeholder.png'">
          <span>${partido.visit}</span>
        </div>

        <div class="info-adicional">
          <span class="tv">📺 ${partido.televisora}</span>
          <span class="hora">${formatearFechaHora(partido.date, partido.hour)}</span>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', partidoHTML);
  });

  agregarEventosOpciones();
}

// Formatear fecha y hora
function formatearFechaHora(fecha, hora) {
  const [dia, mes, anio] = fecha.split('/');
  const opciones = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(`${mes}/${dia}/${anio} ${hora}`)
    .toLocaleDateString('es-MX', opciones)
    .replace(',', '');
}

// Actualizar fechas de inicio y cierre
function actualizarFechas(partidos) {
  const fechasValidas = partidos
    .map(p => new Date(`${p.date.split('/').reverse().join('-')}T${p.hour}`))
    .filter(d => !isNaN(d));

  const inicio = new Date(Math.min(...fechasValidas));
  const cierre = new Date(Math.max(...fechasValidas));

  document.getElementById('inicio-quiniela').textContent = 
    inicio.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: 'numeric'
    });

  document.getElementById('cierre-quiniela').textContent = 
    cierre.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: 'numeric'
    });
}

// Manejar selecciones de opciones
function agregarEventosOpciones() {
  document.querySelectorAll('.opcion').forEach(opcion => {
    opcion.addEventListener('click', function() {
      const partidoId = this.closest('.partido').dataset.id;
      const tipo = this.dataset.tipo;
      const porcentaje = this.querySelector('.porcentaje').textContent.trim();

      // Resetear selecciones en el mismo partido
      this.closest('.opciones').querySelectorAll('.opcion').forEach(o => {
        o.classList.remove('seleccionado');
      });

      this.classList.add('seleccionado');
      selecciones[partidoId] = { tipo, porcentaje };
      actualizarResumen();
    });
  });
}

// Actualizar resumen de selecciones
function actualizarResumen() {
  const resumen = document.getElementById('resumen-seleccion');
  resumen.innerHTML = Object.entries(selecciones)
    .map(([id, {tipo, porcentaje}]) => `
      <div class="resumen-item">
        <strong>Partido ${parseInt(id) + 1}:</strong>
        <span class="tipo">${tipo}</span>
        <span class="porcentaje">(${porcentaje})</span>
      </div>
    `).join('') || '<p class="text-muted">No hay selecciones realizadas</p>';
}

// Función para selección aleatoria
function seleccionAleatoria() {
  document.querySelectorAll('.partido').forEach(partido => {
    const opciones = partido.querySelectorAll('.opcion');
    const seleccion = Math.floor(Math.random() * opciones.length);
    opciones[seleccion].click();
  });
}

// Validar y enviar quiniela
async function enviarQuiniela() {
  const nombre = document.getElementById('nombre').value.trim();
  const celular = document.getElementById('celular').value.trim();

  if (!nombre || !celular) {
    mostrarAlerta('Por favor completa todos los campos', 'error');
    return;
  }

  if (Object.keys(selecciones).length === 0) {
    mostrarAlerta('Debes realizar al menos una selección', 'error');
    return;
  }

  const payload = {
    nombre,
    celular,
    selecciones,
    fecha: new Date().toISOString()
  };

  try {
    // Aquí iría la llamada a tu API
    mostrarAlerta('Quiniela enviada correctamente', 'exito');
    selecciones = {};
    actualizarResumen();
    document.querySelectorAll('.opcion.seleccionado').forEach(o => o.classList.remove('seleccionado'));
  } catch (error) {
    mostrarAlerta('Error al enviar la quiniela', 'error');
  }
}

// Helpers
function mostrarAlerta(mensaje, tipo) {
  const alerta = document.createElement('div');
  alerta.className = `alerta ${tipo}`;
  alerta.textContent = mensaje;
  document.body.prepend(alerta);

  setTimeout(() => alerta.remove(), 3000);
}

function mostrarError() {
  const container = document.getElementById('partidos-container');
  container.innerHTML = `
    <div class="error">
      <p>⚠️ Error al cargar los partidos</p>
      <button onclick="cargarPartidos()">Reintentar</button>
    </div>
  `;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', cargarPartidos);
document.getElementById('btn-suertudo').addEventListener('click', seleccionAleatoria);
document.getElementById('btn-enviar').addEventListener('click', enviarQuiniela);