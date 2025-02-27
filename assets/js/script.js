// assets/js/script.js

// Variables globales
let mealAssigned = {};
let coverage = {};
const days = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

/* ============================================================
   Funciones de Inicialización y Generación de Campos
============================================================ */
function initGlobals() {
  days.forEach(day => {
    mealAssigned[day] = {};
    coverage[day] = {};
  });
}

function getTimeOptions() {
  let options = '<option value="">-- Selecciona Hora --</option>';
  for (let h = 9; h <= 22; h++) {
    if (h === 22) {
      let hh = h < 10 ? "0" + h : h;
      options += `<option value="${hh}:00">${hh}:00</option>`;
    } else {
      for (let m = 0; m < 60; m += 30) {
        let hh = h < 10 ? "0" + h : h;
        let mm = m < 10 ? "0" + m : m;
        let time = `${hh}:${mm}`;
        options += `<option value="${time}">${time}</option>`;
      }
    }
  }
  return options;
}

function getMealTimeOptions() {
  let options = '<option value="">-- Selecciona Hora --</option>';
  for (let h = 12; h <= 17; h++) {
    if (h === 17) {
      let hh = h < 10 ? "0" + h : h;
      options += `<option value="${hh}:00">${hh}:00</option>`;
    } else {
      for (let m = 0; m < 60; m += 30) {
        let hh = h < 10 ? "0" + h : h;
        let mm = m < 10 ? "0" + m : m;
        let time = `${hh}:${mm}`;
        options += `<option value="${time}">${time}</option>`;
      }
    }
  }
  return options;
}

function generateEmployeeContainers() {
  initGlobals();
  const numEmpleados = document.getElementById("num_empleados").value;
  const empleadosDiv = document.getElementById("empleados");
  empleadosDiv.innerHTML = "";
  for (let i = 1; i <= numEmpleados; i++) {
    empleadosDiv.innerHTML += getEmployeeHTML(i);
  }
  updateAllSchedules();
}

function getEmployeeHTML(i) {
  const daysArr = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  let rows = "";
  daysArr.forEach(day => {
    const dayLower = day.toLowerCase();
    rows += `
      <tr>
        <td>${day}</td>
        <td><input type="time" name="${dayLower}_in_${i}" id="${dayLower}_in_${i}" onchange="updateAllSchedules()"></td>
        <td><input type="time" name="${dayLower}_out_${i}" id="${dayLower}_out_${i}" onchange="updateAllSchedules()"></td>
        <td><input type="time" name="${dayLower}_com_${i}" id="${dayLower}_com_${i}" onchange="updateAllSchedules()"></td>
        <td><input type="checkbox" name="${dayLower}_descanso_${i}" id="${dayLower}_descanso_${i}" onchange="updateAllSchedules()"></td>
      </tr>
    `;
  });
  return `
    <div class="empleado-container">
      <h3>Colaborador ${i}</h3>
      <label>Nombre:</label>
      <input type="text" name="nombre_${i}" id="nombre_${i}" required>
      <br>
      <label>Puesto:</label>
      <select name="puesto_${i}" id="puesto_${i}" required onchange="updateAllSchedules()">
        <option value="Vacante">Vacante</option>
        <option value="Supervisor">Supervisor</option>
        <option value="Yuker Full Time">Yuker Full Time</option>
        <option value="Yuker Part Time">Yuker Part Time</option>
      </select>
      <br>
      <label>Turno:</label>
      <select name="turno_${i}" id="turno_${i}" required onchange="updateAllSchedules()">
        <option value="">Selecciona turno</option>
        <option value="apertura">Apertura</option>
        <option value="cierre">Cierre</option>
      </select>
      <table>
        <tr>
          <th>Día</th>
          <th>Hora de Entrada</th>
          <th>Hora de Salida</th>
          <th>Hora de Comida</th>
          <th>Descanso</th>
        </tr>
        ${rows}
      </table>
    </div>
  `;
}

