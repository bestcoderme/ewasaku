/* Eswaku Enterprise Limited — site scripts */

// ---- Mobile nav toggle ---------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      var expanded = links.classList.contains("open");
      toggle.setAttribute("aria-expanded", expanded);
    });
  }

  // Mark active nav link
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var target = a.getAttribute("href");
    if (target === here) a.classList.add("active");
  });
});

/* ============================================================================
   REQUEST FORM SUBMISSION
   ----------------------------------------------------------------------------
   This posts the form as JSON to a Google Apps Script Web App, which appends
   a row to a Google Sheet. Replace SCRIPT_URL below with your own deployed
   Apps Script Web App URL — see apps-script/Code.gs and README.md.
   ============================================================================ */
var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzKZPaveLHNdUtm4xVbEJaVi-0RfQZmF4Znaw2TlhBkZKzzqLPAgoXZa1TTVG8gvSYBrw/exec";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("service-request-form");
  if (!form) return;

  var statusBox = document.getElementById("form-status");
  var submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (SCRIPT_URL.indexOf("https://script.google.com/macros/s/AKfycbzKZPaveLHNdUtm4xVbEJaVi-0RfQZmF4Znaw2TlhBkZKzzqLPAgoXZa1TTVG8gvSYBrw/exec") === 0) {
      showStatus(
        "err",
        "The site isn't connected to a Google Sheet yet. Follow README.md to deploy the Apps Script, then paste its URL into js/main.js."
      );
      return;
    }

    var data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      service: form.service.value,
      location: form.location.value.trim(),
      preferredDate: form.preferredDate.value,
      details: form.details.value.trim(),
      submittedAt: new Date().toISOString(),
    };

    if (!data.name || !data.phone || !data.service || !data.location) {
      showStatus("err", "Please fill in your name, phone, service, and location.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    showStatus("loading", "Sending your request…");

    fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    })
      .then(function (res) { return res.json(); })
      .then(function (res) {
        if (res && res.result === "success") {
          showStatus(
            "ok",
            "Request received! Reference: " + (res.row || "—") +
            ". We'll call you on " + data.phone + " shortly."
          );
          form.reset();
        } else {
          showStatus("err", "Something went wrong on our end. Please call +254 727 661 672 instead.");
        }
      })
      .catch(function () {
        showStatus("err", "Could not reach the server. Please check your connection or call +254 727 661 672.");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send request";
      });
  });

  function showStatus(kind, message) {
    statusBox.className = "form-status show " + kind;
    statusBox.textContent = message;
  }
});
