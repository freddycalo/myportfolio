# Portfolio — Fredelly Calò

Sito portfolio one-page (italiano). HTML, CSS e JavaScript puri: nessun framework,
nessuna build, nessuna dipendenza da installare.

```
index.html    struttura e contenuti (tutti i testi sono qui)
styles.css    design system: colori, tipografia, layout, animazioni
script.js     animazioni hero, reveal allo scroll, filtri competenze, menu attivo
```

## Animazioni incluse

Nome che entra lettera per lettera, schema tecnico SVG che si disegna con impulsi
luminosi, riga "focus" con effetto macchina da scrivere, titoli di sezione con
scramble, contatori animati, ticker delle competenze, cursore-mirino su desktop,
parallasse della griglia, bottoni magnetici e reveal allo scroll.
Tutto si disattiva con `prefers-reduced-motion`; il mirino è disattivato su touch.

## Come vederlo in locale

Basta aprire `index.html` con il browser. In alternativa, con Python:

```bash
python3 -m http.server 5500
# poi apri http://localhost:5500
```

## Come pubblicarlo gratis

- **GitHub Pages**: crea un repository, carica questi file nella radice,
  poi *Settings → Pages → Source: Deploy from a branch → main / (root)*.
- **Netlify / Vercel**: trascina la cartella nella dashboard (non serve alcun comando di build).

## Come modificarlo

- **Testi**: sono tutti in `index.html`, nella sezione corrispondente.
- **Colori e font**: in cima a `styles.css`, nel blocco `:root`. La palette è
  carta (`--paper`), blu notte (`--night`), arancione (`--flame`), ocra (`--amber`)
  e verde acqua (`--mint`). Cambiando quei valori cambia l'identità dell'intero sito.
- **Nuova competenza**: duplica un blocco `<article class="skill" data-cat="...">`
  usando una delle categorie esistenti (`dev`, `net`, `tools`, `soft`).
- **Nuova esperienza**: duplica un blocco `<article class="job">`.

## Note

- Responsive da 360px in su, animazioni disattivate per chi ha `prefers-reduced-motion`.
- Senza JavaScript la pagina resta completa e leggibile.
- Email e telefono sono link `mailto:` e `tel:`: da telefono partono con un tocco.
