
function obtenerCapaPorId(id) {
  const candidatos = {
    predios: ["prediosWmsLayer", "prediosLayer", "wmsPrediosLayer", "layerPredios", "prediosWMS"],
    colonias: ["coloniasWmsLayer", "coloniasLayer", "wmsColoniasLayer", "layerColonias"],
    codigos: ["codigosWmsLayer", "codigosLayer", "codigosPostalesWmsLayer", "wmsCodigosLayer", "layerCodigos"],
    auditoria: ["cambiosGeomLayer", "cambiosGeometricosLayer", "auditoriaLayer", "layerCambiosGeom"],
    fiscal: ["vectorLayer", "prediosVectorLayer", "seleccionLayer", "layerVector"]
  };

  for (const nombre of (candidatos[id] || [])) {
    try {
      if (typeof window[nombre] !== "undefined" && window[nombre]) return window[nombre];
      if (eval("typeof " + nombre + " !== 'undefined'")) {
        const lyr = eval(nombre);
        if (lyr) return lyr;
      }
    } catch (e) {}
  }

  // fallback: buscar por nombre interno si fue asignado
  try {
    const layers = map.getLayers().getArray();
    return layers.find(l => l.get && (l.get("layerId") === id || l.get("name") === id)) || null;
  } catch (e) {
    return null;
  }
}

function cambiarOpacidadCapa(id, valor) {
  const opacidad = Number(valor) / 100;
  const capa = obtenerCapaPorId(id);

  const txtMap = {
    predios: "opPrediosTxt",
    fiscal: "opFiscalTxt",
    colonias: "opColoniasTxt",
    codigos: "opCodigosTxt",
    auditoria: "opAuditoriaTxt"
  };

  const txt = document.getElementById(txtMap[id]);
  if (txt) txt.innerText = `${valor}%`;

  if (capa && typeof capa.setOpacity === "function") {
    capa.setOpacity(opacidad);
  }

  // En el fiscal local, la capa vectorial es la selección/temático local.
  // Si no encuentra capa, no rompe el visor.
}

function aplicarZIndexCapa(id) {
  const capa = obtenerCapaPorId(id);
  if (capa && typeof capa.setZIndex === "function") {
    capa.setZIndex(capaOrdenEstado[id]);
  }
}

function subirCapa(id) {
  capaOrdenEstado[id] = (capaOrdenEstado[id] || 0) + 10;
  aplicarZIndexCapa(id);
  actualizarOrdenVisualCapas();
}

function bajarCapa(id) {
  capaOrdenEstado[id] = (capaOrdenEstado[id] || 0) - 10;
  aplicarZIndexCapa(id);
  actualizarOrdenVisualCapas();
}

function actualizarOrdenVisualCapas() {
  const contenedor = document.querySelector("#tabCapas .card-panel:nth-of-type(2)");
  if (!contenedor) return;

  const items = Array.from(contenedor.querySelectorAll(".layer-item"));
  items
    .sort((a, b) => {
      const za = capaOrdenEstado[a.dataset.layerId] || 0;
      const zb = capaOrdenEstado[b.dataset.layerId] || 0;
      return zb - za;
    })
    .forEach(item => contenedor.insertBefore(item, contenedor.querySelector(".dashboard-toggle-row")));
}

function inicializarAdministradorCapas() {
  Object.keys(capaOrdenEstado).forEach(aplicarZIndexCapa);

  // Intentar nombrar capas por referencia conocida.
  try { if (typeof prediosWmsLayer !== "undefined") prediosWmsLayer.set("layerId", "predios"); } catch(e) {}
  try { if (typeof coloniasWmsLayer !== "undefined") coloniasWmsLayer.set("layerId", "colonias"); } catch(e) {}
  try { if (typeof codigosWmsLayer !== "undefined") codigosWmsLayer.set("layerId", "codigos"); } catch(e) {}
  try { if (typeof cambiosGeomLayer !== "undefined") cambiosGeomLayer.set("layerId", "auditoria"); } catch(e) {}
  try { if (typeof vectorLayer !== "undefined") vectorLayer.set("layerId", "fiscal"); } catch(e) {}

  actualizarOrdenVisualCapas();
  sincronizarCapasWmsDesdeControles();
}



const MODULOS_INSTITUCIONALES = {
  tabConsulta: "Consulta catastral",
  tabCapas: "Capas del mapa",
  tabHerramientas: "Herramientas",
  tabAnalisisZonas: "Análisis zonas homogéneas",
  tabCondominios: "Régimen en condominio",
  tabMovimientos: "Movimientos catastrales",
  tabAdministracion: "Administración"
};

let relojInstitucionalTimer = null;

