const token = "6c9fff3ac7c1425aaf1f04dba03abd77";

document.addEventListener("DOMContentLoaded", async () => {
  const inicioSpan = document.getElementById("inicio-quiniela");
  const cierreSpan = document.getElementById("cierre-quiniela");
  const container = document.getElementById("partidos-container");
  const resumenDiv = document.getElementById("resumen-seleccion");

  const hoy = new Date();
  const fin = new Date();
  fin.setDate(hoy.getDate() + 7);

  inicioSpan.textContent = hoy.toLocaleDateString();
  cierreSpan.textContent = fin.toLocaleString();

  try {
    const res = await fetch("https://api.football-data.org/v4/matches?dateFrom=" + hoy.toISOString().split("T")[0] + "&dateTo=" + fin.toISOString().split("T")[0], {
      headers: { "X-Auth-Token": token }
    });

    const data = await res.json();
    const partidos = data.matches.filter(m => ["MEX", "UEFA", "MLS", "ENG", "ESP", "ITA", "DEU", "FRA"].includes(m.competition.code));

    container.innerHTML = "";

    partidos.forEach((match, i) => {
      const fila = document.createElement("div");
      fila.innerHTML = `
        <button onclick="seleccionar(${i}, 'L')">${match.homeTeam.name}</button>
        <button onclick="seleccionar(${i}, 'E')">Empate</button>
        <button onclick="seleccionar(${i}, 'V')">${match.awayTeam.name}</button>
      `;
      container.appendChild(fila);
    });

    window.selecciones = new Array(partidos.length).fill(null);
  } catch (e) {
    container.innerHTML = "<p>Error al cargar partidos.</p>";
  }
});

function seleccionar(index, tipo) {
  window.selecciones[index] = tipo;
  actualizarResumen();
}

function actualizarResumen() {
  const resumen = document.getElementById("resumen-seleccion");
  resumen.innerHTML = "";
  window.selecciones.forEach((sel, i) => {
    const span = document.createElement("span");
    span.textContent = sel || "-";
    resumen.appendChild(span);
  });
}
