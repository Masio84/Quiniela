const endpoint = 'https://script.google.com/macros/s/AKfycbx6OqbIbEnrhZTuwOAItttPen9_8TpEPlitpCsNrPJUFxVKYJ1Kfa9-pGmtbhUSTSuu/exec';

let quiniela = [];
let partidos = [];

async function obtenerPartidos() {
  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    // Filtrar por competencia (Liga MX, Champions, MLS, Ligas Europeas)
    const ligasPermitidas = ['MEX', 'CL', 'MLS', 'PL', 'PD', 'SA', 'BL1', 'FL1']; // Liga MX, Champions, etc
    partidos = data.matches.filter(p => ligasPermitidas.includes(p.competition.code));
    
    renderizarPartidos();
  } catch (err) {
    console.error("Error al obtener partidos:", err);
    document.getElementById('partidos-container').innerHTML = '<p>Error al cargar partidos. Intenta más tarde.</p>';
  }
}

function renderizarPartidos() {
  const contenedor = document.getElementById('partidos-container');
  contenedor.innerHTML = '';
  quiniela = [];

  partidos.forEach((partido, i) => {
    const div = document.createElement('div');
    div.classList.add('partido');

    const local = partido.homeTeam.name;
    const visitante = partido.awayTeam.name;

    const html = `
      <div class="equipo" data-index="${i}" data-seleccion="L">${local}</div>
      <div class="equipo" data-index="${i}" data-seleccion="E">🤝</div>
      <div class="equipo" data-index="${i}" data-seleccion="V">${visitante}</div>
    `;

    div.innerHTML = html;
    contenedor.appendChild(div);
    quiniela.push(null);
  });

  document.querySelectorAll('.equipo').forEach(boton => {
    boton.addEventListener('click', () => {
      const i = parseInt(boton.dataset.index);
      const seleccion = boton.dataset.seleccion;
      quiniela[i] = seleccion;

      // resaltar la selección
      const grupo = boton.parentElement.querySelectorAll('.equipo');
      grupo.forEach(e => e.classList.remove('seleccionado'));
      boton.classList.add('seleccionado');

      actualizarResumen();
    });
  });
}

function actualizarResumen() {
  const resumen = document.getElementById('resumen-seleccion');
  resumen.innerHTML = quiniela.map((s, i) => s || '-').join(' | ');
}

document.getElementById('btn-suertudo').addEventListener('click', () => {
  quiniela = quiniela.map(() => ['L', 'E', 'V'][Math.floor(Math.random() * 3)]);
  actualizarResumen();
  document.querySelectorAll('.equipo').forEach(btn => {
    const i = parseInt(btn.dataset.index);
    const seleccion = btn.dataset.seleccion;
    if (quiniela[i] === seleccion) {
      btn.classList.add('seleccionado');
    } else {
      btn.classList.remove('seleccionado');
    }
  });
});

document.getElementById('btn-agregar').addEventListener('click', () => {
  alert('Quiniela agregada (simulado). Puedes enviar varias antes de enviar.');
});

document.getElementById('btn-eliminar').addEventListener('click', () => {
  if (confirm('¿Eliminar quiniela actual?')) {
    renderizarPartidos();
    document.getElementById('resumen-seleccion').innerHTML = '';
  }
});

document.getElementById('btn-enviar').addEventListener('click', async () => {
  const nombre = document.getElementById('nombre').value.trim();
  const celular = document.getElementById('celular').value.trim();

  if (!nombre || !celular) {
    alert('Por favor, ingresa tu nombre y celular.');
    return;
  }

  if (quiniela.includes(null)) {
    alert('Completa todas las selecciones antes de enviar.');
    return;
  }

  const xml = generarXML(nombre, celular, quiniela);

  const payload = {
    nombre,
    celular,
    xml
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert('Quiniela enviada correctamente. Espera la autorización.');
      renderizarPartidos();
      document.getElementById('nombre').value = '';
      document.getElementById('celular').value = '';
    } else {
      alert('Error al enviar la quiniela.');
    }
  } catch (err) {
    console.error(err);
    alert('Hubo un problema al enviar.');
  }
});

function generarXML(nombre, celular, seleccion) {
  const seleccionesXML = seleccion.map((s, i) => `<partido id="${i + 1}">${s}</partido>`).join('');
  return `<quiniela>
  <nombre>${nombre}</nombre>
  <celular>${celular}</celular>
  <selecciones>${seleccionesXML}</selecciones>
</quiniela>`;
}

document.getElementById('btn-verificar').addEventListener('click', () => {
  alert('Función de verificación en construcción.');
});

// Fecha de inicio/cierre simuladas
document.getElementById('inicio-quiniela').textContent = 'Lunes 10:00 AM';
document.getElementById('cierre-quiniela').textContent = 'Viernes 11:59 PM';

// Iniciar
obtenerPartidos();
