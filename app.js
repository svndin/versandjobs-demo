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

  function renderTemplate(id) {
    app.innerHTML = document.getElementById(id).innerHTML;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function qs(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || "";
  }

  function goHome() {
    history.pushState({}, "", location.pathname);
    renderTemplate("home-template");
  }

  function showInspector() {
    history.pushState({}, "", location.pathname + "#inspector");
    renderTemplate("inspector-template");
    renderCaseList();
  }

  function openCustomerDemo() {
    const caseId = "DEMO-2026-001";
    const email = "gutachter@example.de";
    const office = "SV-Büro Gutachter";
    const params = new URLSearchParams({ mode: "customer", case: caseId, inspector: email, office });
    history.pushState({}, "", `${location.pathname}?${params.toString()}`);
    startCustomer();
  }

  function showDemoInfo() {
    alert(
      "Demo-Hinweis:\n\nDiese GitHub-Pages-Version ist statisch. Sie kann Links erzeugen und SMS/E-Mail-Apps öffnen, aber keine Daten automatisch auf einem Server speichern.\n\nFür einen echten Pilotbetrieb wäre ein Backend nötig."
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
    if (clientName) params.set("name", clientName);

    generatedLink = `${location.origin}${location.pathname}?${params.toString()}`;

    const msg = `Bitte vervollständigen Sie Ihre Schadenfall-Daten für ${officeName || "den Gutachter"}.\n\n${generatedLink}\n\nDauer: ca. 3–5 Minuten.`;
    const subject = `Schadenaufnahme ${caseId}`;

    document.getElementById("generatedLink").textContent = generatedLink;

    document.getElementById("smsLink").href =
      `sms:${encodeURIComponent(clientPhone)}?&body=${encodeURIComponent(msg)}`;

    document.getElementById("emailLink").href =
      `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;

    document.getElementById("linkResult").classList.remove("hidden");

    const cases = JSON.parse(localStorage.getItem("gl_cases") || "[]");
    cases.unshift({ caseId, clientName, clientPhone, clientEmail, inspectorEmail, officeName, createdAt: new Date().toISOString(), link: generatedLink });
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
          <strong>${escapeHtml(c.caseId)}</strong><br/>
          <span class="muted">${escapeHtml(c.clientName || "ohne Name")} · ${new Date(c.createdAt).toLocaleString("de-DE")}</span>
        </div>
        <button class="secondary small" onclick="navigator.clipboard.writeText('${escapeAttr(c.link)}'); App.toast('Link kopiert')">Kopieren</button>
      </div>
    `).join("");
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
    renderTemplate("customer-template");
    renderStep();
  }

  function renderStep() {
    const step = steps[currentStep];
    document.getElementById("progressLabel").textContent = `Schritt ${currentStep + 1} von ${steps.length}`;
    document.getElementById("caseBadge").textContent = customerData.meta.caseId;
    document.getElementById("progressFill").style.width = `${((currentStep + 1) / steps.length) * 100}%`;

    const container = document.getElementById("stepContainer");
    let html = `<h2>${step.title}</h2>`;

    if (step.review) {
      collectVisibleInputs();
      const summary = buildSummaryObject();
      html += `
        <p class="muted">
          Bitte prüfen Sie kurz, ob Ihre Angaben vollständig sind. Nach dem Absenden werden die Daten
          für den Gutachter als strukturiertes Datenpaket vorbereitet.
        </p>
        ${renderCustomerReview(summary)}
      `;
    } else {
      if (step.checkboxes) {
        html += `<div class="option-grid">`;
        for (const [name, label] of step.checkboxes) {
          const checked = customerData[name] ? "checked" : "";
          html += `
            <label class="option-card">
              <input type="checkbox" data-field="${name}" ${checked} onchange="App.handleConditionalChange()" />
              ${label}
            </label>`;
        }
        html += `</div><br/>`;
      }

      for (const field of step.fields || []) {
        const [name, label, type, placeholder] = field;
        const hiddenClass = getFieldVisibility(name).hidden ? " hidden" : "";
        const value = customerData[name] || (name === "fullName" && customerData.meta.prefilledName ? customerData.meta.prefilledName : "");

        if (type === "textarea") {
          html += `<div class="field-wrap${hiddenClass}" data-wrap="${name}">
            <label>${label}
              <textarea data-field="${name}" placeholder="${escapeAttr(placeholder || "")}" oninput="App.handleConditionalChange()">${escapeHtml(value)}</textarea>
            </label>
          </div>`;
        } else if (type === "select") {
          html += `<div class="field-wrap${hiddenClass}" data-wrap="${name}">
            <label>${label}
              <select data-field="${name}" onchange="App.handleConditionalChange()">
                <option value="">Bitte auswählen</option>`;
          for (const option of placeholder) {
            const selected = value === option ? "selected" : "";
            html += `<option ${selected} value="${escapeAttr(option)}">${escapeHtml(option)}</option>`;
          }
          html += `</select></label></div>`;
        } else {
          html += `<div class="field-wrap${hiddenClass}" data-wrap="${name}">
            <label>${label}
              <input data-field="${name}" type="${type}" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder || "")}" oninput="App.handleConditionalChange()" />
            </label>
          </div>`;
        }
      }
    }

    container.innerHTML = html;

    document.getElementById("prevBtn").style.visibility = currentStep === 0 ? "hidden" : "visible";
    document.getElementById("nextBtn").classList.toggle("hidden", currentStep === steps.length - 1);
    document.getElementById("submitBtn").classList.toggle("hidden", currentStep !== steps.length - 1);

    applyConditionalVisibility();
  }

  function renderCustomerReview(summary) {
    const chips = [];
    if (summary.shipping_jobs.send_to_customer) chips.push("Kunde");
    if (summary.shipping_jobs.send_to_lawyer) chips.push("Rechtsanwalt");
    if (summary.shipping_jobs.send_to_insurance) chips.push("Versicherung");
    if (summary.shipping_jobs.send_to_repair_shop) chips.push("Werkstatt");
    if (summary.shipping_jobs.send_to_other) chips.push(summary.shipping_jobs.other_recipient || "Sonstige Person");

    return `
      <div class="review-card">
        <h3>Ihre Angaben</h3>
        <p><strong>Name:</strong> ${escapeHtml(summary.customer.name || "—")}</p>
        <p><strong>Fahrzeug:</strong> ${escapeHtml(summary.vehicle.vehicle || "—")} · ${escapeHtml(summary.vehicle.license_plate || "—")}</p>
        <p><strong>Schaden:</strong> ${escapeHtml(summary.damage.type || "—")} · ${escapeHtml(summary.damage.area || "—")}</p>
        <h3>Gewünschte Empfänger</h3>
        ${chips.length ? `<div class="chip-list">${chips.map(c => `<span class="chip">${escapeHtml(c)}</span>`).join("")}</div>` : `<p class="muted">Keine Empfänger ausgewählt.</p>`}
        ${summary.missing_fields.length ? `
          <h3>Noch offene Angaben</h3>
          <div class="chip-list">${summary.missing_fields.map(m => `<span class="chip warn">${escapeHtml(m)}</span>`).join("")}</div>
        ` : ""}
      </div>
    `;
  }

  function getFieldVisibility(name) {
    const d = customerData;

    if (["opponentName", "opponentPlate", "opponentInsurance", "insuranceClaimNo"].includes(name)) {
      return { hidden: d.opponentKnown !== "Ja" };
    }

    if (["lawyerName", "lawyerEmail"].includes(name)) {
      return { hidden: d.lawyerKnown !== "Ja" };
    }

    if (["repairShopName", "repairShopEmail"].includes(name)) {
      return { hidden: d.repairShopKnown !== "Ja" };
    }

    if (name === "otherRecipient") {
      return { hidden: !d.sendOther };
    }

    return { hidden: false };
  }

  function handleConditionalChange() {
    collectVisibleInputs();
    applyConditionalVisibility();
  }

  function applyConditionalVisibility() {
    const wraps = document.querySelectorAll("[data-wrap]");
    wraps.forEach(wrap => {
      const name = wrap.getAttribute("data-wrap");
      const shouldHide = getFieldVisibility(name).hidden;
      wrap.classList.toggle("hidden", shouldHide);
    });
  }

  function collectVisibleInputs() {
    const fields = document.querySelectorAll("[data-field]");
    fields.forEach(el => {
      const name = el.getAttribute("data-field");
      if (el.type === "checkbox") {
        customerData[name] = el.checked;
      } else {
        customerData[name] = el.value.trim();
      }
    });
  }

  function nextStep() {
    collectVisibleInputs();
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      renderStep();
    }
  }

  function prevStep() {
    collectVisibleInputs();
    if (currentStep > 0) {
      currentStep -= 1;
      renderStep();
    }
  }

  async function handleCustomerSubmit(event) {
    event.preventDefault();
    collectVisibleInputs();
    latestSummary = buildSummaryObject();

    const fileName = `fallaufnahme-${safeFileName(latestSummary.meta.caseId || "fall")}.json`;
    const jsonBlob = new Blob([JSON.stringify(latestSummary, null, 2)], { type: "application/json" });
    const jsonFile = new File([jsonBlob], fileName, { type: "application/json" });

    renderThankYou(latestSummary);

    // Try native file sharing on supported phones. This does not expose JSON as code to the customer.
    if (navigator.canShare && navigator.canShare({ files: [jsonFile] }) && navigator.share) {
      try {
        await navigator.share({
          title: `Fallaufnahme ${latestSummary.meta.caseId}`,
          text: "Strukturiertes Datenpaket für den Gutachter.",
          files: [jsonFile]
        });
        showToast("Datenpaket geteilt");
      } catch (e) {
        // User cancelled sharing. Keep thank-you page with fallback buttons.
      }
    }
  }

  function renderThankYou(summary) {
    app.innerHTML = `
      <section class="success-page">
        <div class="success-mark">✓</div>
        <p class="eyebrow">Angaben vorbereitet</p>
        <h1>Vielen Dank.</h1>
        <p class="lead small-lead">
          Ihre Angaben wurden als strukturiertes Datenpaket vorbereitet.
          In der echten Version werden diese automatisch an den Gutachter übermittelt.
        </p>

        <section class="card">
          <h2>Nächster Schritt in dieser Demo</h2>
          <p class="muted">
            Da GitHub Pages keine Server-Funktion hat, kann diese Demo die Datei nicht automatisch im Hintergrund versenden.
            Sie können das Datenpaket aber als Datei teilen oder herunterladen.
          </p>
          <div class="actions wrap">
            <button class="primary" onclick="App.shareJsonFile()">Datenpaket teilen</button>
            <button class="secondary" onclick="App.downloadJson()">JSON-Datei herunterladen</button>
            <a id="fallbackEmail" class="button secondary" href="#">E-Mail an Gutachter öffnen</a>
          </div>
        </section>
      </section>
    `;

    const mail = summary.meta.inspectorEmail || "";
    const subject = `Fallaufnahme ${summary.meta.caseId}`;
    const body = [
      "Die Schadenaufnahme wurde ausgefüllt.",
      "",
      "Hinweis: In der Demo wird das strukturierte Datenpaket als JSON-Datei vorbereitet.",
      "Für die echte Version wird die Datei automatisch an den Gutachter übermittelt.",
      "",
      buildTextSummary(summary)
    ].join("\n");

    const fallback = document.getElementById("fallbackEmail");
    if (fallback) {
      fallback.href = `mailto:${encodeURIComponent(mail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }

  function buildSummaryObject() {
    const d = customerData;
    const missing = [];
    const addMissing = (condition, label) => { if (condition) missing.push(label); };

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
      `FALLAUFNAHME / VERSANDVORSCHLAG`,
      `Fallnummer: ${s.meta.caseId}`,
      `Büro: ${s.meta.officeName || ""}`,
      ``,
      `KUNDE / ANSPRUCHSTELLER`,
      `Name: ${s.customer.name}`,
      `Telefon: ${s.customer.phone}`,
      `E-Mail: ${s.customer.email}`,
      `Adresse: ${s.customer.address}`,
      ``,
      `FAHRZEUG`,
      `Kennzeichen: ${s.vehicle.license_plate}`,
      `Fahrzeug: ${s.vehicle.vehicle}`,
      `Halter abweichend: ${s.vehicle.owner}`,
      ``,
      `SCHADEN`,
      `Schadentag: ${s.damage.date}`,
      `Schadenort: ${s.damage.location}`,
      `Schadenart: ${s.damage.type}`,
      `Schadenbereich: ${s.damage.area}`,
      `Beschreibung: ${s.damage.short_description}`,
      ``,
      `UNFALLGEGNER / VERSICHERUNG`,
      `Unfallgegner bekannt: ${s.opponent.known}`,
      `Name: ${s.opponent.name}`,
      `Kennzeichen: ${s.opponent.license_plate}`,
      `Versicherung: ${s.opponent.insurance}`,
      `Schadennummer / Aktenzeichen: ${s.opponent.insurance_claim_no}`,
      ``,
      `RECHTSANWALT`,
      `Beteiligt: ${s.lawyer.known}`,
      `Kanzlei: ${s.lawyer.name}`,
      `E-Mail: ${s.lawyer.email}`,
      ``,
      `WERKSTATT`,
      `Vorhanden: ${s.repair_shop.known}`,
      `Name: ${s.repair_shop.name}`,
      `E-Mail: ${s.repair_shop.email}`,
      ``,
      `VERSAND`,
      `Gutachten an Kunde: ${yesNo(s.shipping_jobs.send_to_customer)}`,
      `Gutachten an Rechtsanwalt: ${yesNo(s.shipping_jobs.send_to_lawyer)}`,
      `Gutachten an Versicherung: ${yesNo(s.shipping_jobs.send_to_insurance)}`,
      `Gutachten an Werkstatt: ${yesNo(s.shipping_jobs.send_to_repair_shop)}`,
      `Sonstige: ${s.shipping_jobs.other_recipient}`,
      ``,
      `WEITERE HINWEISE`,
      `${s.notes}`,
      ``,
      `OFFENE ANGABEN`,
      s.missing_fields.length ? s.missing_fields.map(x => `- ${x}`).join("\n") : "Keine offensichtlichen offenen Angaben."
    ].join("\n");
  }

  async function shareJsonFile() {
    if (!latestSummary) return;
    const fileName = `fallaufnahme-${safeFileName(latestSummary.meta.caseId || "fall")}.json`;
    const jsonBlob = new Blob([JSON.stringify(latestSummary, null, 2)], { type: "application/json" });
    const jsonFile = new File([jsonBlob], fileName, { type: "application/json" });

    if (navigator.canShare && navigator.canShare({ files: [jsonFile] }) && navigator.share) {
      try {
        await navigator.share({
          title: `Fallaufnahme ${latestSummary.meta.caseId}`,
          text: "Strukturiertes Datenpaket für den Gutachter.",
          files: [jsonFile]
        });
      } catch (e) {}
    } else {
      downloadJson();
      showToast("Teilen wird nicht unterstützt – Datei wurde heruntergeladen");
    }
  }

  function downloadJson() {
    if (!latestSummary) return;
    const blob = new Blob([JSON.stringify(latestSummary, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fallaufnahme-${safeFileName(latestSummary.meta.caseId || "fall")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function yesNo(value) {
    return value ? "ja" : "nein";
  }

  function safeFileName(value) {
    return String(value).replace(/[^a-zA-Z0-9._-]/g, "-");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("'", "&#039;");
  }

  function init() {
    const mode = qs("mode");
    if (mode === "customer") startCustomer();
    else if (location.hash === "#inspector") showInspector();
    else goHome();
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
    handleCustomerSubmit,
    handleConditionalChange,
    shareJsonFile,
    downloadJson,
    toast: showToast
  };
})();

App.init();
