document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const colorPicker = document.getElementById("colorPicker");
  const eraserBtn = document.getElementById("eraser");

  const pixelSize = 10;
  const gridSize = 100;
  canvas.width = gridSize * pixelSize;
  canvas.height = gridSize * pixelSize;

  let currentColor = colorPicker.value;
  let erasing = false;
  let isDrawing = false;
  let hoverX = -1;
  let hoverY = -1;

  function updateButton() {
    eraserBtn.textContent = erasing ? "Lapiz" : "Borrador";
  }

  colorPicker.addEventListener("input", () => {
    currentColor = colorPicker.value;
    erasing = false;
    updateButton();
  });

  eraserBtn.addEventListener("click", () => {
    erasing = !erasing;
    updateButton();
  });

  database.ref("pixels").once("value").then(snapshot => {
    if (!snapshot.exists()) {
      database.ref("pixels").set({});
    }
  });

  function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }

  function renderCanvas(data = {}) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja todos los píxeles guardados
    for (let i = 0; i < gridSize * gridSize; i++) {
      const color = data[i];
      if (color) {
        const x = i % gridSize;
        const y = Math.floor(i / gridSize);
        drawPixel(x, y, color);
      }
    }

    // Dibuja hover
    if (hoverX >= 0 && hoverY >= 0) {
      ctx.strokeStyle = erasing ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(hoverX * pixelSize, hoverY * pixelSize, pixelSize, pixelSize);
    }
  }

  function handleDraw(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    const index = y * gridSize + x;

    if (erasing) {
      database.ref("pixels/" + index).remove();
    } else {
      database.ref("pixels/" + index).set(currentColor);
    }
  }

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    handleDraw(e);
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    hoverX = Math.floor((e.clientX - rect.left) / pixelSize);
    hoverY = Math.floor((e.clientY - rect.top) / pixelSize);

    if (isDrawing) handleDraw(e);
    renderCanvas(latestData);
  });

  canvas.addEventListener("mouseup", () => { isDrawing = false; });
  canvas.addEventListener("mouseleave", () => { isDrawing = false; hoverX = -1; hoverY = -1; renderCanvas(latestData); });

  let latestData = {};
  database.ref("pixels").on("value", snapshot => {
    latestData = snapshot.val() || {};
    renderCanvas(latestData);
  });

  updateButton();
});