/* ============================================================
   Funciones para Actualización y Generación del Gráfico
============================================================ */
function timeStringToDecimal(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

function updateEmployeeSchedule(index) {
  const puesto = document.getElementById("puesto_" + index).value;
  const turno = document.getElementById("turno_" + index).value;
  let entrada = "", salida = "";
  if (puesto === "Vacante" || turno === "") {
    days.forEach(d => {
      document.getElementById(d + "_in_" + index).value = "";
      document.getElementById(d + "_out_" + index).value = "";
      document.getElementById(d + "_com_" + index).value = "";
    });
    return;
  }
  if (puesto === "Supervisor" || puesto === "Yuker Full Time") {
    if (turno === "apertura") { entrada = "09:00"; salida = "17:00"; }
    else { entrada = "12:30"; salida = "21:30"; }
  } else if (puesto === "Yuker Part Time") {
    if (turno === "apertura") { entrada = "09:00"; salida = "15:00"; }
    else { entrada = "15:00"; salida = "21:00"; }
  }
  days.forEach(d => {
    const inEl = document.getElementById(d + "_in_" + index);
    const outEl = document.getElementById(d + "_out_" + index);
    const comEl = document.getElementById(d + "_com_" + index);
    const descanso = document.getElementById(d + "_descanso_" + index).checked;
    if (!inEl.value) inEl.value = entrada;
    if (!outEl.value) outEl.value = salida;
    if (descanso) { comEl.value = ""; }
  });
}

function updateAllSchedules() {
  const numEmpleados = parseInt(document.getElementById("num_empleados").value);
  for (let i = 1; i <= numEmpleados; i++) {
    updateEmployeeSchedule(i);
  }
  generateScheduleChart();
}

function generateScheduleChart() {
  const graficoDiv = document.getElementById("graficoHorarios");
  graficoDiv.innerHTML = "<h2>Vista Previa de Horarios</h2>";
  const startHour = 9, endHour = 22;
  const halfHours = [];
  for (let h = startHour; h < endHour; h++) {
    halfHours.push(h + ":00");
    halfHours.push(h + ":30");
  }
  halfHours.push(endHour + ":00");
  const daysArr = [
    { key: "lunes", label: "Lunes" },
    { key: "martes", label: "Martes" },
    { key: "miércoles", label: "Miércoles" },
    { key: "jueves", label: "Jueves" },
    { key: "viernes", label: "Viernes" },
    { key: "sábado", label: "Sábado" },
    { key: "domingo", label: "Domingo" }
  ];
  const numEmpleados = parseInt(document.getElementById("num_empleados").value);
  daysArr.forEach(d => {
    const dayTitle = document.createElement("div");
    dayTitle.className = "day-table-title";
    dayTitle.textContent = d.label;
    graficoDiv.appendChild(dayTitle);
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    const thName = document.createElement("th");
    thName.textContent = "Colaborador";
    headRow.appendChild(thName);
    halfHours.forEach(hh => {
      const th = document.createElement("th");
      th.textContent = hh;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    for (let i = 1; i <= numEmpleados; i++) {
      const puesto = document.getElementById("puesto_" + i).value;
      const turno = document.getElementById("turno_" + i).value;
      const nombre = document.getElementById("nombre_" + i).value || `Empleado ${i}`;
      const inTime = document.getElementById(d.key + "_in_" + i).value;
      const outTime = document.getElementById(d.key + "_out_" + i).value;
      const mealTime = document.getElementById(d.key + "_com_" + i).value;
      const descanso = document.getElementById(d.key + "_descanso_" + i).checked;
      const row = document.createElement("tr");
      const tdName = document.createElement("td");
      tdName.textContent = `${nombre} (${puesto}) - ${turno}`;
      row.appendChild(tdName);
      const inDec = timeStringToDecimal(inTime);
      const outDec = timeStringToDecimal(outTime);
      const mealDec = timeStringToDecimal(mealTime);
      halfHours.forEach(slot => {
        const td = document.createElement("td");
        td.className = "empty-cell";
        if (puesto === "Vacante") {
          td.className = "vacante-cell";
        } else if (descanso || !inDec || !outDec) {
          td.className = "rest-cell";
        } else {
          const slotDec = timeStringToDecimal(slot);
          if (slotDec >= inDec && slotDec <= outDec) { td.className = "shift-cell"; }
          if (mealDec && (slotDec >= mealDec && slotDec < mealDec + 1)) { td.className = "meal-cell"; }
        }
        row.appendChild(td);
      });
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    graficoDiv.appendChild(table);
  });
}

/* ============================================================
   Funciones para Exportar Archivos y Guardar en localStorage
============================================================ */
function saveGeneratedFile(fileObj) {
  let files = JSON.parse(localStorage.getItem("generatedFiles") || "[]");
  files.push(fileObj);
  localStorage.setItem("generatedFiles", JSON.stringify(files));
}

function downloadExcel() {
  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Horarios",
    Subject: "Horarios Generados",
    Author: "Tu App",
    CreatedDate: new Date()
  };
  days.forEach(day => {
    const data = [];
    const header = ["Colaborador", "Hora Entrada", "Hora de Salida", "Hora de Comida", "Descanso"];
    data.push(header);
    const numEmpleados = parseInt(document.getElementById("num_empleados").value);
    for (let i = 1; i <= numEmpleados; i++) {
      const nombre = document.getElementById("nombre_" + i).value || `Empleado ${i}`;
      const inTime = document.getElementById(day + "_in_" + i).value || "";
      const outTime = document.getElementById(day + "_out_" + i).value || "";
      const comTime = document.getElementById(day + "_com_" + i).value || "";
      const descanso = document.getElementById(day + "_descanso_" + i).checked ? "Sí" : "No";
      data.push([nombre, inTime, outTime, comTime, descanso]);
    }
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, day);
  });
  const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
  const blob = new Blob([wbout], {type:"application/octet-stream"});
  const url = URL.createObjectURL(blob);
  const fileObj = {
    type: "Excel",
    branch: document.getElementById("sucursal").value || "Sin Sucursal",
    timestamp: new Date().toISOString(),
    url: url,
    fileName: "Horarios.xlsx"
  };
  saveGeneratedFile(fileObj);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileObj.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function generatePDF() {
  const grafico = document.getElementById("graficoHorarios");
  html2canvas(grafico, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('landscape', 'pt', 'a4');
    pdf.addImage(imgData, 'PNG', 10, 40, pdf.internal.pageSize.getWidth()-20, canvas.height * ((pdf.internal.pageSize.getWidth()-20)/canvas.width));
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const fileObj = {
      type: "PDF",
      branch: document.getElementById("sucursal").value || "Sin Sucursal",
      timestamp: new Date().toISOString(),
      url: pdfUrl,
      fileName: "Horarios.pdf"
    };
    saveGeneratedFile(fileObj);
    pdf.save("Horarios.pdf");
  });
}

/* ============================================================
   Función para Generar Excel a partir de una Plantilla
============================================================ */
function generateExcelFromTemplate() {
  // Se asume que "Horarios_Plantilla.xlsx" está en la raíz del proyecto.
  fetch("Horarios_Plantilla.xlsx")
    .then(response => response.arrayBuffer())
    .then(data => {
      // Lee la plantilla usando SheetJS
      const workbook = XLSX.read(data, { type: 'array' });
      // Accede a la hoja "Plantilla"
      const worksheet = workbook.Sheets["Plantilla"];
      const numEmpleados = parseInt(document.getElementById("num_empleados").value);
      const sucursal = document.getElementById("sucursal").value || "Sucursal";
      const filaInicial = 2; // Asumiendo que los datos comienzan en la fila 2

      // Mapeo de columnas (ajusta según tu plantilla)
      const day_to_entry = {
        "lunes": "E",
        "martes": "H",
        "miércoles": "K",
        "jueves": "N",
        "viernes": "Q",
        "sábado": "T",
        "domingo": "W"
      };
      const day_to_meal = {
        "lunes": "G",
        "martes": "J",
        "miércoles": "M",
        "jueves": "P",
        "viernes": "S",
        "sábado": "V",
        "domingo": "Y"
      };

      // Actualiza los datos de cada colaborador en la plantilla
      for (let i = 1; i <= numEmpleados; i++) {
        let fila = filaInicial + i - 1;
        let nombre = document.getElementById("nombre_" + i).value;
        let puesto = document.getElementById("puesto_" + i).value;
        // Escribe nombre y puesto (por ejemplo, en columnas C y D)
        worksheet["C" + fila] = { t: 's', v: nombre };
        worksheet["D" + fila] = { t: 's', v: puesto };
        // Para cada día, escribe la hora de entrada y de comida
        for (const day in day_to_entry) {
          let entryTime = document.getElementById(day + "_in_" + i).value || "";
          let mealTime  = document.getElementById(day + "_com_" + i).value || "";
          worksheet[ day_to_entry[day] + fila ] = { t: 's', v: entryTime };
          worksheet[ day_to_meal[day] + fila ] = { t: 's', v: mealTime };
        }
      }
      // (Opcional) Agrega información extra, por ejemplo la sucursal en A1
      worksheet["A1"] = { t: 's', v: "Sucursal: " + sucursal };

      // Genera el archivo Excel modificado
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const fileObj = {
        type: "Excel (Plantilla)",
        branch: sucursal,
        timestamp: new Date().toISOString(),
        url: url,
        fileName: sucursal + " Horarios Generados.xlsx"
      };
      saveGeneratedFile(fileObj);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileObj.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error("Error al cargar la plantilla de Excel:", error);
    });
}

// Asignar generateEmployeeContainers al cargar la página
document.addEventListener("DOMContentLoaded", generateEmployeeContainers);
