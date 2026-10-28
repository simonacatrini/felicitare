const $ = (id) => document.getElementById(id);

/* Întrebările */
const intrebari = [
    {
        titlu: "Cum l-ai descrie pe Cristian?",
        tip: "checkbox",
        optiuni: [
            "Frumos",
            "Deștept",
            "Amuzant",
            "Perfect"
        ]
    },
    {
        titlu: "Cine este persoana preferată a Simonei?",
        tip: "radio",
        optiuni: [
            "Michael Jackson",
            "Cristian Tanasache",
            "Harry Potter",
            "Spiderman"
        ]
    },
    {
        titlu: "Cât crezi că te iubesc?"
    }
];

let pas = 0;
let urmatoareaActiune = null;
let animatieInCurs = false;

/* Pe telefon, atingerea plicului îl păstrează deschis */
const plic = document.querySelector(".plic");

plic.addEventListener("click", () => {
    plic.classList.add("deschis");
});

/* Începerea verificării */
$("start").addEventListener("click", () => {
    $("inceput").hidden = true;
    $("quiz").hidden = false;

    arataIntrebarea();
});

/* Afișarea întrebării curente */
function arataIntrebarea() {
    const intrebare = intrebari[pas];

    $("pas").textContent =
        `Controlul identității · ${pas + 1} / 3`;

    $("titlu").textContent = intrebare.titlu;

    $("formular").hidden = false;
    $("feedback").hidden = true;

    $("optiuni").hidden = pas === 2;
    $("slider").hidden = pas !== 2;

    $("optiuni").replaceChildren();

    if (intrebare.optiuni) {
        const legenda = document.createElement("legend");

        legenda.className = "sr-only";

        legenda.textContent = pas === 0
            ? "Poți selecta mai multe variante"
            : "Selectează o variantă";

        $("optiuni").append(legenda);

        intrebare.optiuni.forEach((text, index) => {
            const eticheta = document.createElement("label");

            eticheta.className = "alegere";

            const input = document.createElement("input");

            input.type = intrebare.tip;
            input.name = "raspuns";
            input.value = index;

            const continut = document.createElement("span");

            continut.textContent = text;

            eticheta.append(input, continut);

            $("optiuni").append(eticheta);
        });
    }

    $("titlu").focus();
}

/* Afișarea emoji-ului și a mesajului */
function arataFeedback(emoji, mesaj, textButon, actiune) {
    $("formular").hidden = true;
    $("feedback").hidden = false;

    $("emoji").textContent = emoji;
    $("raspuns").textContent = mesaj;
    $("continua").textContent = textButon;

    urmatoareaActiune = actiune;

    $("continua").focus();
}

/* Butonul de sub mesaj */
$("continua").addEventListener("click", () => {
    if (urmatoareaActiune) {
        urmatoareaActiune();
    }
});

/* Trecerea la următoarea întrebare */
function urmatoareaIntrebare() {
    pas++;
    arataIntrebarea();
}

/* Verificarea răspunsurilor după Finish */
$("formular").addEventListener("submit", (event) => {
    event.preventDefault();

    if (animatieInCurs) {
        return;
    }

    const selectate = [
        ...$("optiuni").querySelectorAll("input:checked")
    ].map((input) => Number(input.value));

    /* Prima întrebare: toate patru trebuie bifate */
    if (pas === 0) {
        if (selectate.length !== 4) {
            arataFeedback(
                "🤨",
                "Greșit, toate cele 4 variante sunt corecte.",
                "Mai încerc",
                arataIntrebarea
            );
        } else {
            arataFeedback(
                "😏",
                "Vezi că știi?",
                "Următoarea întrebare",
                urmatoareaIntrebare
            );
        }

        return;
    }

    /* A doua întrebare: Cristian Tanasache */
    if (pas === 1) {
        const raspunsCorect =
            selectate.length === 1 && selectate[0] === 1;

        if (!raspunsCorect) {
            arataFeedback(
                "🙄",
                "Mai încearcă.",
                "Mai încerc",
                arataIntrebarea
            );
        } else {
            arataFeedback(
                "🥰",
                "Răspuns corect!",
                "Următoarea întrebare",
                urmatoareaIntrebare
            );
        }

        return;
    }

    /* A treia întrebare: orice valoare este acceptată */
    if (pas === 2) {
        pornesteIubirea();
    }
});

/* Actualizarea procentului când miști bara */
$("iubire").addEventListener("input", () => {
    const procent = Number($("iubire").value);

    $("valoare").textContent = `${procent}%`;
    $("umplere").style.width = `${procent}%`;
});

