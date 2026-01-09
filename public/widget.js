(function () {
  const script = document.currentScript;
  const urlParams = new URL(script.src).searchParams;
  const publicKey = urlParams.get("key") || script.getAttribute("data-key");

  if (!publicKey) {
    console.error("Widget publicKey missing");
    return;
  }

  const scriptUrl = new URL(script.src);
  const BASE_URL = scriptUrl.origin;
  const API_URL = `${BASE_URL}/api/public/widgets/${publicKey}`;

  fetch(API_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Widget not found");
      return res.json();
    })
    .then((widget) => {
      renderWidget(widget);
      trackEvent("impression");
    })
    .catch((err) => {
      console.error("Widget error:", err.message);
    });

  /* -------------------------------------------------- */
  /*                 CORE RENDERER                      */
  /* -------------------------------------------------- */

  function renderWidget(widget) {
    switch (widget.type) {
      case "NOTIFICATION":
        renderToastNotifications(widget);
        break;

      case "ANNOUNCEMENT_BAR":
      case "BANNER":
        renderAnnouncementBar(widget);
        break;

      case "POPUP_MODAL":
        renderPopupModal(widget);
        break;

      case "SLIDE_IN":
        renderSlideIn(widget);
        break;

      case "FLOATING_BUTTON":
        renderFloatingButton(widget);
        break;

      default:
        console.warn("Unknown widget type:", widget.type);
    }
  }

  /* -------------------------------------------------- */
  /*                NOTIFICATION (TOAST)                */
  /* -------------------------------------------------- */

  function renderToastNotifications(widget) {
    const container = createContainer(widget.position);
    container.style.pointerEvents = "none";
    document.body.appendChild(container);

    const items = normalizeItems(widget);
    let currentIndex = 0;

    const toastDuration = 4000;
    const loopDelay = (widget.autoHideSeconds || 10) * 1000;

    function showNext() {
      if (currentIndex >= items.length) {
        setTimeout(() => {
          currentIndex = 0;
          showNext();
        }, loopDelay);
        return;
      }

      createToast(container, widget, items[currentIndex], currentIndex);
      currentIndex++;
      setTimeout(showNext, toastDuration);
    }

    showNext();
  }

  function createToast(container, widget, item, index) {
    const toast = document.createElement("div");
    toast.style.cssText = `
      background:${widget.style?.backgroundColor || "#3B82F6"};
      color:${widget.style?.textColor || "#FFFFFF"};
      padding:16px 20px;
      border-radius:8px;
      max-width:360px;
      margin-bottom:12px;
      box-shadow:0 10px 25px rgba(0,0,0,.15);
      opacity:0;
      transform:translateY(20px);
      transition:all .4s ease;
      pointer-events:auto;
    `;

    toast.innerHTML = `
      ${
        item.headline
          ? `<div style="font-weight:600">${item.headline}</div>`
          : ""
      }
      ${
        item.body
          ? `<div style="font-size:14px;margin-top:4px">${item.body}</div>`
          : ""
      }
      ${
        item.ctaText && item.ctaUrl
          ? `<a href="${item.ctaUrl}" target="_blank"
               style="display:inline-block;margin-top:10px;color:inherit;text-decoration:underline"
               id="cta-${index}">
               ${item.ctaText} →
             </a>`
          : ""
      }
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    const cta = toast.querySelector(`#cta-${index}`);
    if (cta) cta.addEventListener("click", () => trackEvent("cta_click"));

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-20px)";
      setTimeout(() => toast.remove(), 300);
    }, 3600);
  }

  /* -------------------------------------------------- */
  /*              ANNOUNCEMENT BAR / BANNER              */
  /* -------------------------------------------------- */

  function renderAnnouncementBar(widget) {
    const bar = document.createElement("div");
    bar.style.cssText = `
      position:fixed;
      left:0;
      right:0;
      ${widget.position === "BOTTOM" ? "bottom:0" : "top:0"};
      z-index:999999;
      background:${widget.style?.backgroundColor || "#3B82F6"};
      color:${widget.style?.textColor || "#FFFFFF"};
      padding:14px 20px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      font-family:system-ui;
    `;

    const items = normalizeItems(widget);
    let index = 0;

    function renderItem() {
      const item = items[index];
      bar.innerHTML = `
        <div>
          <strong>${item.headline || ""}</strong>
          <div style="font-size:14px">${item.body || ""}</div>
        </div>
        ${
          item.ctaText && item.ctaUrl
            ? `<a href="${item.ctaUrl}" target="_blank"
                 style="color:inherit;text-decoration:underline">
                 ${item.ctaText}
               </a>`
            : ""
        }
      `;
      index = (index + 1) % items.length;
    }

    renderItem();
    setInterval(renderItem, (widget.autoHideSeconds || 10) * 1000);
    document.body.appendChild(bar);
  }

  /* -------------------------------------------------- */
  /*                   POPUP MODAL                      */
  /* -------------------------------------------------- */

  function renderPopupModal(widget) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.5);
      z-index:999998;
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
      position:fixed;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      background:${widget.style?.backgroundColor || "#FFF"};
      color:${widget.style?.textColor || "#000"};
      padding:24px;
      border-radius:10px;
      max-width:380px;
      z-index:999999;
    `;

    const item = normalizeItems(widget)[0];
    modal.innerHTML = `
      <strong>${item.headline || ""}</strong>
      <div style="margin-top:8px">${item.body || ""}</div>
      ${
        item.ctaText && item.ctaUrl
          ? `<a href="${item.ctaUrl}" target="_blank">${item.ctaText}</a>`
          : ""
      }
    `;

    overlay.addEventListener("click", close);
    document.body.append(overlay, modal);

    if (widget.autoHideSeconds) {
      setTimeout(close, widget.autoHideSeconds * 1000);
    }

    function close() {
      overlay.remove();
      modal.remove();
      trackEvent("dismiss");
    }
  }

  /* -------------------------------------------------- */
  /*                   SLIDE IN                         */
  /* -------------------------------------------------- */

  function renderSlideIn(widget) {
    const panel = document.createElement("div");
    const side = widget.position === "LEFT_CENTER" ? "left" : "right";

    panel.style.cssText = `
      position:fixed;
      top:0;
      bottom:0;
      ${side}:0;
      width:320px;
      background:${widget.style?.backgroundColor || "#FFF"};
      color:${widget.style?.textColor || "#000"};
      padding:20px;
      z-index:999999;
      box-shadow:0 0 30px rgba(0,0,0,.3);
    `;

    const item = normalizeItems(widget)[0];
    panel.innerHTML = `
      <strong>${item.headline || ""}</strong>
      <div style="margin-top:8px">${item.body || ""}</div>
    `;

    document.body.appendChild(panel);

    if (widget.autoHideSeconds) {
      setTimeout(() => panel.remove(), widget.autoHideSeconds * 1000);
    }
  }

  /* -------------------------------------------------- */
  /*               FLOATING BUTTON                      */
  /* -------------------------------------------------- */

  function renderFloatingButton(widget) {
    const btn = document.createElement("div");
    btn.style.cssText = `
      position:fixed;
      bottom:20px;
      right:20px;
      width:56px;
      height:56px;
      border-radius:50%;
      background:${widget.style?.backgroundColor || "#3B82F6"};
      color:${widget.style?.textColor || "#FFF"};
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      z-index:999999;
    `;
    btn.innerText = "💬";

    btn.addEventListener("click", () => {
      trackEvent("expand");
      alert(normalizeItems(widget)[0]?.headline || "Hello!");
    });

    document.body.appendChild(btn);
  }

  /* -------------------------------------------------- */
  /*                 HELPERS                            */
  /* -------------------------------------------------- */

  function createContainer(position) {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.zIndex = "999999";

    const s = "20px";
    if (position === "TOP_LEFT") el.style.top = el.style.left = s;
    if (position === "TOP_RIGHT") el.style.top = el.style.right = s;
    if (position === "BOTTOM_LEFT") el.style.bottom = el.style.left = s;
    if (position === "BOTTOM_RIGHT") el.style.bottom = el.style.right = s;
    return el;
  }

  function normalizeItems(widget) {
    if (widget.content?.items?.length) return widget.content.items;
    return [
      {
        headline: widget.content?.headline || "",
        body: widget.content?.body || "",
        ctaText: widget.content?.ctaText || "",
        ctaUrl: widget.content?.ctaUrl || "",
      },
    ];
  }

  function trackEvent(type) {
    navigator.sendBeacon(
      `${BASE_URL}/api/public/analytics`,
      JSON.stringify({
        publicKey,
        eventType: type,
        url: location.href,
      })
    );
  }
})();
