// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

// Función para obtener la zona según la sucursal
function obtenerZonaPorSucursal(sucursal) {
  // Convertimos a minúsculas y eliminamos espacios extras
  const s = sucursal.trim().toLowerCase();

  // Definimos los arreglos con los nombres en minúsculas
  // Zona 1: "Galerías Tlaxcala", "Sendero Ixtapaluca", "Galerías Coapa", "Plaza Aragón", "Portal San Ángel", "Sonata", "UDLAP"
  const zona1 = ["galerías tlaxcala", "sendero ixtapaluca", "galerías coapa", "plaza aragón", "portal san ángel", "sonata", "udlap"];

  // Zona 2: "Avándaro", "Calimaya", "Carranza", "Outlet Lerma 1", "Outlet Lerma 2", "Sendero Toluca", "Tecnológico Metepec", "Plaza la Vendimia"
  const zona2 = ["avándaro", "calimaya", "carranza", "outlet lerma 1", "outlet lerma 2", "sendero toluca", "tecnológico metepec", "plaza la vendimia"];

  // Zona 3: "Galerías Saltillo", "Galerías Zacatecas", "Patio Saltillo", "Sendero Sur Saltillo", "Sendero Escobedo", "Sendero San Roque"
  const zona3 = ["galerías saltillo", "galerías zacatecas", "patio saltillo", "sendero sur saltillo", "sendero escobedo", "sendero san roque"];

  // Zona 4: "Celaya", "Galerías Querétaro", "Patio Querétaro", "Alaïa", "Tecnológico Querétaro"
  const zona4 = ["celaya", "galerías querétaro", "patio querétaro", "alaïa", "tecnológico querétaro"];

  // Zona 5: "Galerías Campeche", "Galeráis San Juan", "Galerías La Paz", "Ámbar Tuxtla Gutiérrez"
  const zona5 = ["galerías campeche", "galeráis san juan", "galerías la paz", "ámbar tuxtla gutiérrez"];

  // Zona 6: "Galerías Metepec 1", "Galerías Metepec 2"
  const zona6 = ["galerías metepec 1", "galerías metepec 2"];

  if (zona1.includes(s)) return "Zona 1";
  else if (zona2.includes(s)) return "Zona 2";
  else if (zona3.includes(s)) return "Zona 3";
  else if (zona4.includes(s)) return "Zona 4";
  else if (zona5.includes(s)) return "Zona 5";
  else if (zona6.includes(s)) return "Zona 6";
  else return "Horarios";
}

const app = express();
app.use(express.json({ limit: "50mb" })); // Para recibir base64 grandes

// Servir archivos estáticos (vistas) desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Ruta raíz para la vista principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta para la vista del consultor
app.get("/consultor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "consultor.html"));
});

// Endpoint para almacenar PDF
app.post("/almacenar_pdf", (req, res) => {
  const { sucursal, pdfData, fileName } = req.body;
  if (!sucursal || !pdfData) {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  const zone = obtenerZonaPorSucursal(sucursal);
  const outputFolder = path.join(__dirname, "zonas", zone);
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }
  const finalName = fileName || `Horarios_${sucursal}.pdf`;
  const filePath = path.join(outputFolder, finalName);

  // Decodificar base64
  const base64Str = pdfData.split(",")[1] || pdfData;
  const pdfBuffer = Buffer.from(base64Str, "base64");

  fs.writeFileSync(filePath, pdfBuffer);
  return res.json({ message: `PDF guardado en ${filePath}` });
});

// Endpoint para almacenar Excel
app.post("/almacenar_excel", (req, res) => {
  const { sucursal, excelData, fileName } = req.body;
  if (!sucursal || !excelData) {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  const zone = obtenerZonaPorSucursal(sucursal);
  const outputFolder = path.join(__dirname, "zonas", zone);
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }
  const finalName = fileName || `Horarios_${sucursal}.xlsx`;
  const filePath = path.join(outputFolder, finalName);

  const base64Str = excelData.split(",")[1] || excelData;
  const excelBuffer = Buffer.from(base64Str, "base64");

  fs.writeFileSync(filePath, excelBuffer);
  return res.json({ message: `Excel guardado en ${filePath}` });
});

// Endpoint para listar archivos organizados por zona
app.get("/consultar_archivos", (req, res) => {
  const baseDir = path.join(__dirname, "zonas");
  const result = {};
  if (!fs.existsSync(baseDir)) {
    return res.json({});
  }
  const zones = fs.readdirSync(baseDir);
  zones.forEach((zone) => {
    const zonePath = path.join(baseDir, zone);
    if (fs.lstatSync(zonePath).isDirectory()) {
      const files = fs.readdirSync(zonePath);
      result[zone] = files;
    }
  });
  res.json(result);
});

// Endpoint para servir archivos
app.get("/zonas/:zone/:filename", (req, res) => {
  const { zone, filename } = req.params;
  const filePath = path.join(__dirname, "zonas", zone, filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Archivo no encontrado");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
