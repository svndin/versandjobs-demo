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


Bitte in der Demo keine echten Kundendaten verwenden.


## Version 2: Kundenabschluss ohne Codeansicht

Der Kunde sieht nach dem Absenden keine JSON- oder Plain-Text-Vorschau mehr.
Die Demo bereitet stattdessen ein strukturiertes Datenpaket als Datei vor.

Hinweis: GitHub Pages ist statisch. Für eine echte automatische Übermittlung an den Gutachter braucht die App später ein Backend oder einen E-Mail-/Webhook-Dienst.


## Version 4

- Progressive Disclosure korrigiert:
  - Unfallgegner-Felder erscheinen erst bei „Ja“
  - Anwalt-Felder erscheinen erst bei „Ja“
  - Werkstatt-Felder erscheinen erst bei „Ja“
  - Sonstiger Empfänger erscheint erst bei Auswahl „Sonstige Person“
- Kunden sehen keine JSON- oder Plain-Text-Codeansicht mehr.
- Nach Absenden erscheint eine Dankesseite.
- JSON wird als Datei vorbereitet und kann geteilt oder heruntergeladen werden.
