document.addEventListener("DOMContentLoaded", () => {
    const botaoMenu = document.getElementById("botao-menu");
    const menu = document.getElementById("menu");
    const linksMenu = [...document.querySelectorAll(".menu a")];
    const dropdownsMenu = [...document.querySelectorAll("[data-menu-dropdown]")];
    const botoesDropdown = [...document.querySelectorAll("[data-menu-button]")];
    const paginaAtual = document.body.dataset.page;
    const ano = document.getElementById("ano");
    const cabecalho = document.querySelector(".cabecalho");
    
    if (ano) ano.textContent = new Date().getFullYear();
    
    // Efeito de scroll no cabeçalho
    if (cabecalho) {
        const atualizarCabecalho = () => {
            cabecalho.classList.toggle("scrolled", window.scrollY > 30);
        };
        window.addEventListener("scroll", atualizarCabecalho, { passive: true });
        atualizarCabecalho();
    }
    
    configurarTema();
    configurarTawkTo();
    configurarFormularioDiagnostico();
    
    // Marcar links ativos
    linksMenu.forEach(link => {
        const ativo = link.dataset.page === paginaAtual;
        link.classList.toggle("ativo", ativo);
        if (ativo) link.setAttribute("aria-current", "page");
    });
    
    botoesDropdown.forEach(botao => {
        const paginasDoGrupo = (botao.dataset.pageGroup || "").split(",");
        botao.classList.toggle("ativo", paginasDoGrupo.includes(paginaAtual));
    });
    
    // Fechar dropdowns
    const fecharDropdowns = excecao => {
        dropdownsMenu.forEach(dropdown => {
            if (dropdown === excecao) return;
            dropdown.classList.remove("aberto");
            dropdown.querySelector("[data-menu-button]")?.setAttribute("aria-expanded", "false");
        });
    };
    
    botoesDropdown.forEach(botao => {
        botao.addEventListener("click", evento => {
            evento.stopPropagation();
            const dropdown = botao.closest("[data-menu-dropdown]");
            const deveAbrir = !dropdown?.classList.contains("aberto");
            fecharDropdowns(dropdown);
            dropdown?.classList.toggle("aberto", deveAbrir);
            botao.setAttribute("aria-expanded", String(deveAbrir));
        });
    });
    
    const fecharMenu = () => {
        fecharDropdowns();
        menu?.classList.remove("aberto");
        botaoMenu?.classList.remove("aberto");
        botaoMenu?.setAttribute("aria-expanded", "false");
        botaoMenu?.setAttribute("aria-label", "Abrir menu");
        document.body.classList.remove("menu-aberto");
    };
    
    botaoMenu?.addEventListener("click", () => {
        const aberto = menu?.classList.toggle("aberto") ?? false;
        botaoMenu.classList.toggle("aberto", aberto);
        botaoMenu.setAttribute("aria-expanded", String(aberto));
        botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
        document.body.classList.toggle("menu-aberto", aberto);
    });
    
    linksMenu.forEach(link => link.addEventListener("click", fecharMenu));
    
    document.addEventListener("click", evento => {
        if (!evento.target.closest("[data-menu-dropdown]")) fecharDropdowns();
    });
    
    document.addEventListener("keydown", evento => evento.key === "Escape" && fecharMenu());
    window.addEventListener("resize", () => window.innerWidth > 960 && fecharMenu());
    
    // Animações de entrada
    const itens = document.querySelectorAll(".animar-entrada");
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entradas => {
            entradas.forEach((entrada, index) => {
                if (entrada.isIntersecting) {
                    setTimeout(() => {
                        entrada.target.classList.add("visivel");
                    }, index * 80);
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -45px 0px" });
        itens.forEach(item => observer.observe(item));
    } else {
        itens.forEach(item => item.classList.add("visivel"));
    }
    
    configurarCarrossel();
});

function configurarTema() {
    const botoes = [...document.querySelectorAll("[data-theme-toggle]")];
    if (!botoes.length) return;
    
    const aplicarEstado = tema => {
        const claro = tema === "light";
        botoes.forEach(botao => {
            botao.setAttribute("aria-label", claro ? "Ativar tema escuro" : "Ativar tema claro");
            botao.setAttribute("title", claro ? "Ativar tema escuro" : "Ativar tema claro");
            const icone = botao.querySelector(".tema-icone");
            if (icone) icone.textContent = claro ? "☾" : "☀";
        });
        const corTema = document.querySelector('meta[name="theme-color"]');
        if (corTema) corTema.setAttribute("content", claro ? "#f8fafc" : "#06101f");
    };
    
    aplicarEstado(document.documentElement.dataset.theme || "dark");
    
    botoes.forEach(botao => botao.addEventListener("click", () => {
        const atual = document.documentElement.dataset.theme || "dark";
        const proximo = atual === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = proximo;
        try { localStorage.setItem("infoprime-theme", proximo); } catch (_) {}
        aplicarEstado(proximo);
    }));
}

function configurarFormularioDiagnostico() {
    const formulario = document.getElementById("form-diagnostico");
    if (!formulario) return;
    
    formulario.addEventListener("submit", evento => {
        evento.preventDefault();
        if (!formulario.reportValidity()) return;
        
        const dados = new FormData(formulario);
        const texto = [
            "Olá! Vim pelo site da InfoPrime e gostaria de solicitar uma avaliação inicial.",
            "",
            `Nome: ${dados.get("nome")}`,
            `Empresa: ${dados.get("empresa")}`,
            `Telefone: ${dados.get("telefone") || "Não informado"}`,
            `Usuários: ${dados.get("usuarios")}`,
            `Computadores: ${dados.get("computadores")}`,
            `Necessidade: ${dados.get("necessidade")}`,
            `Cenário: ${dados.get("descricao")}`
        ].join("\n");
        
        const status = document.getElementById("form-status");
        if (status) status.textContent = "Abrindo o WhatsApp com sua avaliação...";
        
        window.open(`https://wa.me/5522988083414?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
    });
}

function configurarCarrossel() {
    const carrossel = document.getElementById("carrossel-hero");
    if (!carrossel) return;
    
    const slides = [...carrossel.querySelectorAll(".slide-hero")];
    const indicadores = [...carrossel.querySelectorAll(".indicador")];
    const anterior = carrossel.querySelector(".controle-carrossel.anterior");
    const proximo = carrossel.querySelector(".controle-carrossel.proximo");
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (!slides.length) return;
    
    let atual = 0;
    let intervalo;

    // Cada mensagem do hero permanece visível por 18 segundos.
    const TEMPO_POR_SLIDE = 18000;
    
    const heroTitulo = document.getElementById("hero-titulo");
    const heroSubtitulo = document.getElementById("hero-subtitulo");
    
    const animarTrocaTexto = (novoTitulo, novoSubtitulo) => {
        if (!heroTitulo || !heroSubtitulo) return;
        
        [heroTitulo, heroSubtitulo].forEach(el => {
            el.style.transition = "opacity 0.35s ease, transform 0.35s ease";
            el.style.opacity = "0";
            el.style.transform = "translateY(10px)";
        });
        
        setTimeout(() => {
            heroTitulo.innerHTML = novoTitulo;
            heroSubtitulo.textContent = novoSubtitulo;
            
            [heroTitulo, heroSubtitulo].forEach(el => {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
            });
        }, 350);
    };
    
    const mostrar = indice => {
        atual = (indice + slides.length) % slides.length;
        const slideAtivo = slides[atual];
        
        slides.forEach((slide, indiceSlide) => {
            const ativo = indiceSlide === atual;
            slide.classList.toggle("ativo", ativo);
            slide.setAttribute("aria-hidden", String(!ativo));
        });
        indicadores.forEach((indicador, indiceIndicador) => {
            const ativo = indiceIndicador === atual;
            indicador.classList.toggle("ativo", ativo);
            indicador.setAttribute("aria-current", String(ativo));
        });
        
        // Trocar textos dinâmicos da hero
        const novoTitulo = slideAtivo.dataset.titulo;
        const novoSubtitulo = slideAtivo.dataset.subtitulo;
        if (novoTitulo && novoSubtitulo) {
            animarTrocaTexto(novoTitulo, novoSubtitulo);
        }
    };
    
    const parar = () => clearInterval(intervalo);
    
    const iniciar = () => {
        parar();
        if (!reduzirMovimento) intervalo = setInterval(() => mostrar(atual + 1), TEMPO_POR_SLIDE);
    };
    
    anterior?.addEventListener("click", () => { mostrar(atual - 1); iniciar(); });
    proximo?.addEventListener("click", () => { mostrar(atual + 1); iniciar(); });
    
    indicadores.forEach((botao, indice) => botao.addEventListener("click", () => { mostrar(indice); iniciar(); }));
    
    carrossel.addEventListener("mouseenter", parar);
    carrossel.addEventListener("mouseleave", iniciar);
    carrossel.addEventListener("focusin", parar);
    carrossel.addEventListener("focusout", iniciar);
    
    let toqueInicial = 0;
    carrossel.addEventListener("touchstart", evento => {
        toqueInicial = evento.changedTouches[0].clientX;
        parar();
    }, { passive: true });
    
    carrossel.addEventListener("touchend", evento => {
        const diferenca = toqueInicial - evento.changedTouches[0].clientX;
        if (Math.abs(diferenca) > 45) mostrar(atual + (diferenca > 0 ? 1 : -1));
        iniciar();
    }, { passive: true });
    
    document.addEventListener("visibilitychange", () => document.hidden ? parar() : iniciar());
    
    mostrar(0);
    iniciar();
}

function configurarTawkTo() {
    const TAWK_SRC = "https://embed.tawk.to/6aa1d85854084334472a7223/1k243a8ih";

    if (window.__infoprimeTawkInjected) return;
    if (document.querySelector(`script[src="${TAWK_SRC}"]`)) {
        window.__infoprimeTawkInjected = true;
        return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];

    s1.async = true;
    s1.src = TAWK_SRC;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    s1.id = "tawkto-script";

    if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
    } else {
        document.head.appendChild(s1);
    }

    window.__infoprimeTawkInjected = true;
}

