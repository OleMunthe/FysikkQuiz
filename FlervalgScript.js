// =======================
// IDENTIFIKASJON
// =======================
const path = window.location.pathname;
const match = path.match(/Oppgave(\d+)\.html/i);
const OPPGAVE_ID = match ? parseInt(match[1], 10) : 1;

const kategori = sessionStorage.getItem("valgtKategori") || "standard";
const STORAGE_KEY = `quizData_${kategori}`;
const TOTAL_OPPGAVER = parseInt(sessionStorage.getItem("totalOppgaver")) || 1;

if (OPPGAVE_ID === 1 && !sessionStorage.getItem("harStartet")) {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem("harStartet", "true");
}

// =======================
// DATA
// =======================
function hentData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { 
        riktige: [], 
        feil: {}   // <-- objekt med teller
    };
}

function lagreData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// =======================
// UI
// =======================
function initUI() {
    document.getElementById("riktig").textContent = 0;
    document.getElementById("feil").textContent = 0;
    document.getElementById("prosent").textContent = 0;
    document.getElementById("progress").style.width = "0%";
}

function oppdaterStatus() {
    const data = hentData();

    const antallRiktig = data.riktige.length;

    const antallFeil = Object.values(data.feil)
        .reduce((sum, val) => sum + val, 0);

    const besvart = antallRiktig + antallFeil;

    document.getElementById("riktig").textContent = antallRiktig;
    document.getElementById("feil").textContent = antallFeil;

    const scoreProsent = besvart > 0 
        ? Math.round((antallRiktig / besvart) * 100) 
        : 0;

    document.getElementById("prosent").textContent = scoreProsent;

    const progressProsent = Math.round((antallRiktig / TOTAL_OPPGAVER) * 100);
    document.getElementById("progress").style.width = progressProsent + "%";
}

// =======================
// SVARSJEKK DIREKTE
// =======================
document.querySelectorAll('.svar').forEach(label => {
    label.addEventListener('click', () => {

        // Hvis allerede valgt, gjør ingenting
        if (label.classList.contains('riktig') || label.classList.contains('feil')) return;

        const input = label.querySelector('input');
        const verdi = input.value;

        // Marker visuelt
        if (verdi === 'riktig') {
            label.classList.add('riktig');
        } else {
            label.classList.add('feil');
        }

        // Lås alle alternativer
        document.querySelectorAll('.svar').forEach(l => {
            l.querySelector('input').disabled = true;
            l.style.pointerEvents = 'none';
        });

        // Oppdater data
        let data = hentData();

        if (verdi === 'riktig') {

            // legg til i riktige hvis ikke finnes
            if (!data.riktige.includes(OPPGAVE_ID)) {
                data.riktige.push(OPPGAVE_ID);
            }


        } else {

            // tell feilforsøk
            if (!data.feil[OPPGAVE_ID]) {
                data.feil[OPPGAVE_ID] = 0;
            }
            data.feil[OPPGAVE_ID]++;

        }

        lagreData(data);
        oppdaterStatus();

        // Vis neste-knapp
        document.getElementById('neste').style.display = 'inline-block';
    });
});

// =======================
// NESTE SPØRSMÅL
// =======================
function nesteSporsmal() {
    const data = hentData();
    const tilgjengelige = [];

    for (let i = 1; i <= TOTAL_OPPGAVER; i++) {
        if (!data.riktige.includes(i)) {
            tilgjengelige.push(i);
        }
    }

    if (tilgjengelige.length === 0) {
        alert("Hipp hurra! Du har løst alle oppgavene 🤓");
        return;
    }

    const tilfeldig = tilgjengelige[Math.floor(Math.random() * tilgjengelige.length)];
    window.location.href = `Oppgave${tilfeldig}.html`;
}

// =======================
// INIT
// =======================
initUI();
oppdaterStatus();