function iniciarRelojInstitucional() {
  const tick = () => {
    const el = document.getElementById("headerRelojInstitucional");
    if (!el) return;
    const ahora = new Date();
    el.innerHTML =
      `${ahora.toLocaleDateString("es-MX", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}` +
      `<br>${ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
  };
  tick();
  if (relojInstitucionalTimer) clearInterval(relojInstitucionalTimer);
  relojInstitucionalTimer = setInterval(tick, 30000);
}

function actualizarBreadcrumbModulo(tabId) {
  const mod = document.getElementById("breadcrumbModulo");
  if (mod) mod.textContent = MODULOS_INSTITUCIONALES[tabId] || "Consulta catastral";
}

function actualizarBreadcrumbPredio(clave, ficha = null) {
  const wrap = document.getElementById("breadcrumbPredioWrap");
  const txt = document.getElementById("breadcrumbPredio");
  const estado = document.getElementById("estadoPredioInstitucional");
  if (!clave) {
    wrap?.classList.add("oculto");
    estado?.classList.add("oculto");
    if (txt) txt.textContent = "—";
    return;
  }
  const claveNorm = String(clave).trim().toUpperCase();
  if (txt) txt.textContent = claveNorm;
  wrap?.classList.remove("oculto");
  if (estado) {
    const adeudo = Number(ficha?.adeudo_total || 0) > 0;
    const dibujado = !!(ficha?.dibujado);
    estado.textContent = `Predio ${claveNorm} · ${dibujado ? "Dibujado" : "Sin geometría"} · ${adeudo ? "Con adeudo" : "Sin adeudo"}`;
    estado.classList.remove("oculto");
  }
}

function irBreadcrumbInicioInstitucional() {
  const btn = document.querySelector('.tab-btn[onclick*="tabConsulta"]');
  if (typeof mostrarTab === "function") mostrarTab("tabConsulta", btn);
  if (typeof cerrarFichaFlotante === "function") cerrarFichaFlotante();
  return false;
}

function actualizarLayoutPrincipal() {
  const panel = document.getElementById("panel");
  if (typeof enModoGestionCatastral === "function" && enModoGestionCatastral() && panel) {
    panel.classList.remove("panel-oculto");
    document.body.classList.remove("panel-oculto-activo");
  }
  const tabla = document.getElementById("tablaResultadosFlotante");
  const ficha = document.getElementById("fichaFlotante");
  const oculto = panel?.classList.contains("panel-oculto");
  const tablaVisible = tabla && !tabla.classList.contains("oculto");
  const fichaVisible = ficha && !ficha.classList.contains("oculto");
  document.body.classList.toggle("panel-oculto-activo", !!oculto);
  document.body.classList.toggle("tabla-resultados-visible", !!tablaVisible);
  document.body.classList.toggle("ficha-dock-oculta", !fichaVisible);
  marcarIgnorarClickMapa(450);
  setTimeout(() => {
    if (typeof map !== "undefined" && map) map.updateSize();
  }, 320);
}

function inicializarBotonOcultarPanel() {
  const header = document.querySelector("#panel .panel-header");
  if (!header || document.getElementById("btnOcultarPanel")) return;

  const btn = document.createElement("button");
  btn.id = "btnOcultarPanel";
  btn.type = "button";
  btn.innerHTML = "×";
  btn.title = "Ocultar panel";
  btn.className = "panel-close-btn";
  btn.onclick = ocultarPanelPrincipal;
  header.appendChild(btn);
}

function ocultarPanelPrincipal() {
  const panel = document.getElementById("panel");
  const btn = document.getElementById("btnMostrarPanel");
  if (panel) panel.classList.add("panel-oculto");
  if (btn) btn.classList.remove("oculto");
  actualizarLayoutPrincipal();
}

function mostrarPanelPrincipal() {
  const panel = document.getElementById("panel");
  const btn = document.getElementById("btnMostrarPanel");
  if (panel) panel.classList.remove("panel-oculto");
  if (btn) btn.classList.add("oculto");
  actualizarLayoutPrincipal();
}

function sincronizarCapasWmsDesdeControles() {
  const chkPred = document.getElementById("chkPrediosWms");
  const chkCol = document.getElementById("chkColoniasWms");
  const chkCod = document.getElementById("chkCodigosWms");
  const chkGeom = document.getElementById("chkCambiosGeom");

  if (chkPred) aplicarVisibilidadCapaWms(prediosWmsLayer, chkPred.checked);
  if (chkCol) aplicarVisibilidadCapaWms(coloniasWmsLayer, chkCol.checked);
  if (chkCod) aplicarVisibilidadCapaWms(codigosWmsLayer, chkCod.checked);
  if (chkGeom) aplicarVisibilidadCapaWms(capaCambiosGeometricos, chkGeom.checked);
}

function aplicarVisibilidadCapaWms(capa, visible) {
  if (!capa || typeof capa.setVisible !== "function") return;
  capa.setVisible(!!visible);
  try {
    if (typeof map !== "undefined" && map) map.render();
  } catch (e) {}
}

const API = "https://fcnarqnodo.hopto.org/api/catastro";
const COLOR_CONTORNO_SELECCION = "#0000ff";

const vectorSource = new ol.source.Vector();

function coloresFiscalesPredio(feature) {
  const tieneInfoFiscal = feature.get("info_fiscal") === true;
  const tieneAdeudo = Number(feature.get("adeudo_total") || 0) > 0;

  if (tieneInfoFiscal || feature.get("adeudo_total") !== undefined) {
    if (tieneAdeudo) {
      return {
        strokeColor: "#c62828",
        fillColor: "rgba(198, 40, 40, 0.22)"
      };
    }
    return {
      strokeColor: "#15803d",
      fillColor: "rgba(21, 128, 61, 0.20)"
    };
  }

  return {
    strokeColor: "#64748b",
    fillColor: "rgba(100, 116, 139, 0.12)"
  };
}

function estiloEtiquetaPredio(etiqueta, destacado = false) {
  if (!etiqueta) return undefined;
  return new ol.style.Text({
    text: etiqueta,
    font: destacado ? "bold 13px Arial" : "11px Arial",
    fill: new ol.style.Fill({ color: "#000000" }),
    stroke: new ol.style.Stroke({ color: "#ffffff", width: 3 }),
    overflow: true
  });
}

function estiloPredio(feature) {
  const seleccionado = feature.get("seleccionado");
  const etiqueta = feature.get("clave_catastral") || "";
  const { strokeColor, fillColor } = coloresFiscalesPredio(feature);

  if (seleccionado) {
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: strokeColor,
        width: 2
      }),
      fill: new ol.style.Fill({ color: fillColor }),
      text: estiloEtiquetaPredio(etiqueta, true)
    });
  }

  const tieneInfoFiscal = feature.get("info_fiscal") === true;
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: strokeColor,
      width: tieneInfoFiscal ? 3 : 2
    }),
    fill: new ol.style.Fill({ color: fillColor }),
    text: estiloEtiquetaPredio(etiqueta, false)
  });
}

function estiloResultadoBusqueda(feature) {
  const seleccionado = feature.get("seleccionado");
  const etiqueta = feature.get("clave_catastral") || "";
  const { strokeColor, fillColor } = coloresFiscalesPredio(feature);

  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: strokeColor,
      width: seleccionado ? 2 : 2
    }),
    fill: new ol.style.Fill({ color: fillColor }),
    text: estiloEtiquetaPredio(etiqueta, seleccionado)
  });
}

function estiloCambiosGeometricos(feature) {
  const tipo = feature.get("tipo_cambio");
  const prioridad = feature.get("prioridad");
  let color = "#fdd835";

  if (prioridad === "ALTA" || tipo === "CAMBIO_CRITICO") {
    color = "#e53935";
  } else if (prioridad === "MEDIA" || tipo === "CAMBIO_GEOMETRIA_Y_AREA") {
    color = "#fb8c00";
  } else if (tipo === "GEOMETRIA_INVALIDA") {
    color = "#000000";
  }

  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: color,
      width: 4
    }),
    fill: new ol.style.Fill({
      color: "rgba(255, 0, 0, 0.12)"
    }),
    text: new ol.style.Text({
      text: feature.get("clave_catastral") || "",
      font: "bold 11px Arial",
      fill: new ol.style.Fill({ color: "#000000" }),
      stroke: new ol.style.Stroke({ color: "#ffffff", width: 3 }),
      overflow: true
    })
  });
}

const vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: estiloPredio,
  zIndex: 90
});

const seleccionContornoSource = new ol.source.Vector();
const seleccionContornoLayer = new ol.layer.Vector({
  source: seleccionContornoSource,
  zIndex: 9999,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: COLOR_CONTORNO_SELECCION,
      width: 4,
      lineDash: [12, 8],
      lineCap: "round",
      lineJoin: "round"
    }),
    fill: new ol.style.Fill({
      color: "rgba(0, 0, 255, 0.06)"
    })
  })
});

function limpiarContornoSeleccion() {
  seleccionContornoSource.clear();
}

function mostrarContornoSeleccion(geometry) {
  limpiarContornoSeleccion();
  if (!geometry) return;
  const geom = typeof geometry.clone === "function" ? geometry.clone() : geometry;
  seleccionContornoSource.addFeature(new ol.Feature(geom));
}

function marcarPredioSeleccionEnCapas(clave) {
  const claveNorm = String(clave || "").trim().toUpperCase();
  vectorSource.getFeatures().forEach(f => {
    const activo = String(f.get("clave_catastral") || "").toUpperCase() === claveNorm;
    f.set("seleccionado", activo);
    f.changed();
  });
  if (resultadosSource) {
    resultadosSource.getFeatures().forEach(f => {
      const activo = String(f.get("clave_catastral") || "").toUpperCase() === claveNorm;
      f.set("seleccionado", activo);
      f.set("info_fiscal", true);
      f.changed();
    });
  }
}

function obtenerGeometriaPredioSeleccionado(clave) {
  const claveNorm = String(clave || "").trim().toUpperCase();
  if (resultadosSource) {
    const fRes = resultadosSource.getFeatures().find(
      f => String(f.get("clave_catastral") || "").toUpperCase() === claveNorm
    );
    if (fRes) return fRes.getGeometry();
  }
  const fVec = vectorSource.getFeatures().find(
    f => String(f.get("clave_catastral") || "").toUpperCase() === claveNorm
  );
  return fVec ? fVec.getGeometry() : null;
}

let seleccionPredioSeq = 0;
let claveSeleccionadaActual = "";
let ignorarClickMapaHasta = 0;

function obtenerPaddingMapaFit() {
  const ficha = document.getElementById("fichaFlotante");
  const mapEl = document.getElementById("map");
  const margen = 24;

  let top = margen;
  let left = margen;
  let right = margen;
  let bottom = margen;

  // Solo reservar espacio para elementos que flotan SOBRE el canvas del mapa (p. ej. la ficha).
  // El panel lateral y la tabla ya reducen el tamaño del mapa vía flex; no sumar su ancho aquí.
  const fichaVisible = ficha && !ficha.classList.contains("oculto");
  if (fichaVisible && mapEl) {
    const mapRect = mapEl.getBoundingClientRect();
    const fichaRect = ficha.getBoundingClientRect();
    if (mapRect.width > 0 && fichaRect.width > 0) {
      const solapeDerecho = Math.max(0, mapRect.right - fichaRect.left);
      right = Math.max(right, solapeDerecho + 32);
    } else {
      right = ficha.classList.contains("minimizada") ? 360 : 430;
    }
  }

  return [top, right, bottom, left];
}

function expandirExtentGeometria(geometry, factor = 0.45, minMetros = 28) {
  if (!geometry?.getExtent) return null;
  const extent = geometry.getExtent();
  if (!extent || ol.extent.isEmpty(extent)) return null;
  const w = ol.extent.getWidth(extent);
  const h = ol.extent.getHeight(extent);
  const buf = Math.max(w * factor, h * factor, minMetros);
  return ol.extent.buffer(extent, buf);
}

function marcarIgnorarClickMapa(ms = 900) {
  ignorarClickMapaHasta = Date.now() + ms;
}

function extraerClavePredioProps(props) {
  if (!props) return "";
  return String(
    props.clave_catastral ||
    props.clavecatas ||
    props.CLAVE_CATASTRAL ||
    props.ClaveCatas ||
    props.clave ||
    ""
  ).trim().toUpperCase();
}

function elegirPredioWmsEnClick(features, coordinate) {
  if (!Array.isArray(features) || features.length === 0) return null;
  if (features.length === 1) return features[0];

  const format = new ol.format.GeoJSON();
  let mejor = null;
  let mejorDist = Infinity;

  for (const f of features) {
    if (!f?.geometry) continue;
    try {
      const olFeature = format.readFeature(f, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857"
      });
      const geom = olFeature.getGeometry();
      if (!geom) continue;
      if (typeof geom.intersectsCoordinate === "function" && geom.intersectsCoordinate(coordinate)) {
        return f;
      }
      const centro = ol.extent.getCenter(geom.getExtent());
      const dist = ol.coordinate.squaredDistanceTo(centro, coordinate);
      if (dist < mejorDist) {
        mejorDist = dist;
        mejor = f;
      }
    } catch (e) {
      /* probar siguiente feature */
    }
  }
  return mejor || features[0];
}

function aplicarSeleccionVisualPredio(clave, geometry = null) {
  marcarPredioSeleccionEnCapas(clave);
  mostrarContornoSeleccion(geometry || obtenerGeometriaPredioSeleccionado(clave));
  refrescarLeyendaDespuesDeCambio();
}

// Indica si la geometría ya está (prácticamente) dentro de la vista actual,
// para evitar el "brinco" de recentrar el mapa al hacer clic en un predio visible.
function geometriaVisibleEnVista(geometry) {
  if (!geometry || typeof map === "undefined" || !map) return false;
  try {
    const ext = geometry.getExtent ? geometry.getExtent() : null;
    if (!ext || ol.extent.isEmpty(ext)) return false;
    const vista = map.getView().calculateExtent(map.getSize());
    return ol.extent.containsExtent(vista, ext);
  } catch (e) {
    return false;
  }
}

function hacerZoomAGeometria(geometry, options = {}) {
  if (!geometry || typeof map === "undefined" || !map) return false;

  let extent = geometry.getExtent ? geometry.getExtent() : null;
  if (!extent || ol.extent.isEmpty(extent)) return false;

  if (options.expandir !== false) {
    const factor = options.factorExpansion ?? 0.45;
    const minM = options.minExpansionMetros ?? 28;
    extent = expandirExtentGeometria(geometry, factor, minM) || extent;
  }

  const duration = options.duration ?? 650;
  marcarIgnorarClickMapa(duration + 300);

  map.getView().fit(extent, {
    padding: options.padding || obtenerPaddingMapaFit(),
    maxZoom: options.maxZoom ?? 18,
    duration
  });
  return true;
}

function hacerZoomAPredio(clave, geometry = null, options = {}) {
  const geom = geometry || obtenerGeometriaPredioSeleccionado(clave);
  return hacerZoomAGeometria(geom, {
    maxZoom: 18,
    factorExpansion: 0.55,
    minExpansionMetros: 32,
    ...options
  });
}

function programarZoomPredioSeleccionado(geometry, options = {}, seqCheck = null) {
  const geom = geometry || (claveSeleccionadaActual
    ? obtenerGeometriaPredioSeleccionado(claveSeleccionadaActual)
    : null);
  if (!geom) return;

  const opts = {
    maxZoom: 18,
    factorExpansion: 0.55,
    minExpansionMetros: 32,
    duration: 650,
    ...options
  };

  requestAnimationFrame(function() {
    setTimeout(function() {
      if (seqCheck !== null && seqCheck !== seleccionPredioSeq) return;
      hacerZoomAGeometria(geom, opts);
    }, 380);
  });
}

const sourceCambiosGeometricos = new ol.source.Vector({
  format: new ol.format.GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857"
  }),
  // Loader propio para poder enviar el token (OpenLayers no usa authHeaders).
  loader: function(extent, resolution, projection, success, failure) {
    const src = this;
    fetch(`${API}/cambios-geometricos`, { headers: authHeaders() })
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(data => {
        const features = src.getFormat().readFeatures(data, { featureProjection: projection });
        src.addFeatures(features);
        if (success) success(features);
      })
      .catch(err => {
        console.warn("No se pudieron cargar cambios geométricos:", err);
        src.removeLoadedExtent(extent);
        if (failure) failure();
      });
  }
});

const capaCambiosGeometricos = new ol.layer.Vector({
  source: sourceCambiosGeometricos,
  style: estiloCambiosGeometricos,
  visible: false
});

const prediosWmsLayer = new ol.layer.Tile({
  visible: false,
  opacity: 0.85,
  source: new ol.source.TileWMS({
    url: "https://fcnarqnodo.hopto.org/geoserver/catastro_bc/wms",
    params: {
      "LAYERS": "catastro_bc:predios_oficial",
      "TILED": true,
      "VERSION": "1.1.1",
      "FORMAT": "image/png",
      "TRANSPARENT": true
    },
    serverType: "geoserver",
    crossOrigin: "anonymous"
  })
});

const coloniasWmsLayer = new ol.layer.Tile({
  visible: true,
  opacity: 1,
  source: new ol.source.TileWMS({
    url: "https://fcnarqnodo.hopto.org/geoserver/geonode/wms",
    params: {
      "LAYERS": "colonias",
      "TILED": true,
      "VERSION": "1.1.1",
      "FORMAT": "image/png",
      "TRANSPARENT": true
    },
    serverType: "geoserver",
    crossOrigin: "anonymous"
  })
});

const codigosWmsLayer = new ol.layer.Tile({
  visible: false,
  opacity: 0.45,
  source: new ol.source.TileWMS({
    url: "https://fcnarqnodo.hopto.org/geoserver/geonode/wms",
    params: {
      "LAYERS": "codigos_postales_bc_utm1",
      "TILED": true,
      "VERSION": "1.1.1",
      "FORMAT": "image/png",
      "TRANSPARENT": true
    },
    serverType: "geoserver",
    crossOrigin: "anonymous"
  })
});

const osmLayer = new ol.layer.Tile({
  visible: false,
  source: new ol.source.OSM()
});

const esriLayer = new ol.layer.Tile({
  visible: false,
  source: new ol.source.XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attributions: "Tiles © Esri"
  })
});

const googleSatLayer = new ol.layer.Tile({
  visible: false,
  source: new ol.source.XYZ({
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attributions: "Google Satellite"
  })
});

const googleHybridLayer = new ol.layer.Tile({
  visible: true,
  source: new ol.source.XYZ({
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attributions: "Google Hybrid"
  })
});

function controlesMapaSinZoom() {
  try {
    if (ol.control?.defaults?.defaults) {
      return ol.control.defaults.defaults({ zoom: false, rotate: false });
    }
    if (typeof ol.control?.defaults === "function") {
      return ol.control.defaults({ zoom: false, rotate: false });
    }
  } catch (e) {
    console.warn("No se pudieron configurar controles del mapa:", e);
  }
  return undefined;
}

const map = new ol.Map({
  target: "map",
  layers: [
    osmLayer,
    esriLayer,
    googleSatLayer,
    googleHybridLayer,
    codigosWmsLayer,
    coloniasWmsLayer,
    prediosWmsLayer,
    capaCambiosGeometricos,
    vectorLayer,
    seleccionContornoLayer
  ],
  controls: controlesMapaSinZoom(),
  view: new ol.View({
    projection: "EPSG:3857",
    center: ol.proj.fromLonLat([-115.4683, 32.6245]),
    zoom: 12
  })
});

function cambiarCapaBase() {
  const valor = document.getElementById("baseLayerSelect").value;
  osmLayer.setVisible(valor === "osm");
  esriLayer.setVisible(valor === "esri");
  googleSatLayer.setVisible(valor === "googleSat");
  googleHybridLayer.setVisible(valor === "googleHybrid");
}

function togglePrediosWms() {
  const chk = document.getElementById("chkPrediosWms");
  aplicarVisibilidadCapaWms(prediosWmsLayer, chk?.checked === true);
  refrescarLeyendaDespuesDeCambio();
}

function toggleColoniasWms() {
  const chk = document.getElementById("chkColoniasWms");
  aplicarVisibilidadCapaWms(coloniasWmsLayer, chk?.checked === true);
  refrescarLeyendaDespuesDeCambio();
}

function toggleCodigosWms() {
  const chk = document.getElementById("chkCodigosWms");
  aplicarVisibilidadCapaWms(codigosWmsLayer, chk?.checked === true);
  refrescarLeyendaDespuesDeCambio();
}

function toggleCambiosGeom() {
  const chk = document.getElementById("chkCambiosGeom");
  aplicarVisibilidadCapaWms(capaCambiosGeometricos, chk?.checked === true);
  refrescarLeyendaDespuesDeCambio();
}

function toggleDashboardVisible() {
  const dashboard = document.getElementById("dashboardCartografico");
  const chk = document.getElementById("chkDashboard");
  if (!dashboard || !chk) return;
  dashboard.classList.toggle("oculto", !chk.checked);
}

function toggleDashboard() {
  const dashboard = document.getElementById("dashboardCartografico");
  const contenido = document.getElementById("dashboardContenido");
  const indicador = document.getElementById("dashboardToggleIcon");
  if (!dashboard || !contenido) return;

  const minimizado = dashboard.classList.toggle("minimizado");
  contenido.style.display = minimizado ? "none" : "block";
  if (indicador) indicador.textContent = minimizado ? "▸" : "▾";
}

function inicializarDashboardMinimizado() {
  const dashboard = document.getElementById("dashboardCartografico");
  const contenido = document.getElementById("dashboardContenido");
  const indicador = document.getElementById("dashboardToggleIcon");
  if (!dashboard || !contenido) return;

  dashboard.classList.add("minimizado");
  contenido.style.display = "none";
  if (indicador) indicador.textContent = "▸";
}


/* --- v19: Leyenda dinámica flotante tipo MapStore --- */
function capaVisibleSegura(capa) {
  try {
    return capa && typeof capa.getVisible === "function" ? capa.getVisible() : false;
  } catch (e) {
    return false;
  }
}

function obtenerContenedorLeyendaActivo() {
  return document.getElementById("leyendaContenido");
}

function aplicarCapasVistaGeneral() {
  capaOrdenEstado.colonias = 50;
  capaOrdenEstado.predios = 30;
  aplicarZIndexCapa("colonias");
  aplicarZIndexCapa("predios");

  const chkPred = document.getElementById("chkPrediosWms");
  const chkCol = document.getElementById("chkColoniasWms");
  if (chkPred) chkPred.checked = false;
  if (chkCol) chkCol.checked = true;

  aplicarVisibilidadCapaWms(prediosWmsLayer, false);
  aplicarVisibilidadCapaWms(coloniasWmsLayer, true);
  coloniasWmsLayer.setOpacity(1);

  const opColonias = document.getElementById("opColonias");
  const opColoniasTxt = document.getElementById("opColoniasTxt");
  if (opColonias) opColonias.value = 100;
  if (opColoniasTxt) opColoniasTxt.textContent = "100%";

  refrescarLeyendaDespuesDeCambio();
}

function activarCapasPredioSeleccionado() {
  capaOrdenEstado.predios = 55;
  capaOrdenEstado.colonias = 45;
  aplicarZIndexCapa("predios");
  aplicarZIndexCapa("colonias");

  const chkPred = document.getElementById("chkPrediosWms");
  if (chkPred) chkPred.checked = true;
  aplicarVisibilidadCapaWms(prediosWmsLayer, true);

  refrescarLeyendaDespuesDeCambio();
}

function restaurarCapasModuloCompleto() {
  const chkPred = document.getElementById("chkPrediosWms");
  if (chkPred && !chkPred.checked) {
    chkPred.checked = true;
    aplicarVisibilidadCapaWms(prediosWmsLayer, true);
    capaOrdenEstado.predios = 30;
    aplicarZIndexCapa("predios");
    refrescarLeyendaDespuesDeCambio();
  }
}

function toggleLeyendaIntegradaPanel() {
  const wrap = document.getElementById("panelLeyendaIntegrada");
  const toggle = document.getElementById("panelLeyendaToggle");
  if (!wrap) return;
  wrap.classList.toggle("colapsada");
  if (toggle) toggle.textContent = wrap.classList.contains("colapsada") ? "▸" : "▾";
}

function aplicarVisibilidadLeyendaIntegrada(visible) {
  const wrap = document.getElementById("panelLeyendaIntegrada");
  const flotante = document.getElementById("leyendaDinamica");
  const btn = document.getElementById("btnMostrarLeyenda");
  const toggle = document.getElementById("panelLeyendaToggle");
  if (wrap) {
    wrap.classList.toggle("oculto", !visible);
    if (visible) {
      wrap.classList.remove("colapsada");
      if (toggle) toggle.textContent = "▾";
    }
  }
  if (flotante) flotante.classList.add("oculto");
  if (btn) btn.classList.add("oculto");
  actualizarLeyendaDinamica();
}

function toggleLeyendaDinamica() {
  const chk = document.getElementById("chkLeyenda");
  const visible = document.getElementById("panelLeyendaIntegrada")?.classList.contains("oculto");
  aplicarVisibilidadLeyendaIntegrada(!!visible);
  if (chk) chk.checked = !!visible;
}

function toggleLeyendaDesdePanel() {
  const chk = document.getElementById("chkLeyenda");
  if (!chk) return;
  aplicarVisibilidadLeyendaIntegrada(chk.checked);
}

function minimizarLeyendaDinamica() {
  toggleLeyendaIntegradaPanel();
}

function toggleTablaResultadosMinimizada() {
  const tabla = document.getElementById("tablaResultadosFlotante");
  if (!tabla || tabla.classList.contains("oculto")) return;
  tabla.classList.toggle("minimizada");
  document.body.classList.toggle("tabla-resultados-minimizada", tabla.classList.contains("minimizada"));
  setTimeout(() => {
    if (typeof map !== "undefined" && map) map.updateSize();
  }, 200);
}

function itemLeyenda(colorClass, titulo, detalle = "") {
  return `
    <div class="leyenda-item">
      <span class="leyenda-simbolo ${colorClass}"></span>
      <div>
        <b>${titulo}</b>
        ${detalle ? `<small>${detalle}</small>` : ""}
      </div>
    </div>
  `;
}

function grupoLeyenda(titulo, contenido) {
  if (!contenido || contenido.trim() === "") return "";
  return `
    <div class="leyenda-grupo">
      <div class="leyenda-grupo-title">${titulo}</div>
      ${contenido}
    </div>
  `;
}

function actualizarLeyendaDinamica() {
  const cont = obtenerContenedorLeyendaActivo();
  if (!cont) return;

  let html = "";

  const fiscalActivo = document.getElementById("chkAdeudosFiscal")?.checked || vectorSource.getFeatures().some(f => f.get("info_fiscal") === true);

  if (fiscalActivo) {
    html += grupoLeyenda("Fiscal", `
      ${itemLeyenda("simbolo-verde", "Sin adeudo", "Relleno verde en consulta de manzana")}
      ${itemLeyenda("simbolo-rojo", "Con adeudo", "Relleno rojo en consulta de manzana")}
      ${itemLeyenda("simbolo-seleccion", "Predio seleccionado", "Contorno azul continuo sobre todas las capas")}
    `);
  } else if (capaVisibleSegura(prediosWmsLayer) || vectorSource.getFeatures().length || (resultadosSource && resultadosSource.getFeatures().length)) {
    html += grupoLeyenda("Consulta", `
      ${itemLeyenda("simbolo-seleccion", "Predio seleccionado", "Contorno azul #0000ff")}
    `);
  }

  if (capaVisibleSegura(prediosWmsLayer)) {
    html += grupoLeyenda("Predios", `
      ${itemLeyenda("simbolo-predios", "Predios oficiales", "Capa WMS institucional")}
    `);
  }

  if (capaVisibleSegura(coloniasWmsLayer)) {
    html += grupoLeyenda("Colonias", `
      ${itemLeyenda("simbolo-colonias", "Colonias", "Límite de colonia WMS")}
    `);
  }

  if (capaVisibleSegura(codigosWmsLayer)) {
    html += grupoLeyenda("Códigos postales", `
      ${itemLeyenda("simbolo-codigos", "Códigos postales", "Límite CP WMS")}
    `);
  }

  if (capaVisibleSegura(capaCambiosGeometricos)) {
    html += grupoLeyenda("Auditoría geométrica", `
      ${itemLeyenda("simbolo-aud-alta", "Prioridad alta", "Cambio crítico / revisar")}
      ${itemLeyenda("simbolo-aud-media", "Prioridad media", "Cambio geométrico")}
      ${itemLeyenda("simbolo-aud-baja", "Prioridad baja", "Observación menor")}
    `);
  }

  if (!html.trim()) {
    html = `
      <div class="leyenda-vacia">
        Activa una capa para ver su simbología.
      </div>
    `;
  }

  cont.innerHTML = html;
}

function refrescarLeyendaDespuesDeCambio() {
  setTimeout(actualizarLeyendaDinamica, 80);
}

async function cargarDashboardCartografico() {
  try {
    const r = await fetch(`${API}/dashboard-cartografico?_=${Date.now()}`, {
      cache: "no-store",
      headers: authHeaders()
    });

    if (!r.ok) {
      console.error("Dashboard cartográfico HTTP:", r.status);
      return;
    }

    const d = await r.json();

    const setTxt = (id, valor) => {
      const el = document.getElementById(id);
      if (el) el.innerText = valor;
    };

    setTxt("dashTotal", Number(d.total_predios || 0).toLocaleString("es-MX"));
    setTxt("dashDibujados", Number(d.dibujados || 0).toLocaleString("es-MX"));
    setTxt("dashSinGeom", Number(d.sin_geometria || 0).toLocaleString("es-MX"));
    setTxt("dashCobertura", `${d.cobertura || 0}%`);
    setTxt("dashCambios", Number(d.cambios_geometricos || 0).toLocaleString("es-MX"));
    setTxt("headerDashTotal", Number(d.total_predios || 0).toLocaleString("es-MX"));
    setTxt("headerDashCobertura", `${d.cobertura || 0}%`);
    setTxt("headerDashCambios", Number(d.cambios_geometricos || 0).toLocaleString("es-MX"));

  } catch (e) {
    console.error("No se pudo cargar dashboard cartográfico", e);
  }
}


async function cargarDashboardFiscal() {
  try {
    const r = await fetch(`${API}/dashboard-fiscal?_=${Date.now()}`, {
      cache: "no-store",
      headers: authHeaders()
    });

    if (!r.ok) {
      console.warn("Dashboard fiscal HTTP:", r.status);
      return;
    }

    const d = await r.json();

    const setTxt = (id, valor) => {
      const el = document.getElementById(id);
      if (el) el.innerText = valor;
    };

    setTxt("dashConAdeudo", Number(d.con_adeudo || 0).toLocaleString("es-MX"));
    setTxt("dashSinAdeudo", Number(d.sin_adeudo || 0).toLocaleString("es-MX"));
    setTxt("dashAdeudoTotal", formatoMoneda(d.adeudo_total || 0));
    setTxt("dashValorTotal", formatoMoneda(d.valor_catastral_total || 0));
    setTxt("dashConDocs", Number((d.expediente && d.expediente.con_documentos) || 0).toLocaleString("es-MX"));
    setTxt("dashSinDocs", Number((d.expediente && d.expediente.sin_documentos) || 0).toLocaleString("es-MX"));

  } catch (e) {
    console.warn("No se pudo cargar dashboard fiscal", e);
  }
}


function porcentajeExpediente(p) {
  const campos = [
    p.tiene_documentos,
    p.tiene_cartografia,
    p.tiene_construccion,
    p.tiene_avaluo,
    p.tiene_inspeccion,
    p.tiene_rppc,
    p.tiene_fotografia,
    p.tiene_cedula,
    p.tiene_historial
  ];
  const completos = campos.filter(Boolean).length;
  return Math.round((completos / campos.length) * 100);
}

function claseAvanceExpediente(porcentaje) {
  if (porcentaje >= 80) return "badge-ok";
  if (porcentaje >= 40) return "badge-warn";
  return "badge-danger";
}

function textoAvanceExpediente(porcentaje) {
  if (porcentaje >= 80) return "COMPLETO";
  if (porcentaje >= 40) return "EN PROCESO";
  return "CRÍTICO";
}

