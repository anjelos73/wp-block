# WP Block — Visual Page Builder

Un plugin WordPress per la costruzione visiva di layout drag-and-drop, ispirato a WP-Bakery. Sviluppato con PHP OOP + Vanilla JS + SortableJS, senza dipendenze da jQuery.

## Struttura

```
wp-block/
├── wp-block.php                  # Bootstrap plugin
├── includes/
│   ├── class-plugin.php          # Orchestratore
│   ├── class-admin.php           # Metabox, menu, editor
│   ├── class-assets.php          # Enqueue CSS/JS
│   ├── class-elements.php        # Registro elementi
│   └── class-shortcode.php       # Rendering frontend
├── templates/
│   └── elements/
│       └── text.php              # Template blocco Testo
├── assets/
│   ├── css/
│   │   ├── admin.css
│   │   └── front.css
│   └── js/
│       └── admin.js
└── README.md
```

## Installazione

1. Clona o scarica questa repository
2. Comprimi la cartella `wp-block/` come `.zip`
3. Vai in **WordPress Admin > Plugin > Aggiungi nuovo > Carica Plugin**
4. Carica il `.zip` e attiva

## Utilizzo

1. Crea o modifica una **pagina o post**
2. Trovi il meta-box **WP Block Editor** appena sopra l'editor classico
3. Clicca **Aggiungi Riga** per aggiungere una riga al layout
4. Dal pannello **Elementi** in basso, clicca **Testo** per aggiungere un blocco testo
5. Clicca sull'elemento nel canvas per modificarne le proprietà nella sidebar destra
6. **Salva** il post normalmente
7. Il layout viene visualizzato automaticamente al frontend

In alternativa usa lo shortcode manuale: `[wp_block_layout id="ID_POST"]`

## Iterazioni previste

| # | Contenuto |
|---|---|
| ✅ 1 | Struttura base, Text Block, editor drag-and-drop |
| 🔲 2 | Blocchi: Image, Button, Video, Divider, Spacer |
| 🔲 3 | Template predefiniti (Hero, Feature, CTA) |
| 🔲 4 | Frontend editor (live preview inline) |
| 🔲 5 | Animazioni, parallasse, responsive settings |

## Autore

Angelo Spanu — [GitHub @anjelos73](https://github.com/anjelos73)
