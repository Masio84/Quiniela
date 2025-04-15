document.getElementById("btn-cargar-quinielas").addEventListener("click", async () => {
    const token = document.getElementById("admin-token").value.trim();
    const contenedor = document.getElementById("lista-quinielas");
    contenedor.innerHTML = "Cargando quinielas...";
  
    const url = "https://script.google.com/macros/s/AKfycbxQY4BsOfgd-TldqXjpNAJ00axPLayyQeJBqVtn_aKsjCpXroy8j6uS7Ef0tECsjcwiDw/exec"; // URL de App Script
  
      try {
      const res = await fetch(url);
      const data = await res.json();
      contenedor.innerHTML = "";
  
      data.forEach(quiniela => {
        const nombre = quiniela.contenido.match(/<nombre>(.*?)<\/nombre>/)?.[1] || "Desconocido";
        const celular = quiniela.contenido.match(/<celular>(.*?)<\/celular>/)?.[1] || "Desconocido";
        const selecciones = [...quiniela.contenido.matchAll(/<resultado>(.*?)<\/resultado>/g)].map(m => m[1]);
  
        const tarjeta = document.createElement("div");
        tarjeta.className = "p-4 border rounded bg-gray-100 shadow";
        tarjeta.innerHTML = `
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Celular:</strong> ${celular}</p>
          <p><strong>Selecciones:</strong> ${selecciones.join(" - ")}</p>
          <p><strong>Autorizado:</strong> ${quiniela.autorizado ? "✅" : "❌"}</p>
          <div class="mt-2">
            <button class="btn-autorizacion bg-green-500 text-white px-3 py-1 mr-2 rounded" data-id="${quiniela.id}" data-valor="true">Autorizar</button>
            <button class="btn-autorizacion bg-red-500 text-white px-3 py-1 rounded" data-id="${quiniela.id}" data-valor="false">Rechazar</button>
          </div>
        `;
        contenedor.appendChild(tarjeta);
      });
  
      document.querySelectorAll(".btn-autorizacion").forEach(btn => {
        btn.addEventListener("click", async () => {
          const fileId = btn.dataset.id;
          const valor = btn.dataset.valor === "true";
  
          const respuesta = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
              token,
              fileId,
              autorizar: valor
            })
          });
  
          const texto = await respuesta.text();
          alert(texto);
          document.getElementById("btn-cargar-quinielas").click(); // Recarga lista
        });
      });
  
    } catch (err) {
      contenedor.innerHTML = "Error al cargar quinielas.";
      console.error(err);
    }
  });
  