/* Bara crește singură până la marginea paginii */
function pornesteIubirea() {
    animatieInCurs = true;

    const bara = $("iubire");
    const umplere = $("umplere");
    const valoare = $("valoare");
    const finish = $("finish");

    finish.disabled = true;
    bara.disabled = true;

    const procentInitial = Number(bara.value);

    const dimensiuni = bara.getBoundingClientRect();
    const latimeInitiala = dimensiuni.width;

    const latimeFinala =
        document.documentElement.clientWidth - dimensiuni.left;

    const procentFinal =
        (latimeFinala / latimeInitiala) * 100;

    const miscareRedusa = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const durata = miscareRedusa ? 0 : 3500;
    const inceput = performance.now();

    function animeaza(acum) {
        const progres = durata === 0
            ? 1
            : Math.min((acum - inceput) / durata, 1);

        const procent =
            procentInitial +
            (procentFinal - procentInitial) * progres;

        /*
         * Până la 100%, se mișcă indicatorul.
         * După 100%, bara se lungește în afara cardului.
         */
        const latimeCurenta =
            latimeInitiala * Math.max(1, procent / 100);

        bara.style.width = `${latimeCurenta}px`;
        bara.value = Math.min(100, procent);

        umplere.style.width =
            `${latimeInitiala * procent / 100}px`;

        valoare.textContent = `${Math.round(procent)}%`;

        if (progres < 1) {
            requestAnimationFrame(animeaza);
        } else {
            valoare.textContent =
                `${Math.round(procent)}% — și tot nu încape! 💗`;

            finish.textContent = "Identitate confirmată 💗";

            setTimeout(() => {
                $("quiz").hidden = true;
                $("gata").hidden = false;

              $("card-amintiri").focus();
            }, miscareRedusa ? 0 : 1500);
        }
    }

    requestAnimationFrame(animeaza);
}
/* Deschiderea ferestrelor */
$("card-amintiri").addEventListener("click", () => {
    $("amintiri").showModal();
});

$("card-secret").addEventListener("click", () => {
    $("secret").showModal();

    if (!$("control-parola").hidden) {
        $("parola").focus();
    }
});

/* Închiderea ferestrelor */
document.querySelectorAll(".inchide").forEach((buton) => {
    buton.addEventListener("click", () => {
        buton.closest("dialog").close();
    });
});

/* Verificarea parolei */
$("formular-parola").addEventListener("submit", (event) => {
    event.preventDefault();

    const parola = $("parola").value.trim();

    if (parola === "06112023") {
        $("control-parola").hidden = true;
        $("mesaj-secret").hidden = false;

        const titlu = $("mesaj-secret").querySelector("h2");

        titlu.tabIndex = -1;
        titlu.focus();
    } else {
        $("eroare-parola").textContent =
            "Hmm… mai gândește-te la ziua noastră 🤭";

        $("parola").select();
    }
});

$("parola").addEventListener("input", () => {
    $("eroare-parola").textContent = "";
});

/* Cardul care fuge */
const cardFugar = $("card-despartire");

function fugiDeAici(event) {
    const pozitie = cardFugar.getBoundingClientRect();

    const margine = 16;
    const latimeEcran = document.documentElement.clientWidth;
    const inaltimeEcran = document.documentElement.clientHeight;

    const maximX = Math.max(
        margine,
        latimeEcran - pozitie.width - margine
    );

    const maximY = Math.max(
        margine,
        inaltimeEcran - pozitie.height - margine
    );

    const cursorX = event?.clientX ??
        pozitie.left + pozitie.width / 2;

    const cursorY = event?.clientY ??
        pozitie.top + pozitie.height / 2;

    let x = margine;
    let y = margine;
    let distantaMaxima = -1;

    // Alegem dintre mai multe poziții una departe de cursor.
    for (let i = 0; i < 25; i++) {
        const candidatX =
            margine + Math.random() * (maximX - margine);

        const candidatY =
            margine + Math.random() * (maximY - margine);

        const centruX = candidatX + pozitie.width / 2;
        const centruY = candidatY + pozitie.height / 2;

        const distanta = Math.hypot(
            centruX - cursorX,
            centruY - cursorY
        );

        if (distanta > distantaMaxima) {
            distantaMaxima = distanta;
            x = candidatX;
            y = candidatY;
        }
    }

    cardFugar.style.position = "fixed";
    cardFugar.style.width = `${pozitie.width}px`;
    cardFugar.style.minHeight = "0";
    cardFugar.style.height = `${pozitie.height}px`;
    cardFugar.style.left = `${x}px`;
    cardFugar.style.top = `${y}px`;

    $("mesaj-fugar").textContent =
        "N-ai ce să cauți acolo, noi nu avem dată de expirare :))) 💗";
}

cardFugar.addEventListener("pointerenter", fugiDeAici);

/* Și pe telefon fuge când încerci să îl apeși */
cardFugar.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    fugiDeAici(event);
});

/* Nici click-ul sau tastatura nu îl pot deschide */
cardFugar.addEventListener("click", (event) => {
    event.preventDefault();
    fugiDeAici(event);
});