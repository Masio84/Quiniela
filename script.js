const endpoint = 'https://script.google.com/macros/s/AKfycbx6OqbIbEnrhZTuwOAItttPen9_8TpEPlitpCsNrPJUFxVKYJ1Kfa9-pGmtbhUSTSuu/exec';

let quiniela = [];
let partidos = [];

async function obtenerPartidos() {
  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    const ligasPermitidas = ['MEX', 'CL', 'MLS', 'PL', 'PD', 'SA', 'BL1', 'FL1'];
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

    div.innerHTML = `
      <div class="equipo" data-index="${i}" data-seleccion="L">${local}</div>
      <div class="equipo" data-index="${i}" data-seleccion="E">🤝</div>
      <div class="equipo" data-index="${i}" data-seleccion="V">${visitante}</div>
    `;

    contenedor.appendChild(div);
    quiniela.push(null);
  });

  document.querySelectorAll('.equipo').forEach(boton => {
    boton.addEventListener('click', () => {
      const i = parseInt(boton.dataset.index);
      const seleccion = boton.dataset.seleccion;
      quiniela[i] = seleccion;

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

// Botón "Me siento suertudo"
document.getElementById('btn-suertudo').addEventListener('click', () => {
  quiniela = quiniela.map(() => ['L', 'E', 'V'][Math.floor(Math.random() * 3)]);
  actualizarResumen();
  document.querySelectorAll('.equipo').forEach(btn => {
    const i = parseInt(btn.dataset.index);
    const seleccion = btn.dataset.seleccion;
    btn.classList.toggle('seleccionado', quiniela[i] === seleccion);
  });
});

// Botón "Agregar Quiniela"
document.getElementById('btn-agregar').addEventListener('click', () => {
  const nombre = document.getElementById('nombre').value.trim();
  const celular = document.getElementById('celular').value.trim();

  if (!nombre || !celular) {
    alert('Por favor, ingresa tu nombre y celular.');
    return;
  }

  if (quiniela.includes(null)) {
    alert('Completa todas las selecciones antes de agregar.');
    return;
  }

  const quinielasGuardadas = JSON.parse(localStorage.getItem('quinielas') || '[]');
  quinielasGuardadas.push({ nombre, celular, selecciones: [...quiniela] });
  localStorage.setItem('quinielas', JSON.stringify(quinielasGuardadas));

  alert('Quiniela agregada correctamente. Puedes seguir agregando más.');
  actualizarContadorQuinielas();
  renderizarPartidos();
  document.getElementById('nombre').value = '';
  document.getElementById('celular').value = '';
});

// Botón "Eliminar Quiniela"
document.getElementById('btn-eliminar').addEventListener('click', () => {
  if (confirm('¿Eliminar quiniela actual?')) {
    renderizarPartidos();
    document.getElementById('resumen-seleccion').innerHTML = '';
  }
});

// Función para mostrar cuántas quinielas hay
function actualizarContadorQuinielas() {
  const quinielasGuardadas = JSON.parse(localStorage.getItem('quinielas') || '[]');
  let contador = document.getElementById('contador-quinielas');
  if (!contador) {
    contador = document.createElement('span');
    contador.id = 'contador-quinielas';
    contador.style.marginLeft = '10px';
    contador.style.fontWeight = 'bold';
    contador.style.color = 'green';
    document.getElementById('btn-agregar').after(contador);
  }
  contador.textContent = `(${quinielasGuardadas.length} guardadas)`;
}

// Botón "Enviar Quiniela"
document.getElementById('btn-enviar').addEventListener('click', async () => {
  const quinielasGuardadas = JSON.parse(localStorage.getItem('quinielas') || '[]');

  if (quinielasGuardadas.length === 0) {
    alert('No hay quinielas guardadas para enviar.');
    return;
  }

  const listaNombres = quinielasGuardadas.map(q => `<li>${q.nombre}</li>`).join('');
  const confirmarEnvio = confirm(`Las siguientes quinielas están listas para enviar:\n\n${listaNombres}\n\n¿Confirmas el envío?`);

  if (!confirmarEnvio) {
    return;
  }

  for (const q of quinielasGuardadas) {
    const xml = generarXML(q.nombre, q.celular, q.selecciones);
    const payload = {
      nombre: q.nombre,
      celular: q.celular,
      xml
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('Error al enviar:', q);
      }
    } catch (err) {
      console.error('Error al enviar:', err);
    }
  }

  alert('Todas las quinielas han sido enviadas correctamente.');
  localStorage.removeItem('quinielas');
  actualizarContadorQuinielas();
  renderizarPartidos();
});

// Función para generar el XML de las quinielas
function generarXML(nombre, celular, seleccion) {
  const seleccionesXML = seleccion.map((s, i) => `<partido id="${i + 1}">${s}</partido>`).join('');
  return `<quiniela>
  <nombre>${nombre}</nombre>
  <celular>${celular}</celular>
  <selecciones>${seleccionesXML}</selecciones>
</quiniela>`;
}

// Botón verificador (no implementado aún)
document.getElementById('btn-verificar').addEventListener('click', () => {
  alert('Función de verificación en construcción.');
});

// Fecha simulada
document.getElementById('inicio-quiniela').textContent = 'Lunes 10:00 AM';
document.getElementById('cierre-quiniela').textContent = 'Viernes 11:59 PM';

// Iniciar
obtenerPartidos();
actualizarContadorQuinielas();
