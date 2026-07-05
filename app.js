const App = (() => {
  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');

  let link = '';
  let step = 0;
  let data = {};
  let summary = null;

  const steps = [
    {
      t: 'Ihre Kontaktdaten',
      intro: 'Diese Angaben benötigt der Gutachter, um den Fall eindeutig zuordnen und Sie erreichen zu können.',
      f: [
        ['fullName', 'Vollständiger Name', 'text', 'Max Müller'],
        ['phone', 'Telefonnummer', 'tel', '+49 176 12345678'],
        ['email', 'E-Mail', 'email', 'max@example.de'],
        ['address', 'Adresse', 'text', 'Musterstraße 12, 10115 Berlin']
      ]
    },
    {
      t: 'Fahrzeug',
      intro: 'Falls Sie einzelne Daten nicht wissen, können Sie das Feld frei lassen.',
      f: [
        ['licensePlate', 'Kennzeichen', 'text', 'B AB 1234'],
        ['vehicle', 'Fahrzeug / Modell', 'text', 'BMW 320d'],
        ['vehicleOwner', 'Fahrzeughalter, falls abweichend', 'text', '']
      ]
    },
    {
      t: 'Schadenfall',
      intro: 'Eine kurze Beschreibung reicht. Details kann der Gutachter später ergänzen.',
      f: [
        ['damageDate', 'Schadentag', 'date', ''],
        ['damageLocation', 'Schadenort / Unfallort', 'text', 'Berlin'],
        ['damageType', 'Schadenart', 'select', ['Haftpflichtschaden', 'Kaskoschaden', 'Teilkasko / Hagel', 'Parkschaden', 'Unklar']],
        ['damageArea', 'Schadenbereich', 'select', ['vorne', 'hinten', 'links', 'rechts', 'vorne links', 'vorne rechts', 'hinten links', 'hinten rechts', 'rundum', 'unklar']],
        ['shortDescription', 'Kurze Beschreibung', 'textarea', 'Auffahrunfall, Schaden hinten am Stoßfänger.']
      ]
    },
    {
      t: 'Unfallgegner',
      intro: 'Zusatzfelder erscheinen erst, wenn ein Unfallgegner bekannt ist.',
      f: [
        ['opponentKnown', 'Ist ein Unfallgegner bekannt?', 'select', ['Ja', 'Nein', 'Unklar']],
        ['opponentName', 'Name Unfallgegner', 'text', ''],
        ['opponentPlate', 'Kennzeichen Unfallgegner', 'text', ''],
        ['opponentInsurance', 'Versicherung Unfallgegner', 'text', ''],
        ['insuranceClaimNo', 'Schadennummer / Aktenzeichen Versicherung', 'text', '']
      ]
    },
    {
      t: 'Anwalt und Werkstatt',
      intro: 'Nur wenn Anwalt oder Werkstatt vorhanden sind, werden weitere Felder angezeigt.',
      f: [
        ['lawyerKnown', 'Ist ein Rechtsanwalt beteiligt?', 'select', ['Ja', 'Nein', 'Noch nicht']],
        ['lawyerName', 'Kanzlei / Rechtsanwalt', 'text', ''],
        ['lawyerEmail', 'E-Mail Kanzlei', 'email', ''],
        ['repairShopKnown', 'Gibt es eine Werkstatt?', 'select', ['Ja', 'Nein', 'Noch offen']],
        ['repairShopName', 'Werkstatt / Autohaus', 'text', ''],
        ['repairShopEmail', 'E-Mail Werkstatt', 'email', '']
      ]
    },
    {
      t: 'Wer soll das Gutachten erhalten?',
      intro: 'Wählen Sie nur die Empfänger aus, die eine Kopie erhalten sollen.',
      c: [
        ['sendCustomer', 'Ich selbst / Kunde'],
        ['sendLawyer', 'Rechtsanwalt'],
        ['sendInsurance', 'Versicherung'],
        ['sendRepairShop', 'Werkstatt'],
        ['sendOther', 'Sonstige Person']
      ],
      f: [
        ['otherRecipient', 'Sonstiger Empfänger', 'text', 'z. B. Leasinggesellschaft, Flottenbetreuung, Arbeitgeber'],
        ['notes', 'Weitere Hinweise', 'textarea', '']
      ]
    },
    { t: 'Prüfen und absenden', review: true }
  ];

  function esc(v) {
    return String(v ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function attr(v) {
    return esc(v).replaceAll("'", '&#039;');
  }

  function toast(m) {
    toastEl.textContent = m;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  function param(n) {
    return new URL(location.href).searchParams.get(n) || '';
  }

  function home() {
    history.pushState({}, '', location.pathname);
    app.innerHTML = `
      <section class="hero">
        <div>
          <p class="eyebrow">Mobile Fallaufnahme für Kfz-Gutachter</p>
          <h1>Der Kunde füllt die Beteiligten ein. Der Gutachter erhält eine fertige Vorlage.</h1>
          <p class="lead">Senden Sie einen Aufnahme-Link per SMS oder E-Mail. Der Kunde ergänzt Anwalt, Versicherung, Werkstatt und Versandwünsche. Sie erhalten alles strukturiert zurück.</p>
          <div class="actions">
            <button class="primary" onclick="App.inspector()">Fall anlegen</button>
            <button class="secondary" onclick="App.customerDemo()">Kundenansicht testen</button>
          </div>
        </div>
        <div class="phone">
          <div class="phone-card">
            <div class="pill">Fall 2026-00123</div>
            <h3>Versandvorschlag</h3>
            <div class="row ok"><span>✓</span>Kunde</div>
            <div class="row ok"><span>✓</span>Rechtsanwalt</div>
            <div class="row ok"><span>✓</span>Versicherung</div>
            <div class="row warn"><span>!</span>Schadennummer fehlt</div>
          </div>
        </div>
      </section>
      <section class="grid">
        <article class="feature"><div class="num">1</div><h3>Gutachter sendet Link</h3><p>Telefonnummer oder E-Mail eingeben, Fallreferenz eintragen, Link versenden.</p></article>
        <article class="feature"><div class="num">2</div><h3>Kunde füllt aus</h3><p>Geführte Fragen. Zusatzfelder erscheinen nur, wenn sie relevant sind.</p></article>
        <article class="feature"><div class="num">3</div><h3>Strukturierte Rückgabe</h3><p>strukturierte Datei, offene Angaben und Versandvorschlag für den Gutachter.</p></article>
      </section>
      <section class="card"><h2>Warum diese Demo?</h2><p class="muted">Diese Version zeigt den Kernnutzen ohne Postfach-Zugriff, Telefonmitschnitt oder echte Schnittstelle. Der Kunde gibt Daten aktiv ein, der Gutachter bekommt eine sauber strukturierte Vorlage.</p></section>`;
  }

  function inspector() {
    history.pushState({}, '', location.pathname + '#inspector');
    app.innerHTML = `
      <section class="page-head">
        <button class="back" onclick="App.home()">← Zurück</button>
        <p class="eyebrow">Gutachter-App</p>
        <h1>Neuen Aufnahme-Link erstellen</h1>
        <p class="lead small">Für die Demo wird der Link lokal erzeugt. Versand erfolgt über SMS-/E-Mail-App des Handys.</p>
      </section>
      <section class="card">
        <div class="form-grid">
          <label>Interne Fallnummer / Schadennummer<input id="caseId" placeholder="z. B. 2026-00123"></label>
          <label>Kundenname optional<input id="clientName" placeholder="z. B. Max Müller"></label>
          <label>Telefonnummer für SMS<input id="clientPhone" placeholder="+4917612345678" inputmode="tel"></label>
          <label>E-Mail des Kunden<input id="clientEmail" placeholder="kunde@example.de"></label>
          <label>Gutachter-E-Mail für Rückgabe<input id="inspectorEmail" placeholder="gutachter@example.de"></label>
          <label>Büro / Gutachtername<input id="officeName" placeholder="SV-Büro Gutachter"></label>
        </div><br>
        <div class="actions">
          <button class="primary" onclick="App.generate()">Aufnahme-Link erzeugen</button>
          <button class="secondary" onclick="App.fillExample()">Beispiel füllen</button>
        </div>
      </section>
      <section class="card hidden" id="linkResult">
        <h2>Aufnahme-Link</h2>
        <p class="muted">Diesen Link kann der Kunde öffnen.</p>
        <div class="linkbox" id="generatedLink"></div>
        <div class="actions">
          <button class="secondary" onclick="App.copyLink()">Link kopieren</button>
          <a id="smsLink" class="btn secondary" href="#">Per SMS öffnen</a>
          <a id="emailLink" class="btn primary" href="#">Per E-Mail öffnen</a>
        </div>
      </section>
      <section class="card"><h2>Fallstatus</h2><div id="caseList"></div></section>`;
    renderCases();
  }

  function fillExample() {
    document.getElementById('caseId').value = '2026-00123';
    document.getElementById('clientName').value = 'Max Müller';
    document.getElementById('clientPhone').value = '+4917612345678';
    document.getElementById('clientEmail').value = 'kunde@example.de';
    document.getElementById('inspectorEmail').value = 'gutachter@example.de';
    document.getElementById('officeName').value = 'SV-Büro Gutachter';
  }

  function generate() {
    const c = document.getElementById('caseId').value.trim() || `FALL-${Date.now()}`;
    const n = document.getElementById('clientName').value.trim();
    const p = document.getElementById('clientPhone').value.trim();
    const e = document.getElementById('clientEmail').value.trim();
    const ins = document.getElementById('inspectorEmail').value.trim();
    const o = document.getElementById('officeName').value.trim();
    const u = new URLSearchParams({ mode: 'customer', case: c, inspector: ins, office: o });
    if (n) u.set('name', n);
    link = `${location.origin}${location.pathname}?${u.toString()}`;
    document.getElementById('generatedLink').textContent = link;
    const msg = `Bitte vervollständigen Sie Ihre Schadenfall-Daten für ${o || 'das Gutachten'}.\n\n${link}\n\nDauer: ca. 3–5 Minuten.`;
    document.getElementById('smsLink').href = `sms:${encodeURIComponent(p)}?&body=${encodeURIComponent(msg)}`;
    document.getElementById('emailLink').href = `mailto:${encodeURIComponent(e)}?subject=${encodeURIComponent('Schadenaufnahme ' + c)}&body=${encodeURIComponent(msg)}`;
    document.getElementById('linkResult').classList.remove('hidden');
    const cases = JSON.parse(localStorage.getItem('gl_cases') || '[]');
    cases.unshift({ caseId: c, clientName: n, createdAt: new Date().toISOString(), link });
    localStorage.setItem('gl_cases', JSON.stringify(cases.slice(0, 10)));
    renderCases();
  }

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast('Link kopiert');
  }

  function renderCases() {
    const el = document.getElementById('caseList');
    if (!el) return;
    const cases = JSON.parse(localStorage.getItem('gl_cases') || '[]');
    el.innerHTML = cases.length
      ? cases.map(c => `<div class="case-item"><div><b>${esc(c.caseId)}</b><br><span class="muted">${esc(c.clientName || 'ohne Name')} · ${new Date(c.createdAt).toLocaleString('de-DE')}</span></div><button class="secondary small" onclick="navigator.clipboard.writeText('${attr(c.link)}');App.toast('Link kopiert')">Kopieren</button></div>`).join('')
      : '<p class="muted">Noch keine Demo-Fälle erstellt.</p>';
  }

  function customerDemo() {
    const u = new URLSearchParams({ mode: 'customer', case: 'DEMO-2026-001', inspector: 'gutachter@example.de', office: 'SV-Büro Demo' });
    history.pushState({}, '', location.pathname + '?' + u.toString());
    startCustomer();
  }

  function startCustomer() {
    step = 0;
    data = { meta: { caseId: param('case') || 'DEMO', inspectorEmail: param('inspector'), officeName: param('office'), prefilledName: param('name') } };
    app.innerHTML = `
      <section class="page-head">
        <p class="eyebrow">Digitale Schadenaufnahme</p>
        <h1>Angaben zum Schadenfall ergänzen</h1>
        <p class="lead small">Bitte füllen Sie die Angaben so gut wie möglich aus. Unbekannte Felder können frei bleiben.</p>
      </section>
      <section class="card">
        <div class="progress-top"><b id="progressLabel"></b><span id="caseBadge" class="pill"></span></div>
        <div class="progress"><div id="progressFill"></div></div>
      </section>
      <form class="card" onsubmit="App.submitCustomer(event)">
        <div id="stepContainer"></div>
        <div class="nav">
          <button type="button" class="secondary" id="prevBtn" onclick="App.prev()">Zurück</button>
          <button type="button" class="primary" id="nextBtn" onclick="App.next()">Weiter</button>
          <button type="submit" class="primary hidden" id="submitBtn">Angaben absenden</button>
        </div>
      </form>`;
    renderStep();
  }

  function conditionalVisibility(name) {
    const opponent = ['opponentName', 'opponentPlate', 'opponentInsurance', 'insuranceClaimNo'];
    if (opponent.includes(name) && data.opponentKnown !== 'Ja') return false;

    const lawyer = ['lawyerName', 'lawyerEmail'];
    if (lawyer.includes(name) && data.lawyerKnown !== 'Ja') return false;

    const repair = ['repairShopName', 'repairShopEmail'];
    if (repair.includes(name) && data.repairShopKnown !== 'Ja') return false;

    if (name === 'otherRecipient' && !data.sendOther) return false;

    return true;
  }

  function conditionalNote(stepConfig) {
    if (stepConfig.t === 'Unfallgegner' && data.opponentKnown && data.opponentKnown !== 'Ja') {
      return '<div class="smart-note">Keine weiteren Angaben zum Unfallgegner nötig. Der Gutachter sieht später, dass der Unfallgegner nicht bekannt oder unklar ist.</div>';
    }
    if (stepConfig.t === 'Anwalt und Werkstatt') {
      const parts = [];
      if (data.lawyerKnown && data.lawyerKnown !== 'Ja') parts.push('kein Anwalt');
      if (data.repairShopKnown && data.repairShopKnown !== 'Ja') parts.push('keine Werkstatt');
      if (parts.length) return `<div class="smart-note">Auswahl erkannt: ${esc(parts.join(' / '))}. Nicht benötigte Felder bleiben ausgeblendet.</div>`;
    }
    return '';
  }

  function fieldHtml(field) {
    const [name, label, type, ph] = field;
    const val = data[name] || (name === 'fullName' && data.meta.prefilledName ? data.meta.prefilledName : '');
    if (!conditionalVisibility(name)) return '';

    let html = `<div class="field-wrap" data-wrap="${attr(name)}">`;
    if (type === 'textarea') {
      html += `<label>${label}<textarea data-field="${name}" placeholder="${attr(ph || '')}">${esc(val)}</textarea></label>`;
    } else if (type === 'select') {
      html += `<label>${label}<select data-field="${name}" onchange="App.conditionalUpdate()"><option value="">Bitte auswählen</option>`;
      for (const op of ph) html += `<option value="${attr(op)}" ${val === op ? 'selected' : ''}>${esc(op)}</option>`;
      html += '</select></label>';
    } else {
      html += `<label>${label}<input data-field="${name}" type="${type}" value="${attr(val)}" placeholder="${attr(ph || '')}"></label>`;
    }

    if (name === 'insuranceClaimNo') html += `<p class="field-hint">Falls noch nicht bekannt, einfach frei lassen. Die App markiert es später als offene Angabe.</p>`;
    html += '</div>';
    return html;
  }

  function renderStep() {
    const s = steps[step];
    document.getElementById('progressLabel').textContent = `Schritt ${step + 1} von ${steps.length}`;
    document.getElementById('caseBadge').textContent = data.meta.caseId;
    document.getElementById('progressFill').style.width = `${((step + 1) / steps.length) * 100}%`;

    let h = `<h2>${s.t}</h2>`;
    if (s.intro) h += `<p class="muted step-intro">${esc(s.intro)}</p>`;

    if (s.review) {
      collect();
      const sm = build();
      h += `<p class="muted">Bitte prüfen Sie die Angaben. Sie können zurückgehen oder jetzt absenden.</p><pre>${esc(textSummary(sm))}</pre>`;
    } else {
      if (s.c) {
        h += '<div class="options">';
        for (const [name, label] of s.c) {
          h += `<label class="option"><input type="checkbox" data-field="${name}" ${data[name] ? 'checked' : ''} onchange="App.conditionalUpdate()">${label}</label>`;
        }
        h += '</div><br>';
      }
      for (const f of s.f || []) h += fieldHtml(f);
      h += conditionalNote(s);
    }

    document.getElementById('stepContainer').innerHTML = h;
    document.getElementById('prevBtn').style.visibility = step === 0 ? 'hidden' : 'visible';
    document.getElementById('nextBtn').classList.toggle('hidden', step === steps.length - 1);
    document.getElementById('submitBtn').classList.toggle('hidden', step !== steps.length - 1);
  }

  function collect() {
    document.querySelectorAll('[data-field]').forEach(el => {
      const n = el.getAttribute('data-field');
      data[n] = el.type === 'checkbox' ? el.checked : el.value.trim();
    });
  }

  function conditionalUpdate() {
    collect();
    renderStep();
  }

  function next() {
    collect();
    if (step < steps.length - 1) {
      step++;
      renderStep();
    }
  }

  function prev() {
    collect();
    if (step > 0) {
      step--;
      renderStep();
    }
  }

  async function submitCustomer(e) {
    e.preventDefault();
    collect();
    summary = build();

    // In der statischen GitHub-Pages-Demo kann kein Server automatisch senden.
    // Auf modernen Handys wird deshalb die native Teilen-Funktion mit JSON-Datei genutzt.
    const shared = await tryShareJsonFile();
    renderCustomerDone(shared ? 'shared' : 'manual');
  }

  function build() {
    const d = data;
    const m = [];
    const miss = (cond, label) => { if (cond) m.push(label); };

    const opponentActive = d.opponentKnown === 'Ja';
    const lawyerActive = d.lawyerKnown === 'Ja';
    const repairActive = d.repairShopKnown === 'Ja';

    miss(!d.fullName, 'Kundenname');
    miss(!d.phone && !d.email, 'Telefonnummer oder E-Mail Kunde');
    miss(!d.licensePlate, 'Kennzeichen Kundenfahrzeug');
    miss(opponentActive && !d.opponentInsurance, 'Versicherung Unfallgegner');
    miss(lawyerActive && !d.lawyerEmail, 'E-Mail Rechtsanwalt');
    miss(d.sendInsurance && (!opponentActive || !d.opponentInsurance), 'Versand an Versicherung gewünscht, aber Versicherung fehlt');
    miss(d.sendLawyer && (!lawyerActive || !d.lawyerName), 'Versand an Anwalt gewünscht, aber Kanzlei fehlt');
    miss(d.sendRepairShop && (!repairActive || !d.repairShopName), 'Versand an Werkstatt gewünscht, aber Werkstatt fehlt');

    return {
      meta: d.meta,
      customer: { name: d.fullName || '', phone: d.phone || '', email: d.email || '', address: d.address || '' },
      vehicle: { license_plate: d.licensePlate || '', vehicle: d.vehicle || '', owner: d.vehicleOwner || '' },
      damage: { date: d.damageDate || '', location: d.damageLocation || '', type: d.damageType || '', area: d.damageArea || '', short_description: d.shortDescription || '' },
      opponent: {
        known: d.opponentKnown || '',
        name: opponentActive ? (d.opponentName || '') : '',
        license_plate: opponentActive ? (d.opponentPlate || '') : '',
        insurance: opponentActive ? (d.opponentInsurance || '') : '',
        insurance_claim_no: opponentActive ? (d.insuranceClaimNo || '') : ''
      },
      lawyer: { known: d.lawyerKnown || '', name: lawyerActive ? (d.lawyerName || '') : '', email: lawyerActive ? (d.lawyerEmail || '') : '' },
      repair_shop: { known: d.repairShopKnown || '', name: repairActive ? (d.repairShopName || '') : '', email: repairActive ? (d.repairShopEmail || '') : '' },
      shipping_jobs: {
        send_to_customer: !!d.sendCustomer,
        send_to_lawyer: !!d.sendLawyer,
        send_to_insurance: !!d.sendInsurance,
        send_to_repair_shop: !!d.sendRepairShop,
        send_to_other: !!d.sendOther,
        other_recipient: d.sendOther ? (d.otherRecipient || '') : ''
      },
      notes: d.notes || '',
      missing_fields: m
    };
  }

  function ships(s) {
    const a = [];
    if (s.shipping_jobs.send_to_customer) a.push('Kunde');
    if (s.shipping_jobs.send_to_lawyer) a.push('Rechtsanwalt');
    if (s.shipping_jobs.send_to_insurance) a.push('Versicherung');
    if (s.shipping_jobs.send_to_repair_shop) a.push('Werkstatt');
    if (s.shipping_jobs.send_to_other) a.push(s.shipping_jobs.other_recipient || 'Sonstige');
    return a;
  }

  function jsonFile() {
    const json = JSON.stringify(summary, null, 2);
    const safeCase = String(summary.meta.caseId || 'fall').replace(/[^a-z0-9_-]/gi, '-');
    return new File([json], `fallaufnahme-${safeCase}.json`, { type: 'application/json' });
  }

  async function tryShareJsonFile() {
    try {
      if (!summary || !navigator.share || typeof File === 'undefined') return false;
      const file = jsonFile();
      if (navigator.canShare && !navigator.canShare({ files: [file] })) return false;
      await navigator.share({
        title: `Fallaufnahme ${summary.meta.caseId}`,
        text: `Strukturierte Fallaufnahme ${summary.meta.caseId} für den Gutachter.`,
        files: [file]
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  function renderCustomerDone(mode) {
    const s = summary;
    const isShared = mode === 'shared';
    app.innerHTML = `
      <section class="page-head done-head">
        <p class="eyebrow">Angaben abgeschlossen</p>
        <h1>Vielen Dank. Ihre Angaben wurden vorbereitet.</h1>
        <p class="lead small">
          ${isShared
            ? 'Das Datenpaket wurde über die Teilen-Funktion Ihres Geräts übergeben.'
            : 'Diese Demo läuft ohne Server. Deshalb kann GitHub Pages die Datei nicht automatisch im Hintergrund an den Gutachter senden.'}
        </p>
      </section>
      <section class="grid two">
        <div class="card success-card">
          <div class="big-check">✓</div>
          <h2>Fertig für den Gutachter</h2>
          <p class="muted">Fallnummer: <b>${esc(s.meta.caseId)}</b></p>
          <p class="muted">Die Daten wurden als strukturierte Datei vorbereitet. Der Kunde sieht keine JSON- oder Textvorschau.</p>
        </div>
        <div class="card">
          <h2>Hinweis zur Demo</h2>
          <p class="muted">
            In der echten Version wird nach dem Klick auf „Absenden“ automatisch eine Datei an den Gutachter übermittelt
            und zusätzlich in der Gutachter-App gespeichert. Diese GitHub-Pages-Demo hat noch kein Backend.
          </p>
        </div>
      </section>
      <section class="card ${isShared ? 'hidden' : ''}">
        <h2>Datenpaket manuell übermitteln</h2>
        <p class="muted">
          Für die Demo können Sie das strukturierte Datenpaket als Datei herunterladen oder über die Teilen-Funktion Ihres Geräts versenden.
        </p>
        <div class="actions">
          <button class="primary" onclick="App.shareJsonFile()">Datenpaket senden</button>
          <button class="secondary" onclick="App.downloadJson()">Datenpaket herunterladen</button>
          <a class="btn secondary" href="mailto:${encodeURIComponent(s.meta.inspectorEmail || '')}?subject=${encodeURIComponent('Fallaufnahme ' + s.meta.caseId)}&body=${encodeURIComponent('Die strukturierte Fallaufnahme wurde vorbereitet. Bitte hängen Sie die heruntergeladene JSON-Datei an diese E-Mail an.')}" target="_blank">E-Mail öffnen</a>
        </div>
      </section>`;
  }

  async function shareJsonFile() {
    const ok = await tryShareJsonFile();
    if (ok) toast('Datenpaket übergeben');
    else toast('Teilen-Funktion nicht verfügbar');
  }

  function yn(v) { return v ? 'ja' : 'nein'; }

  function textSummary(s) {
    return [
      `FALLAUFNAHME / VERSANDVORSCHLAG`,
      `Fallnummer: ${s.meta.caseId}`,
      `Büro: ${s.meta.officeName || ''}`,
      '',
      `KUNDE / ANSPRUCHSTELLER`,
      `Name: ${s.customer.name}`,
      `Telefon: ${s.customer.phone}`,
      `E-Mail: ${s.customer.email}`,
      `Adresse: ${s.customer.address}`,
      '',
      `FAHRZEUG`,
      `Kennzeichen: ${s.vehicle.license_plate}`,
      `Fahrzeug: ${s.vehicle.vehicle}`,
      `Halter abweichend: ${s.vehicle.owner}`,
      '',
      `SCHADEN`,
      `Schadentag: ${s.damage.date}`,
      `Schadenort: ${s.damage.location}`,
      `Schadenart: ${s.damage.type}`,
      `Schadenbereich: ${s.damage.area}`,
      `Beschreibung: ${s.damage.short_description}`,
      '',
      `UNFALLGEGNER / VERSICHERUNG`,
      `Unfallgegner bekannt: ${s.opponent.known}`,
      `Name: ${s.opponent.name}`,
      `Kennzeichen: ${s.opponent.license_plate}`,
      `Versicherung: ${s.opponent.insurance}`,
      `Schadennummer / Aktenzeichen: ${s.opponent.insurance_claim_no}`,
      '',
      `RECHTSANWALT`,
      `Beteiligt: ${s.lawyer.known}`,
      `Kanzlei: ${s.lawyer.name}`,
      `E-Mail: ${s.lawyer.email}`,
      '',
      `WERKSTATT`,
      `Vorhanden: ${s.repair_shop.known}`,
      `Name: ${s.repair_shop.name}`,
      `E-Mail: ${s.repair_shop.email}`,
      '',
      `VERSAND`,
      `Gutachten an Kunde: ${yn(s.shipping_jobs.send_to_customer)}`,
      `Gutachten an Rechtsanwalt: ${yn(s.shipping_jobs.send_to_lawyer)}`,
      `Gutachten an Versicherung: ${yn(s.shipping_jobs.send_to_insurance)}`,
      `Gutachten an Werkstatt: ${yn(s.shipping_jobs.send_to_repair_shop)}`,
      `Sonstige: ${s.shipping_jobs.other_recipient}`,
      '',
      `WEITERE HINWEISE`,
      `${s.notes}`,
      '',
      `OFFENE ANGABEN`,
      s.missing_fields.length ? s.missing_fields.map(x => `- ${x}`).join('\n') : 'Keine offensichtlichen offenen Angaben.'
    ].join('\n');
  }

  async function copySummary() {
    await navigator.clipboard.writeText(textSummary(summary));
    toast('Zusammenfassung kopiert');
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fallaufnahme-${summary.meta.caseId || 'fall'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function demoInfo() {
    alert('Demo-Hinweis:\n\nDiese GitHub-Pages-Version ist statisch. Sie kann Links erzeugen und SMS/E-Mail-Apps öffnen, aber keine Daten automatisch auf einem Server speichern oder im Hintergrund als E-Mail-Anhang senden.\n\nFür einen echten Pilotbetrieb wäre ein Backend nötig, z. B. Supabase, Firebase, Vercel/Netlify Functions oder ein eigener EU-Server.');
  }

  function init() {
    if (param('mode') === 'customer') startCustomer();
    else if (location.hash === '#inspector') inspector();
    else home();
  }

  window.addEventListener('popstate', init);
  return { init, home, inspector, demoInfo, fillExample, generate, copyLink, customerDemo, next, prev, submitCustomer, copySummary, downloadJson, shareJsonFile, toast, conditionalUpdate };
})();

App.init();
