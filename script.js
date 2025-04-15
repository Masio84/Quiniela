const API_URL = "https://api.football-data.org/v4/matches";
const API_TOKEN = "6c9fff3ac7c1425aaf1f04dba03abd77";

const ligasPermitidas = [
  "MEXICO", "CHAMPIONS_LEAGUE", "MLS", "PREMIER_LEAGUE", "LALIGA", "BUNDESLIGA", "SERIE_A", "LIGUE_1"
];

document.addEventListener("DOMContentLoaded", () => {
  obtenerPartidos();
});

async function obtenerPartidos() {
  const container = document.getElementById("partidos-container");
  try {
    const res = await fetch(API_URL, {
      headers: {
        "X-Auth-Token": API_TOKEN
      }
    });
    const data = await res.json();

    const partidos = data.matches.filter(m => ligasPermitidas.includes(m.competition.code));
    container.innerHTML = "";

    partidos.forEach((match, index) => {
      const div = document.createElement("div");
      div.className = "partido";
      div.innerHTML = `
        <div class="opcion" onclick="seleccionar(${index}, 'L')">${match.homeTeam.name}</div>
        <div class="opcion" onclick="seleccionar(${index}, 'E')">Empate</div>
        <div class="opcion" onclick="seleccionar(${index}, 'V')">${match.awayTeam.name}</div>
      `;
      container.appendChild(div);
    });

    window.matches = partidos;
    window.selecciones = Array(partidos.length).fill(null);
  } catch (err) {
    container.innerHTML = "<p>Error al cargar partidos.</p>";
  }
}

function seleccionar(index, eleccion) {
  const container = document.getElementById("partidos-container");
  const partido = container.children[index];
  const botones = partido.querySelectorAll(".opcion");

  botones.forEach(btn => btn.classList.remove("seleccionado"));

  const idx = eleccion === 'L' ? 0 : eleccion === 'E' ? 1 : 2;
  botones[idx].classList.add("seleccionado");

  window.selecciones[index] = eleccion;

  actualizarResumen();
}

function actualizarResumen() {
  const resumen = document.getElementById("resumen-seleccion");
  resumen.innerHTML = window.selecciones.map((s, i) => {
    if (!s) return `<p>Partido ${i + 1}: Sin seleccionar</p>`;
    const match = window.matches[i];
    const nombre = s === 'L' ? match.homeTeam.name : s === 'V' ? match.awayTeam.name : "Empate";
    return `<p>Partido ${i + 1}: ${nombre}</p>`;
  }).join('');
}

// Más funciones como aleatorio, enviar, eliminar, etc., se pueden agregar aquí
