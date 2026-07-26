document.addEventListener("DOMContentLoaded", () => {
    const botaoMenu = document.getElementById("botao-menu");
    const menu = document.getElementById("menu");
    const linksMenu = [...document.querySelectorAll('.menu a[href^="#"]')];
    const secoes = [...document.querySelectorAll("main section[id]")];
    const ano = document.getElementById("ano");

    if (ano) ano.textContent = new Date().getFullYear();


    const fecharMenu = () => {
        menu?.classList.remove("aberto");
        botaoMenu?.classList.remove("aberto");
        botaoMenu?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-aberto");
    };

    botaoMenu?.addEventListener("click", () => {
        const aberto = menu?.classList.toggle("aberto") ?? false;
        botaoMenu.classList.toggle("aberto", aberto);
        botaoMenu.setAttribute("aria-expanded", String(aberto));
        document.body.classList.toggle("menu-aberto", aberto);
    });

    linksMenu.forEach(link => link.addEventListener("click", fecharMenu));
    document.addEventListener("keydown", e => e.key === "Escape" && fecharMenu());
    window.addEventListener("resize", () => window.innerWidth > 900 && fecharMenu());

    const atualizarLinkAtivo = () => {
        const posicao = window.scrollY + 160;
        let idAtivo = "inicio";
        secoes.forEach(secao => {
            if (posicao >= secao.offsetTop) idAtivo = secao.id;
        });
        linksMenu.forEach(link => {
            link.classList.toggle("ativo", link.getAttribute("href") === `#${idAtivo}`);
        });
    };
    atualizarLinkAtivo();
    window.addEventListener("scroll", atualizarLinkAtivo, { passive: true });

    const itens = document.querySelectorAll(".animar-entrada");
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entradas => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visivel");
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: .12, rootMargin: "0px 0px -45px 0px" });
        itens.forEach(item => observer.observe(item));
    } else {
        itens.forEach(item => item.classList.add("visivel"));
    }

    configurarCarrossel();
});

function configurarCarrossel() {
    const carrossel = document.getElementById("carrossel-hero");
    if (!carrossel) return;

    const slides = [...carrossel.querySelectorAll(".slide-hero")];
    const indicadores = [...carrossel.querySelectorAll(".indicador")];
    const anterior = carrossel.querySelector(".controle-carrossel.anterior");
    const proximo = carrossel.querySelector(".controle-carrossel.proximo");
    if (!slides.length) return;

    // Usa cada imagem também como fundo desfocado do próprio slide.
    // Assim a arte principal aparece inteira e as sobras de proporção
    // são preenchidas sem faixas ou cortes bruscos.
    slides.forEach(slide => {
        const imagem = slide.querySelector("img");
        if (!imagem) return;

        const caminho = imagem.currentSrc || imagem.src;
        slide.style.setProperty("--imagem-slide", `url("${caminho}")`);
    });

    let atual = 0;
    let intervalo;

    const mostrar = indice => {
        atual = (indice + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            const ativo = i === atual;
            slide.classList.toggle("ativo", ativo);
            slide.setAttribute("aria-hidden", String(!ativo));
        });
        indicadores.forEach((indicador, i) => {
            const ativo = i === atual;
            indicador.classList.toggle("ativo", ativo);
            indicador.setAttribute("aria-current", String(ativo));
        });
    };

    const parar = () => clearInterval(intervalo);
    const iniciar = () => {
        parar();
        intervalo = setInterval(() => mostrar(atual + 1), 5000);
    };

    anterior?.addEventListener("click", () => { mostrar(atual - 1); iniciar(); });
    proximo?.addEventListener("click", () => { mostrar(atual + 1); iniciar(); });
    indicadores.forEach((botao, i) => botao.addEventListener("click", () => {
        mostrar(i);
        iniciar();
    }));

    carrossel.addEventListener("mouseenter", parar);
    carrossel.addEventListener("mouseleave", iniciar);
    carrossel.addEventListener("focusin", parar);
    carrossel.addEventListener("focusout", iniciar);

    let toqueInicial = 0;
    carrossel.addEventListener("touchstart", e => {
        toqueInicial = e.changedTouches[0].clientX;
        parar();
    }, { passive: true });
    carrossel.addEventListener("touchend", e => {
        const diferenca = toqueInicial - e.changedTouches[0].clientX;
        if (Math.abs(diferenca) > 45) mostrar(atual + (diferenca > 0 ? 1 : -1));
        iniciar();
    }, { passive: true });

    document.addEventListener("visibilitychange", () => document.hidden ? parar() : iniciar());
    mostrar(0);
    iniciar();
}
