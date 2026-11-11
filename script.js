
document.addEventListener("DOMContentLoaded", () => {

    // 1. FUNCIONES GENERALES
    const $ = id => document.getElementById(id);
    const activar = (elemento, estado) =>
        elemento?.classList.toggle("active", estado);

    const esperar = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    // 2. MODO OSCURO AUTOMÁTICO Y MANUAL
    const botonTema = $("boton-tema");
    const sistema = matchMedia("(prefers-color-scheme: dark)");

    function actualizarTema() {
        const tema = document.documentElement.dataset.tema;
        const oscuro = tema
            ? tema === "oscuro"
            : sistema.matches;

        if (botonTema) {
            botonTema.textContent = oscuro ? "☀️" : "🌙";
            botonTema.setAttribute(
                "aria-label",
                oscuro ? "Activar modo claro" : "Activar modo oscuro"
            );
        }
    }

    // Sin selección manual, se utiliza el tema de Windows.
    delete document.documentElement.dataset.tema;
    actualizarTema();

    botonTema?.addEventListener("click", () => {
        const tema = document.documentElement.dataset.tema;
        const oscuro = tema
            ? tema === "oscuro"
            : sistema.matches;

        document.documentElement.dataset.tema =
            oscuro ? "claro" : "oscuro";

        actualizarTema();
    });

    sistema.addEventListener("change", actualizarTema);

    // 3. MENÚ MÓVIL Y NAVEGACIÓN
    const menu = $("barra-lateral");
    const capa = $("capa-oscura");

    function cerrarMenu() {
        activar(menu, false);
        activar(capa, false);
    }

    $("boton-menu")?.addEventListener("click", () => {
        const abierto = !menu.classList.contains("active");
        activar(menu, abierto);
        activar(capa, abierto);
    });

    capa?.addEventListener("click", cerrarMenu);

    const rutas = {
        resumen: "PLATAFORMA / RESUMEN",
        nodos: "PLATAFORMA / NODOS",
        red: "PLATAFORMA / RED",
        despliegues: "PLATAFORMA / DESPLIEGUES",
        actividad: "PLATAFORMA / ACTIVIDAD"
    };

    document.querySelectorAll(".panel-vista").forEach(panel => {
        if (!panel.querySelector(".ruta-navegacion")) {
            const ruta = document.createElement("div");
            ruta.className = "ruta-navegacion";
            panel.prepend(ruta);
        }
    });

    function switchTab(vista) {
        const panel = $(`view-${vista}`);
        if (!panel) return;

        document.querySelectorAll(".panel-vista").forEach(p => {
            activar(p, p === panel);
        });

        document.querySelectorAll(".enlace-navegacion").forEach(a => {
            activar(a, a.dataset.view === vista);
        });

        document.querySelectorAll(".enlace-lateral").forEach(a => {
            const activo = a.dataset.view === vista;
            activar(a, activo);

            const flecha = a.querySelector(".flecha-activa");
            if (flecha) flecha.textContent = activo ? ">" : "";
        });

        const ruta = panel.querySelector(".ruta-navegacion");
        if (ruta) ruta.textContent = rutas[vista] || "PLATAFORMA";

        cerrarMenu();
    }

    window.switchTab = switchTab;

    document.querySelectorAll("[data-view]").forEach(enlace => {
        enlace.addEventListener("click", e => {
            e.preventDefault();

            if (enlace.dataset.view === "configuracion") {
                cerrarMenu();
                abrirConfiguracion();
            } else {
                switchTab(enlace.dataset.view);
            }
        });
    });

    switchTab("resumen");

    // 4. SERVIDORES SIMULADOS
    const servidores = [
        { id: 1, nombre: "Cloud-Server-01", ip: "192.168.1.10", estado: "activo", cpu: 42 },
        { id: 2, nombre: "Cloud-Server-02", ip: "192.168.1.11", estado: "activo", cpu: 68 },
        { id: 3, nombre: "Cloud-Server-03", ip: "192.168.1.12", estado: "inactivo", cpu: 0 },
        { id: 4, nombre: "Cloud-Server-04", ip: "192.168.1.13", estado: "activo", cpu: 85 },
        { id: 5, nombre: "Cloud-Server-05", ip: "192.168.1.14", estado: "mantenimiento", cpu: 12 },
        { id: 6, nombre: "Cloud-Server-06", ip: "192.168.1.15", estado: "activo", cpu: 35 },
        { id: 7, nombre: "Cloud-Server-07", ip: "192.168.1.16", estado: "activo", cpu: 53 },
        { id: 8, nombre: "Cloud-Server-08", ip: "192.168.1.17", estado: "inactivo", cpu: 0 }
    ];

    let pagina = 1;
    const porPagina = 4;

    function mostrarServidores() {
        const cuerpo = $("cuerpo-servidores");
        if (!cuerpo) return;

        const texto = ($("buscar-servidor")?.value || "").toLowerCase().trim();
        const estado = $("filtrar-estado")?.value || "todos";

        const filtrados = servidores.filter(s =>
            (s.nombre.toLowerCase().includes(texto) || s.ip.includes(texto)) &&
            (estado === "todos" || s.estado === estado)
        );

        const total = Math.max(1, Math.ceil(filtrados.length / porPagina));
        pagina = Math.min(pagina, total);

        const registros = filtrados.slice(
            (pagina - 1) * porPagina,
            pagina * porPagina
        );

        cuerpo.innerHTML = "";

        registros.forEach(s => {
            const fila = document.createElement("tr");

            [s.nombre, s.ip].forEach(valor => {
                const td = document.createElement("td");
                td.textContent = valor;
                fila.append(td);
            });

            const tdEstado = document.createElement("td");
            const etiqueta = document.createElement("span");
            etiqueta.className = `estado-servidor ${s.estado}`;
            etiqueta.textContent =
                s.estado.charAt(0).toUpperCase() + s.estado.slice(1);
            tdEstado.append(etiqueta);

            const tdCPU = document.createElement("td");
            tdCPU.textContent = `${s.cpu}%`;

            const tdAccion = document.createElement("td");
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "boton-reiniciar";
            boton.textContent = "Reiniciar";
            boton.disabled = s.estado !== "activo";
            boton.addEventListener("click", () => abrirReinicio(s));

            tdAccion.append(boton);
            fila.append(tdEstado, tdCPU, tdAccion);
            cuerpo.append(fila);
        });

        if (!registros.length) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.colSpan = 5;
            celda.textContent = "No se encontraron servidores";
            celda.style.textAlign = "center";
            fila.append(celda);
            cuerpo.append(fila);
        }

        if ($("informacion-pagina")) {
            $("informacion-pagina").textContent =
                `Página ${pagina} de ${total}`;
        }

        if ($("pagina-anterior")) {
            $("pagina-anterior").disabled = pagina === 1;
        }

        if ($("pagina-siguiente")) {
            $("pagina-siguiente").disabled = pagina >= total;
        }
    }

    ["buscar-servidor", "filtrar-estado"].forEach(id => {
        $(id)?.addEventListener(
            id === "buscar-servidor" ? "input" : "change",
            () => {
                pagina = 1;
                mostrarServidores();
            }
        );
    });

    $("pagina-anterior")?.addEventListener("click", () => {
        if (pagina > 1) {
            pagina--;
            mostrarServidores();
        }
    });

    $("pagina-siguiente")?.addEventListener("click", () => {
        pagina++;
        mostrarServidores();
    });

    mostrarServidores();

    // 5. CONFIGURACIÓN - DRAWER
    const drawer = $("drawer-configuracion");
    const fondo = $("drawer-fondo");
    const formulario = $("form-configuracion");
    const nombre = $("nombre-instancia");
    const cpu = $("limite-cpu");
    const ram = $("limite-ram");

    let configuracion = {
        nombre: "Cloud-Server-01",
        cpu: 70,
        ram: 80,
        observaciones: "",
        fecha: "",
        alertas: true,
        prioridad: "Media"
    };

    let guardando = false;
    let focoAnterior = null;

    // Busca controles adicionales por su ID o nombre.
    const campo = (...ids) =>
        ids.map(id => $(id) || formulario?.elements.namedItem(id))
           .find(Boolean);

    const observaciones = campo("observaciones");
    const fecha = campo("fecha-mantenimiento", "fecha");
    const alertas = campo("activar-alertas", "alertas");
    const prioridad = campo("prioridad-alertas", "prioridad");

    function actualizarLimites() {
        if ($("valor-cpu")) $("valor-cpu").textContent = `${cpu.value}%`;
        if ($("valor-ram")) $("valor-ram").textContent = `${ram.value}%`;
    }

    function abrirConfiguracion() {
        if (!drawer) return;

        focoAnterior = document.activeElement;

        nombre.value = configuracion.nombre;
        cpu.value = configuracion.cpu;
        ram.value = configuracion.ram;

        if (observaciones) observaciones.value = configuracion.observaciones;
        if (fecha) fecha.value = configuracion.fecha;
        if (alertas) alertas.checked = configuracion.alertas;
        if (prioridad) prioridad.value = configuracion.prioridad;

        actualizarLimites();
        activar(drawer, true);
        activar(fondo, true);
        drawer.removeAttribute("inert");
        nombre.focus();
    }

    function cerrarConfiguracion() {
        if (guardando) return;

        activar(drawer, false);
        activar(fondo, false);
        drawer?.setAttribute("inert", "");

        if (focoAnterior?.isConnected) focoAnterior.focus();
    }

    drawer?.setAttribute("inert", "");

    $("abrir-configuracion")?.addEventListener("click", abrirConfiguracion);
    $("cerrar-drawer")?.addEventListener("click", cerrarConfiguracion);
    $("cancelar-configuracion")?.addEventListener("click", cerrarConfiguracion);
    fondo?.addEventListener("click", cerrarConfiguracion);

    cpu?.addEventListener("input", actualizarLimites);
    ram?.addEventListener("input", actualizarLimites);

    // LOADING + DISABLED: impide guardar varias veces.
    formulario?.addEventListener("submit", async e => {
        e.preventDefault();
        if (guardando || !nombre.value.trim()) {
            if (!guardando) nombre.focus();
            return;
        }

        const boton = formulario.querySelector('[type="submit"]');
        if (!boton) return;

        guardando = true;
        boton.disabled = true;
        boton.classList.add("boton-cargando");

        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '<span class="spinner"></span> Guardando...';

        try {
            await esperar(1200);

            configuracion = {
                nombre: nombre.value.trim(),
                cpu: Number(cpu.value),
                ram: Number(ram.value),
                observaciones: observaciones?.value || "",
                fecha: fecha?.value || "",
                alertas: alertas?.checked ?? true,
                prioridad: prioridad?.value || "Media"
            };

            alert("Configuración guardada correctamente (simulación).");
        } finally {
            boton.disabled = false;
            boton.classList.remove("boton-cargando");
            boton.innerHTML = textoOriginal;
            guardando = false;
            cerrarConfiguracion();
        }
    });

    // 6. REINICIO SIMULADO
    const modalReinicio = $("modal-reinicio");
    let servidorSeleccionado = null;
    let focoReinicio = null;

    function abrirReinicio(servidor) {
        if (servidor.estado !== "activo") return;

        servidorSeleccionado = servidor;
        focoReinicio = document.activeElement;

        $("servidor-reinicio").textContent = servidor.nombre;
        activar(modalReinicio, true);
        modalReinicio.removeAttribute("inert");
        $("cancelar-reinicio")?.focus();
    }

    function cerrarReinicio() {
        activar(modalReinicio, false);
        modalReinicio?.setAttribute("inert", "");

        if (focoReinicio?.isConnected) focoReinicio.focus();
        servidorSeleccionado = null;
    }

    modalReinicio?.setAttribute("inert", "");

    $("cancelar-reinicio")?.addEventListener("click", cerrarReinicio);

    $("confirmar-reinicio")?.addEventListener("click", () => {
        if (!servidorSeleccionado) return;

        const servidor = servidorSeleccionado;
        servidor.estado = "mantenimiento";
        servidor.cpu = 0;

        cerrarReinicio();
        mostrarServidores();

        alert(`Reinicio simulado de ${servidor.nombre}. Estado: Mantenimiento.`);
    });

    modalReinicio?.addEventListener("click", e => {
        if (e.target === modalReinicio) cerrarReinicio();
    });

    // 7. NUEVO DESPLIEGUE
    const modalAccion = $("modal-accion");

    $("boton-despliegue")?.addEventListener("click", () => {
        activar(modalAccion, true);
    });

    $("modal-cancelar")?.addEventListener("click", () => {
        activar(modalAccion, false);
    });

    $("modal-confirmar")?.addEventListener("click", () => {
        activar(modalAccion, false);
        alert("¡Despliegue iniciado correctamente! (Simulación)");
    });

    // 8. CERRAR CON ESCAPE
    document.addEventListener("keydown", e => {
        if (e.key !== "Escape") return;

        if (modalReinicio?.classList.contains("active")) {
            cerrarReinicio();
        } else if (modalAccion?.classList.contains("active")) {
            activar(modalAccion, false);
        } else if (drawer?.classList.contains("active")) {
            cerrarConfiguracion();
        } else {
            cerrarMenu();
        }
    });

});
