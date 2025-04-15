document.getElementById('btn-enviar').addEventListener('click', async () => {
  const nombre = document.getElementById('nombre').value.trim();
  const celular = document.getElementById('celular').value.trim();

  if (!nombre || !celular) {
    alert("Por favor, completa tu nombre y número celular.");
    return;
  }

  const seleccion = [];
  document.querySelectorAll('.partido').forEach((p, i) => {
    const seleccionado = document.querySelector(`input[name="partido-${i}"]:checked`);
    seleccion.push(seleccionado ? seleccionado.value : '-');
  });

  const body = {
    nombre,
    celular,
    seleccion
  };

  try {
    const res = await fetch('https://script.google.com/macros/s/AKfycbyZQ8BWwMeEk2M56aEX9QsmVcQ3LpFcYJLMwgwUhN7mnsmYvf_mAwHebHhmNceALVV5Ag/exec', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    const txt = await res.text();
    if (txt === "OK") {
      alert("¡Quiniela enviada con éxito!");
    } else {
      alert("Error al enviar quiniela");
    }
  } catch (err) {
    alert("Hubo un problema al enviar tu quiniela.");
    console.error(err);
  }
});
