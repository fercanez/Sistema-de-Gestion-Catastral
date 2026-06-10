/* Inicializacion y listeners (codigo top-level; debe cargarse al final). */

map.on("click", async function(evt) {
  if (Date.now() < ignorarClickMapaHasta) return;
  if (evt.dragging) return;

  try {
    // 1) Selección exacta por coordenada (punto-en-polígono en PostGIS).
    //    Es la fuente más precisa: evita que el WMS (con tolerancia de píxeles)
    //    devuelva un predio vecino equivocado.
    const lonlat = ol.proj.toLonLat(evt.coordinate);
    const lon = lonlat[0];
    const lat = lonlat[1];

    try {
      const res = await fetch(`${API}/predios/intersecta?lon=${lon}&lat=${lat}&_=${Date.now()}`, {
        cache: "no-store",
        headers: authHeaders()
      });

      if (res.ok) {
        const featureGeojson = await res.json();
        const clave = extraerClavePredioProps(featureGeojson.properties);
        if (clave) {
          // Pasamos la geometría ya obtenida para feedback visual inmediato.
          await seleccionarPorClave(clave, "mapa", { geojsonPrefetch: featureGeojson });
          return;
        }
      }
    } catch (eInt) {
      console.warn("Fallo /predios/intersecta, se intenta WMS:", eInt);
    }

    // 2) Respaldo: WMS GetFeatureInfo (solo si la consulta exacta no respondió).
    const view = map.getView();
    const resolution = view.getResolution();
    const projection = view.getProjection();

    const wmsUrl = prediosWmsLayer.getSource().getFeatureInfoUrl(
      evt.coordinate,
      resolution,
      projection,
      {
        "INFO_FORMAT": "application/json",
        "FEATURE_COUNT": 10
      }
    );

    if (wmsUrl) {
      const rWms = await fetch(wmsUrl, { cache: "no-store" });

      if (rWms.ok) {
        const dataWms = await rWms.json();
        const features = dataWms.features || [];

        if (features.length > 0) {
          const elegido = elegirPredioWmsEnClick(features, evt.coordinate);
          const clave = extraerClavePredioProps(elegido?.properties);

          if (clave) {
            await seleccionarPorClave(clave, "mapa");
            return;
          }
        }
      }
    }

  } catch (err) {
    console.error("Error al seleccionar predio por click:", err);
  }
});

const popup = document.getElementById("popup");

map.on("pointermove", function(evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
    return feature;
  });

  if (feature) {
    const clave = feature.get("clave_catastral") || "";
    const superficie = feature.get("superficie") || feature.get("sup_documental") || "";
    const colonia = feature.get("colonia") || "";

    popup.innerHTML = `
      <b>${clave}</b><br>
      Colonia: ${colonia}<br>
      Sup: ${superficie} m²
    `;

    popup.style.left = evt.originalEvent.pageX + 12 + "px";
    popup.style.top = evt.originalEvent.pageY + 12 + "px";
    popup.style.display = "block";
    map.getTargetElement().style.cursor = "pointer";
  } else {
    popup.style.display = "none";
    map.getTargetElement().style.cursor = "";
  }
});
window.addEventListener("load", function() {
  prepararEventosLoginInstitucional();
  validarSesionInstitucional();

  registrarEnterBusquedas();
  inicializarFichaDraggable();
  inicializarBotonOcultarPanel();
  inicializarAdministradorCapas();
  inicializarDashboardMinimizado();
  actualizarLayoutPrincipal();
  actualizarLeyendaDinamica();
  if (typeof engancharPortalModulos === "function") engancharPortalModulos();
  if (document.getElementById("chkLeyenda")?.checked !== false) {
    aplicarVisibilidadLeyendaIntegrada(true);
  }
});
setTimeout(asegurarModalCopropietarios, 800);
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn-modal-test');
  if (!btn) return;
  if ((btn.textContent || '').toUpperCase().includes('CAMBIO DE NOMBRE')) {
    e.preventDefault();
    abrirModalCambioNombreV28b();
  }
});
setTimeout(() => {
  const modal = document.getElementById('modalMovimientoNombre');
  if (modal) {
    activarMayusculasOperativas(modal);
    bindPersonaModalInputs();
    cambiarTipoPersonaModal();
  }
}, 500);
setTimeout(() => {
  renderDetallesMovimiento();
}, 300);
setTimeout(initMovimientosPadronV57, 900);
setTimeout(asegurarModalClasificacionCondominioMasiva, 900);
