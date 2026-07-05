# GutachtenLink – GitHub-Pages Demo

Mobile Demo für einen **Beteiligten- und Versandassistenten für Kfz-Gutachter**.

## Funktionen

- Gutachter legt auf dem Handy einen Fall an
- App erzeugt einen fallbezogenen Kundenlink
- Link kann per SMS oder E-Mail geöffnet werden
- Kunde füllt geführte Schadenaufnahme aus
- App erzeugt strukturierte Datei, Versandvorschlag und offene Angaben

## Wichtig

Diese Demo ist statisch und speichert keine Daten auf einem Server. Für einen echten Pilotbetrieb braucht man später ein Backend, z. B. Supabase/Firebase/Vercel/Netlify Functions oder eigener EU-Server.

## GitHub Pages Deployment

1. Neues Repository erstellen, z. B. `gutachtenlink-demo`
2. Dateien aus diesem Ordner hochladen
3. Settings → Pages → Deploy from branch → `main` → `/root`
4. Link an den Gutachter senden

Bitte in der Demo keine echten Kundendaten verwenden.

## Version 2: Progressive Felder

In dieser Version werden Zusatzfelder erst angezeigt, wenn sie relevant sind:

- Unfallgegner-Felder erscheinen erst bei „Unfallgegner bekannt: Ja“
- Anwalt-Felder erscheinen erst bei „Rechtsanwalt beteiligt: Ja“
- Werkstatt-Felder erscheinen erst bei „Werkstatt vorhanden: Ja“
- Sonstiger Empfänger erscheint erst, wenn „Sonstige Person“ ausgewählt wurde

Dadurch wirkt die Kundenansicht deutlich kürzer, einfacher und professioneller.


## Version 3: Kundenabschluss ohne Codeansicht

Der Kunde sieht nach dem Absenden keine JSON- oder Plain-Text-Vorschau mehr.
Die Demo bereitet stattdessen ein strukturiertes Datenpaket als Datei vor.

Hinweis: GitHub Pages ist statisch. Für eine echte automatische Übermittlung an den Gutachter braucht die App später ein Backend oder einen E-Mail-/Webhook-Dienst.
