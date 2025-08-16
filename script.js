document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const colorPicker = document.getElementById("colorPicker");
  const eraserBtn = document.getElementById("eraser");
  const size = 64;

  let currentColor = colorPicker.value;
  let erasing = false;

  // Cambiar color según picker
  colorPicker.addEventListener("input", () => {
    currentColor = colorPicker.value;
    erasing = false;
  });

  // Activar borrador
  eraserBtn.addEventListener("click", () => {
    erasing = true;
  });

  // Inicializar nodo pixels vacío si no existe
  database.ref("pixels").once("value").then(snapshot => {
    if (!snapshot.exists()) {
      database.ref("pixels").set({});
    }
  });

  // Crear tablero
  for (let i = 0; i < size * size; i++) {
    const pixel = document.createElement("div");
    pixel.classList.add("pixel");
    pixel.dataset.index = i;
    board.appendChild(pixel);

    // Pintar o borrar y guardar en Firebase
    pixel.addEventListener("click", () => {
      if (erasing) {
        database.ref("pixels/" + i).remove(); // elimina el pixel
        pixel.style.backgroundColor = "#fff"; // lo muestra en blanco
      } else {
        database.ref("pixels/" + i).set(currentColor);
      }
    });
  }

  // Escuchar cambios en Firebase y actualizar tablero en tiempo real
  database.ref("pixels").on("value", snapshot => {
    const data = snapshot.val() || {};
    for (let i = 0; i < size * size; i++) {
      const pixel = board.querySelector(`.pixel[data-index='${i}']`);
      if (pixel) {
        pixel.style.backgroundColor = data[i] || "#fff";
      }
    }
  });
});



