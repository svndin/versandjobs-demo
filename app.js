const App = (() => {
  const app = document.getElementById("app");
  const toast = document.getElementById("toast");

  let generatedLink = "";
  let currentStep = 0;
  let customerData = {};
  let latestSummary = null;

  const steps = [
    {
      title: "Ihre Kontaktdaten",
      fields: [
        ["fullName", "Vollständiger Name", "text", "Max Müller"],
        ["phone", "Telefonnummer", "tel", "+49 176 12345678"],
        ["email", "E-Mail", "email", "max@example.de"],
        ["address", "Adresse", "text", "Musterstraße 12, 10115 Berlin"]
      ]
    },
    {
      title: "Fahrzeug",
      fields: [
        ["licensePlate", "Kennzeichen", "text", "B AB 1234"],
        ["vehicle", "Fahrzeug / Modell", "text", "BMW 320d"],
        ["vehicleOwner", "Fahrzeughalter, falls abweichend", "text", ""]
      ]
    },
    {
      title: "Schadenfall",
      fields: [
        ["damageDate", "Schadentag", "date", ""],
        ["damageLocation", "Schadenort / Unfallort", "text", "Berlin"],
        ["damageType", "Schadenart", "select", ["Haftpflichtschaden", "Kaskoschaden", "Teilkasko / Hagel", "Parkschaden", "Unklar"]],
        ["damageArea", "Schadenbereich", "select", ["vorne", "hinten", "links", "rechts", "vorne links", "vorne rechts", "hinten links", "hinten rechts", "rundum", "unklar"]],
        ["shortDescription", "Kurze Beschreibung", "textarea", "Auffahrunfall, Schaden hinten am Stoßfänger."]
      ]
    },
    {
      title: "Unfallgegner",
      fields: [
        ["opponentKnown", "Ist ein Unfallgegner bekannt?", "select", ["Ja", "Nein", "Unklar"]],
        ["opponentName", "Name Unfallgegner", "text", ""],
        ["opponentPlate", "Kennzeichen Unfallgegner", "text", ""],
        ["opponentInsurance", "Versicherung Unfallgegner", "text", ""],
        ["insuranceClaimNo", "Schadennummer / Aktenzeichen Versicherung", "text", ""]
      ]
    },
    {
      title: "Anwalt und Werkstatt",
      fields: [
        ["lawyerKnown", "Ist ein Rechtsanwalt beteiligt?", "select", ["Ja", "Nein", "Noch nicht"]],
        ["lawyerName", "Kanzlei / Rechtsanwalt", "text", ""],
        ["lawyerEmail", "E-Mail Kanzlei", "email", ""],
        ["repairShopKnown", "Gibt es eine Werkstatt?", "select", ["Ja", "Nein", "Noch offen"]],
        ["repairShopName", "Werkstatt / Autohaus", "text", ""],
        ["repairShopEmail", "E-Mail Werkstatt", "email", ""]
      ]
    },
    {
      title: "Wer soll das Gutachten erhalten?",
      checkboxes: [
        ["sendCustomer", "Ich selbst / Kunde"],
        ["sendLawyer", "Rechtsanwalt"],
        ["sendInsurance", "Versicherung"],
        ["sendRepairShop", "Werkstatt"],
        ["sendOther", "Sonstige Person"]
      ],
      fields: [
        ["otherRecipient", "Sonstiger Empfänger", "text", ""],
        ["notes", "Weitere Hinweise", "textarea", ""]
      ]
    },
    {
      title: "Prüfen und absenden",
      review: true
    }
  ];

  function qs(name) {
    return new URL(window.location.href).searchParams.get(name) || "";
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function attr(value) {
    return esc(value).replaceAll("'", "&#039;");
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function goHome() {
    history.pushState({}, "", location.pathname);

    app.innerHTML = `
      <section class="hero">
        <div>
          <p class="eyebrow">Mobile Fallaufnahme für Kfz-Gutachter</p>
          <h1>Der Kunde füllt die Beteiligten ein. Der Gutachter erhält eine fertige Vorlage.</h1>
          <p class="lead">
            Senden Sie einen Aufnahme-Link per SMS oder E-Mail. Der Kunde ergänzt Anwalt,
            Versicherung, Werkstatt und Versandwünsche. Sie erhalten alles strukturiert zurück.
          </p>
          <div class="actions">
            <button class="primary" onclick="App.showInspector()">Fall anlegen</button>
            <button class="secondary" onclick="App.openCustomerDemo()">Kundenansicht testen</button>
          </div>
        </div>

        <div class="phone">
          <div class="phone-card">
            <div class="pill">Beispielausgabe</div>
            <h3>Versandjobs vorbereitet</h3>
            <div class="row ok"><span>✓</span> Gutachten an Kunde</div>
            <div class="row ok"><span>✓</span> Gutachten an Anwalt</div>
            <div class="row ok"><span>✓</span> Gutachten an Versicherung</div>
            <div class="row warn"><span>!</span> Schadennummer noch offen</div>
          </div>
        </div>
      </section>

      <section class="grid">
        <article class="feature">
          <div class="num">1</div>
          <h3>Gutachter sendet Link</h3>
          <p>Telefonnummer oder E-Mail eingeben, Fallreferenz eintragen, Link senden.</p>
        </article>

        <article class="feature">
          <div class="num">2</div>
          <h3>Kunde füllt aus</h3>
          <p>Geführte Fragen zu Kunde, Fahrzeug, Unfallgegner, Versicherung, Anwalt und Werkstatt.</p>
        </article>

        <article class="feature">
          <div class="num">3</div>
          <h3>Strukturierte Rückgabe</h3>
          <p>Versandvorschlag, offene Angaben und JSON-Datei für spätere Schnittstellen.</p>
        </article>
      </section>

      <section class="card">
        <h2>Demo-Ziel</h2>
        <p class="muted">
          Diese GitHub-Pages-Version ist zur optischen und funktionalen Validierung gedacht.
          Sie speichert keine Daten auf einem Server.
        </p>
      </section>
    `;
  }

  function showInspector() {
    history.pushState({}, "", location.pathname + "#inspector");

    app.innerHTML = `
      <section class="page-head">
        <button class="back" onclick="App.goHome()">← Zurück</button>
        <p class="eyebrow">Gutachter-App</p>
        <h1>Neuen Aufnahme-Link erstellen</h1>
        <p class="lead small">
          Für die Demo wird der Link lokal erzeugt. Versand erfolgt über SMS-/E-Mail-App des Handys.
        </p>
      </section>

      <section class="card">
        <div class="form-grid">
          <label>Interne Fallnummer / Schadennummer<input id="caseId" placeholder="z. B. 2026-00123"></label>
          <label>Kundenname optional<input id="clientName" placeholder="z. B. Max Müller"></label>
          <label>Telefonnummer für SMS<input id="clientPhone" placeholder="z. B. +4917612345678" inputmode="tel"></label>
          <label>E-Mail des Kunden<input id="clientEmail" placeholder="kunde@example.de" inputmode="email"></label>
          <label>Gutachter-E-Mail für Rückgabe<input id="inspectorEmail" placeholder="gutachter@example.de" inputmode="email"></label>
          <label>Büro / Gutachtername<input id="officeName" placeholder="z. B. SV-Büro Gutachter"></label>
        </div>

        <div class="actions" style="margin-top:18px">
          <button class="primary" onclick="App.generateIntakeLink()">Aufnahme-Link erzeugen</button>
          <button class="secondary" onclick="App.fillExample()">Beispiel füllen</button>
        </div>
      </section>

      <section id="linkResult" class="card hidden" style="margin-top:18px">
        <h2>Aufnahme-Link</h2>
        <p class="muted">Diesen Link kann der Kunde öffnen.</p>
        <div id="generatedLink" class="linkbox"></div>

        <div class="actions" style="margin-top:14px">
          <button class="secondary" onclick="App.copyGeneratedLink()">Link kopieren</button>
          <a id="smsLink" class="btn secondary" href="#">Per SMS öffnen</a>
          <a id="emailLink" class="btn primary" href="#">Per E-Mail öffnen</a>
        </div>
      </section>

      <section class="card" style="margin-top:18px">
        <h2>Demo-Fälle</h2>
        <div id="caseList"></div>
      </section>
    `;

    renderCaseList();
  }

  function showDemoInfo() {
    alert(
      "Demo-Hinweis:\n\n" +
      "Diese GitHub-Pages-Version ist statisch. Sie kann Links erzeugen und SMS/E-Mail-Apps öffnen, " +
      "aber keine Daten automatisch auf einem Server speichern.\n\n" +
      "Für einen echten Pilotbetrieb braucht die App später ein Backend."
    );
  }

  function fillExample() {
    document.getElementById("caseId").value = "2026-00123";
    document.getElementById("clientName").value = "Max Müller";
    document.getElementById("clientPhone").value = "+4917612345678";
    document.getElementById("clientEmail").value = "kunde@example.de";
    document.getElementById("inspectorEmail").value = "gutachter@example.de";
    document.getElementById("officeName").value = "SV-Büro Gutachter";
  }

  function generateIntakeLink() {
    const caseId = document.getElementById("caseId").value.trim() || `FALL-${Date.now()}`;
    const clientName = document.getElementById("clientName").value.trim();
    const clientPhone = document.getElementById("clientPhone").value.trim();
    const clientEmail = document.getElementById("clientEmail").value.trim();
    const inspectorEmail = document.getElementById("inspectorEmail").value.trim();
    const officeName = document.getElementById("officeName").value.trim();

    const params = new URLSearchParams({
      mode: "customer",
      case: caseId,
      inspector: inspectorEmail,
      office: officeName
    });

    if (clientName) {
      params.set("name", clientName);
    }

    generatedLink = `${location.origin}${location.pathname}?${params.toString()}`;

    const msg =
      `Bitte vervollständigen Sie Ihre Schadenfall-Daten für ${officeName || "den Gutachter"}.\n\n` +
      `${generatedLink}\n\n` +
      `Dauer: ca. 3–5 Minuten.`;

    const subject = `Schadenaufnahme ${caseId}`;

    document.getElementById("generatedLink").textContent = generatedLink;

    document.getElementById("smsLink").href =
      `sms:${encodeURIComponent(clientPhone)}?&body=${encodeURIComponent(msg)}`;

    document.getElementById("emailLink").href =
      `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;

    document.getElementById("linkResult").classList.remove("hidden");

    const cases = JSON.parse(localStorage.getItem("gl_cases") || "[]");

    cases.unshift({
      caseId,
      clientName,
      createdAt: new Date().toISOString(),
      link: generatedLink
    });

    localStorage.setItem("gl_cases", JSON.stringify(cases.slice(0, 10)));

    renderCaseList();
  }

  async function copyGeneratedLink() {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    showToast("Link kopiert");
  }

  function renderCaseList() {
    const el = document.getElementById("caseList");
    if (!el) return;

    const cases = JSON.parse(localStorage.getItem("gl_cases") || "[]");

    if (!cases.length) {
      el.innerHTML = '<p class="muted">Noch keine Demo-Fälle erstellt.</p>';
      return;
    }

    el.innerHTML = cases.map(c => `
      <div class="case-item">
        <div>
          <b>${esc(c.caseId)}</b><br>
          <span class="muted">${esc(c.clientName || "ohne Name")} · ${new Date(c.createdAt).toLocaleString("de-DE")}</span>
        </div>
        <button class="secondary small" onclick="navigator.clipboard.writeText('${attr(c.link)}'); App.toast('Link kopiert')">
          Kopieren
        </button>
      </div>
    `).join("");
  }

  function openCustomerDemo() {
    const params = new URLSearchParams({
      mode: "customer",
      case: "DEMO-2026-001",
      inspector: "gutachter@example.de",
      office: "SV-Büro Gutachter"
    });

    history.pushState({}, "", `${location.pathname}?${params.toString()}`);
    startCustomer();
  }

  function startCustomer() {
    currentStep = 0;

    customerData = {
      meta: {
        caseId: qs("case") || "DEMO",
        inspectorEmail: qs("inspector"),
        officeName: qs("office") || "SV-Büro Gutachter",
        prefilledName: qs("name")
      }
    };

    renderCustomerShell();
    renderStep();
  }

  function renderCustomerShell() {
    app.innerHTML = `
      <section class="page-head">
        <p class="eyebrow">Digitale Schadenaufnahme</p>
        <h1>Angaben zum Schadenfall ergänzen</h1>
        <p class="lead small">
          Bitte füllen Sie die Angaben so gut wie möglich aus. Unbekannte Felder können frei bleiben.
        </p>
      </section>

      <section class="card">
        <div class="progress-top">
          <b id="progressLabel"></b>
          <span id="caseBadge" class="pill"></span>
        </div>
        <div class="progress"><div id="progressFill"></div></div>
      </section>

      <form id="customerForm" class="card" style="margin-top:18px" onsubmit="App.handleCustomerSubmit(event)">
        <div id="stepContainer"></div>

        <div class="nav">
          <button type="button" class="secondary" id="prevBtn" onclick="App.prevStep()">Zurück</button>
          <button type="button" class="primary" id="nextBtn" onclick="App.nextStep()">Weiter</button>
          <button type="submit" class="primary hidden" id="submitBtn">Angaben absenden</button>
        </div>
      </form>
    `;
  }

  function renderStep() {
    const step = steps[currentStep];

    document.getElementById("progressLabel").textContent =
      `Schritt ${currentStep + 1} von ${steps.length}`;

    document.getElementById("caseBadge").textContent =
      customerData.meta.caseId;

    document.getElementById("progressFill").style.width =
      `${((currentStep + 1) / steps.length) * 100}%`;

    let html = `<h2>${esc(step.title)}</h2>`;

    if (step.review) {
      collectVisibleInputs();
      const summary = buildSummaryObject();
      html += renderReview(summary);
    } else {
      if (step.checkboxes) {
        html += `<div class="options">`;

        for (const [name, label] of step.checkboxes) {
          html += `
            <label class="option">
              <input type="checkbox" data-field="${name}" ${customerData[name] ? "checked" : ""} onchange="App.handleConditionalChange()">
              ${esc(label)}
            </label>
          `;
        }

        html += `</div><br>`;
      }

      for (const [name, label, type, placeholder] of (step.fields || [])) {
        const hidden = getFieldVisibility(name).hidden ? " hidden" : "";
        const value =
          customerData[name] ||
          (name === "fullName" && customerData.meta.prefilledName
            ? customerData.meta.prefilledName
            : "");

        if (type === "select") {
          html += `
            <div class="field-wrap${hidden}" data-wrap="${name}">
              <label>
                ${esc(label)}
                <select data-field="${name}" onchange="App.handleConditionalChange()">
                  <option value="">Bitte auswählen</option>
          `;

          for (const option of placeholder) {
            html += `
              <option value="${attr(option)}" ${value === option ? "selected" : ""}>
                ${esc(option)}
              </option>
            `;
          }

          html += `
                </select>
              </label>
            </div>
          `;
        } else if (type === "textarea") {
          html += `
            <div class="field-wrap${hidden}" data-wrap="${name}">
              <label>
                ${esc(label)}
                <textarea data-field="${name}" placeholder="${attr(placeholder || "")}" oninput="App.handleConditionalChange()">${esc(value)}</textarea>
              </label>
            </div>
          `;
        } else {
          html += `
            <div class="field-wrap${hidden}" data-wrap="${name}">
              <label>
                ${esc(label)}
                <input data-field="${name}" type="${type}" value="${attr(value)}" placeholder="${attr(placeholder || "")}" oninput="App.handleConditionalChange()">
              </label>
            </div>
          `;
        }
      }
    }

    document.getElementById("stepContainer").innerHTML = html;
    document.getElementById("prevBtn").style.visibility = currentStep === 0 ? "hidden" : "visible";
    document.getElementById("nextBtn").classList.toggle("hidden", currentStep === steps.length - 1);
    document.getElementById("submitBtn").classList.toggle("hidden", currentStep !== steps.length - 1);
  }

  function getFieldVisibility(name) {
    if (["opponentName", "opponentPlate", "opponentInsurance", "insuranceClaimNo"].includes(name)) {
      return { hidden: customerData.opponentKnown !== "Ja" };
    }

    if (["lawyerName", "lawyerEmail"].includes(name)) {
      return { hidden: customerData.lawyerKnown !== "Ja" };
    }

    if (["repairShopName", "repairShopEmail"].includes(name)) {
      return { hidden: customerData.repairShopKnown !== "Ja" };
    }

    if (name === "otherRecipient") {
      return { hidden: !customerData.sendOther };
    }

    return { hidden: false };
  }

  function applyConditionalVisibility() {
    document.querySelectorAll("[data-wrap]").forEach(wrap => {
      wrap.classList.toggle(
        "hidden",
        getFieldVisibility(wrap.dataset.wrap).hidden
      );
    });
  }

  function handleConditionalChange() {
    collectVisibleInputs();
    applyConditionalVisibility();
  }

  function collectVisibleInputs() {
    document.querySelectorAll("[data-field]").forEach(el => {
      const name = el.dataset.field;
      customerData[name] =
        el.type === "checkbox" ? el.checked : el.value.trim();
    });
  }

  function nextStep() {
    collectVisibleInputs();

    if (currentStep < steps.length - 1) {
      currentStep++;
      renderStep();
    }
  }

  function prevStep() {
    collectVisibleInputs();

    if (currentStep > 0) {
      currentStep--;
      renderStep();
    }
  }

  function renderReview(summary) {
    const recipients = [];

    if (summary.shipping_jobs.send_to_customer) recipients.push("Kunde");
    if (summary.shipping_jobs.send_to_lawyer) recipients.push("Rechtsanwalt");
    if (summary.shipping_jobs.send_to_insurance) recipients.push("Versicherung");
    if (summary.shipping_jobs.send_to_repair_shop) recipients.push("Werkstatt");
    if (summary.shipping_jobs.send_to_other) recipients.push(summary.shipping_jobs.other_recipient || "Sonstige Person");

    return `
      <p class="muted">
        Bitte prüfen Sie kurz, ob Ihre Angaben vollständig sind.
        Danach werden die Daten für den Gutachter vorbereitet.
      </p>

      <div class="review-card">
        <h3>Ihre Angaben</h3>
        <p><b>Name:</b> ${esc(summary.customer.name || "—")}</p>
        <p><b>Fahrzeug:</b> ${esc(summary.vehicle.vehicle || "—")} · ${esc(summary.vehicle.license_plate || "—")}</p>
        <p><b>Schaden:</b> ${esc(summary.damage.type || "—")} · ${esc(summary.damage.area || "—")}</p>

        <h3>Gewünschte Empfänger</h3>
        ${
          recipients.length
            ? `<div class="chips">${recipients.map(r => `<span class="chip">${esc(r)}</span>`).join("")}</div>`
            : `<p class="muted">Keine Empfänger ausgewählt.</p>`
        }

        ${
          summary.missing_fields.length
            ? `<h3>Noch offene Angaben</h3><div class="chips">${summary.missing_fields.map(m => `<span class="chip warn">${esc(m)}</span>`).join("")}</div>`
            : ""
        }
      </div>
    `;
  }

  function buildSummaryObject() {
    const d = customerData;
    const missing = [];

    const addMissing = (condition, label) => {
      if (condition) missing.push(label);
    };

    addMissing(!d.fullName, "Kundenname");
    addMissing(!d.phone && !d.email, "Telefonnummer oder E-Mail Kunde");
    addMissing(!d.licensePlate, "Kennzeichen Kundenfahrzeug");
    addMissing(d.opponentKnown === "Ja" && !d.opponentInsurance, "Versicherung Unfallgegner");
    addMissing(d.lawyerKnown === "Ja" && !d.lawyerEmail, "E-Mail Rechtsanwalt");
    addMissing(d.sendInsurance && !d.opponentInsurance, "Versand an Versicherung gewünscht, aber Versicherung fehlt");
    addMissing(d.sendLawyer && !d.lawyerName, "Versand an Anwalt gewünscht, aber Kanzlei fehlt");
    addMissing(d.sendRepairShop && !d.repairShopName, "Versand an Werkstatt gewünscht, aber Werkstatt fehlt");

    return {
      meta: d.meta,
      customer: {
        name: d.fullName || "",
        phone: d.phone || "",
        email: d.email || "",
        address: d.address || ""
      },
      vehicle: {
        license_plate: d.licensePlate || "",
        vehicle: d.vehicle || "",
        owner: d.vehicleOwner || ""
      },
      damage: {
        date: d.damageDate || "",
        location: d.damageLocation || "",
        type: d.damageType || "",
        area: d.damageArea || "",
        short_description: d.shortDescription || ""
      },
      opponent: {
        known: d.opponentKnown || "",
        name: d.opponentName || "",
        license_plate: d.opponentPlate || "",
        insurance: d.opponentInsurance || "",
        insurance_claim_no: d.insuranceClaimNo || ""
      },
      lawyer: {
        known: d.lawyerKnown || "",
        name: d.lawyerName || "",
        email: d.lawyerEmail || ""
      },
      repair_shop: {
        known: d.repairShopKnown || "",
        name: d.repairShopName || "",
        email: d.repairShopEmail || ""
      },
      shipping_jobs: {
        send_to_customer: !!d.sendCustomer,
        send_to_lawyer: !!d.sendLawyer,
        send_to_insurance: !!d.sendInsurance,
        send_to_repair_shop: !!d.sendRepairShop,
        send_to_other: !!d.sendOther,
        other_recipient: d.otherRecipient || ""
      },
      notes: d.notes || "",
      missing_fields: missing,
      created_at: new Date().toISOString()
    };
  }

  function buildTextSummary(s) {
    return [
      "FALLAUFNAHME / VERSANDVORSCHLAG",
      `Fallnummer: ${s.meta.caseId}`,
      `Büro: ${s.meta.officeName || ""}`,
      "",
      "KUNDE / ANSPRUCHSTELLER",
      `Name: ${s.customer.name}`,
      `Telefon: ${s.customer.phone}`,
      `E-Mail: ${s.customer.email}`,
      `Adresse: ${s.customer.address}`,
      "",
      "FAHRZEUG",
      `Kennzeichen: ${s.vehicle.license_plate}`,
      `Fahrzeug: ${s.vehicle.vehicle}`,
      `Halter abweichend: ${s.vehicle.owner}`,
      "",
      "VERSAND",
      `Gutachten an Kunde: ${s.shipping_jobs.send_to_customer ? "ja" : "nein"}`,
      `Gutachten an Rechtsanwalt: ${s.shipping_jobs.send_to_lawyer ? "ja" : "nein"}`,
      `Gutachten an Versicherung: ${s.shipping_jobs.send_to_insurance ? "ja" : "nein"}`,
      `Gutachten an Werkstatt: ${s.shipping_jobs.send_to_repair_shop ? "ja" : "nein"}`,
      "",
      "OFFENE ANGABEN",
      s.missing_fields.length
        ? s.missing_fields.map(x => `- ${x}`).join("\n")
        : "Keine offensichtlichen offenen Angaben."
    ].join("\n");
  }

  async function handleCustomerSubmit(event) {
    event.preventDefault();

    collectVisibleInputs();
    latestSummary = buildSummaryObject();

    renderThankYou(latestSummary);

    const file = createJsonFile();

    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({
          title: `Fallaufnahme ${latestSummary.meta.caseId}`,
          text: "Strukturiertes Datenpaket für den Gutachter.",
          files: [file]
        });
      } catch (e) {}
    }
  }

  function renderThankYou(summary) {
    const mail = summary.meta.inspectorEmail || "";
    const subject = `Fallaufnahme ${summary.meta.caseId}`;

    const body = [
      "Die Schadenaufnahme wurde ausgefüllt.",
      "",
      "In der echten Version wird das Datenpaket automatisch an den Gutachter übermittelt.",
      "",
      buildTextSummary(summary)
    ].join("\n");

    app.innerHTML = `
      <section class="success-page">
        <div class="success-mark">✓</div>
        <p class="eyebrow">Angaben vorbereitet</p>
        <h1>Vielen Dank.</h1>
        <p class="lead small">
          Ihre Angaben wurden vorbereitet. In der echten Version werden diese automatisch an den Gutachter übermittelt.
        </p>

        <section class="card">
          <h2>Demo-Hinweis</h2>
          <p class="muted">
            GitHub Pages hat kein Backend. Deshalb kann diese Demo die JSON-Datei nicht automatisch im Hintergrund versenden.
          </p>

          <div class="actions">
            <button class="primary" onclick="App.shareJsonFile()">Datenpaket teilen</button>
            <button class="secondary" onclick="App.downloadJson()">JSON-Datei herunterladen</button>
            <a
              class="btn secondary"
              href="mailto:${encodeURIComponent(mail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}"
            >
              E-Mail an Gutachter öffnen
            </a>
          </div>
        </section>
      </section>
    `;
  }

  function safeFileName(value) {
    return String(value).replace(/[^a-zA-Z0-9._-]/g, "-");
  }

  function createJsonFile() {
    const blob = new Blob(
      [JSON.stringify(latestSummary, null, 2)],
      { type: "application/json" }
    );

    return new File(
      [blob],
      `fallaufnahme-${safeFileName(latestSummary.meta.caseId || "fall")}.json`,
      { type: "application/json" }
    );
  }

  async function shareJsonFile() {
    if (!latestSummary) return;

    const file = createJsonFile();

    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({
          title: `Fallaufnahme ${latestSummary.meta.caseId}`,
          text: "Strukturiertes Datenpaket für den Gutachter.",
          files: [file]
        });
      } catch (e) {}
    } else {
      downloadJson();
      showToast("Teilen nicht unterstützt – Datei heruntergeladen");
    }
  }

  function downloadJson() {
    if (!latestSummary) return;

    const blob = new Blob(
      [JSON.stringify(latestSummary, null, 2)],
      { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fallaufnahme-${safeFileName(latestSummary.meta.caseId || "fall")}.json`;
    a.click();

    URL.revokeObjectURL(a.href);
  }

  function init() {
    const mode = qs("mode");

    if (mode === "customer") {
      startCustomer();
    } else if (location.hash === "#inspector") {
      showInspector();
    } else {
      goHome();
    }
  }

  window.addEventListener("popstate", init);

  return {
    init,
    goHome,
    showInspector,
    showDemoInfo,
    fillExample,
    generateIntakeLink,
    copyGeneratedLink,
    openCustomerDemo,
    nextStep,
    prevStep,
    handleConditionalChange,
    handleCustomerSubmit,
    shareJsonFile,
    downloadJson,
    toast: showToast
  };
})();

App.init();
