import Imprezia from "@adimpress/imprezia-sdk";

const IMPREZIA_ENDPOINT = `${window.location.origin}/imprezia`;
const IMPREZIA_IMPRESSION_ENDPOINT =
  `${window.location.origin}/imprezia/v1/events/sdk-impression`;

const SESSION_KEY = "jibu_imprezia_session_id";

function createSessionId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return (
    "jibu-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = createSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

export function resetImpreziaSession() {
  const sessionId = createSessionId();
  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

Imprezia.init({
  apiKey: "proxy",
  endpoint: IMPREZIA_ENDPOINT,
  impressionEndpoint: IMPREZIA_IMPRESSION_ENDPOINT
});

async function monetize(request, response) {
  try {
    return await Imprezia.monetize({
      request,
      response,
      sessionId: getSessionId(),
      maxCards: 2
    });
  } catch (error) {
    console.warn("Imprezia monetization failed:", error);
    return null;
  }
}

function getCardEntries(result) {
  if (!result || !result.linkData) {
    return [];
  }

  let linkData = result.linkData;

  if (typeof linkData === "string") {
    try {
      linkData = JSON.parse(linkData);
    } catch {
      return [];
    }
  }

  return Object.entries(linkData)
    .filter(([key, value]) => {
      return (
        /^card-\d+$/.test(key) &&
        value &&
        typeof value === "object" &&
        value.hyperlink
      );
    })
    .sort(([a], [b]) => {
      const aNumber = Number(a.replace("card-", ""));
      const bNumber = Number(b.replace("card-", ""));
      return aNumber - bNumber;
    });
}

function createElement(tag, styles = {}) {
  const element = document.createElement(tag);

  Object.assign(element.style, styles);

  return element;
}

function renderSingleCard(cardData) {
  const metadata = cardData?.metadata || {};
  const cardMetadata = metadata?.cardMetadata || {};

  const hyperlink = cardData?.hyperlink;
  const trackingId = cardData?.trackingId;

  if (!hyperlink) {
    return null;
  }

  const card = createElement("a", {
    display: "flex",
    width: "100%",
    minHeight: "116px",
    marginTop: "10px",
    overflow: "hidden",
    textDecoration: "none",
    color: "#ffffff",
    background:
      "linear-gradient(135deg, rgba(20,24,34,0.98), rgba(12,15,23,0.98))",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "14px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
    transition:
      "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
    cursor: "pointer"
  });

  card.href = hyperlink;
  card.target = "_blank";
  card.rel = "noopener noreferrer sponsored";

  card.setAttribute(
    "aria-label",
    cardMetadata.title ||
      cardData.string_link_word ||
      "Sponsored recommendation"
  );

  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-1px)";
    card.style.borderColor = "rgba(139,92,246,0.48)";
    card.style.boxShadow = "0 10px 30px rgba(0,0,0,0.30)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0)";
    card.style.borderColor = "rgba(255,255,255,0.10)";
    card.style.boxShadow = "0 8px 24px rgba(0,0,0,0.22)";
  });

  card.addEventListener("click", () => {
    console.log("Imprezia card click:", trackingId || "no-tracking-id");
  });

  const imageUrl = cardMetadata.adAssetUrl;

  if (imageUrl) {
    const imageWrap = createElement("div", {
      width: "132px",
      minWidth: "132px",
      height: "116px",
      overflow: "hidden",
      background: "#111827",
      position: "relative"
    });

    const image = document.createElement("img");

    image.src = imageUrl;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";

    Object.assign(image.style, {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    });

    image.onerror = () => {
      imageWrap.style.display = "none";
    };

    imageWrap.appendChild(image);
    card.appendChild(imageWrap);
  }

  const content = createElement("div", {
    flex: "1",
    minWidth: "0",
    padding: "13px 14px 12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  });

  const top = createElement("div");

  const sponsored = createElement("div", {
    fontSize: "9px",
    lineHeight: "12px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.42)",
    marginBottom: "5px"
  });

  sponsored.textContent = "Sponsored";

  top.appendChild(sponsored);

  const title = createElement("div", {
    fontSize: "15px",
    lineHeight: "20px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "4px",
    overflow: "hidden",
    display: "-webkit-box",
    webkitBoxOrient: "vertical",
    webkitLineClamp: "2"
  });

  title.textContent =
    cardMetadata.title ||
    cardData.string_link_word ||
    "Recommended for you";

  top.appendChild(title);

  if (cardMetadata.brandName) {
    const brand = createElement("div", {
      fontSize: "11px",
      lineHeight: "15px",
      fontWeight: "500",
      color: "rgba(255,255,255,0.48)",
      marginBottom: "5px"
    });

    brand.textContent = cardMetadata.brandName;
    top.appendChild(brand);
  }

  if (cardMetadata.description) {
    const description = createElement("div", {
      fontSize: "11px",
      lineHeight: "16px",
      color: "rgba(255,255,255,0.62)",
      overflow: "hidden",
      display: "-webkit-box",
      webkitBoxOrient: "vertical",
      webkitLineClamp: "2"
    });

    description.textContent = cardMetadata.description;
    top.appendChild(description);
  }

  content.appendChild(top);

  const bottom = createElement("div", {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "8px"
  });

  if (cardMetadata.logoUrl) {
    const logo = document.createElement("img");

    logo.src = cardMetadata.logoUrl;
    logo.alt = cardMetadata.brandName || "";
    logo.loading = "lazy";

    Object.assign(logo.style, {
      maxWidth: "64px",
      maxHeight: "22px",
      objectFit: "contain",
      opacity: "0.85"
    });

    logo.onerror = () => {
      logo.style.display = "none";
    };

    bottom.appendChild(logo);
  } else {
    const spacer = createElement("span");
    bottom.appendChild(spacer);
  }

  const cta = createElement("span", {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: "7px",
    background: "rgba(139,92,246,0.18)",
    border: "1px solid rgba(139,92,246,0.28)",
    color: "#c4b5fd",
    fontSize: "10px",
    lineHeight: "13px",
    fontWeight: "700",
    whiteSpace: "nowrap"
  });

  cta.textContent =
    cardMetadata.ctaText ||
    "Learn more";

  bottom.appendChild(cta);

  content.appendChild(bottom);
  card.appendChild(content);

  return card;
}

function renderCards(containerId, result) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!result) {
    return;
  }

  const cards = getCardEntries(result);

  if (!cards.length) {
    console.log("Imprezia returned no UI cards.");
    return;
  }

  const wrapper = createElement("div", {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0"
  });

  cards.forEach(([, cardData]) => {
    const card = renderSingleCard(cardData);

    if (card) {
      wrapper.appendChild(card);
    }
  });

  if (wrapper.children.length) {
    container.appendChild(wrapper);
  }
}

window.JibuImprezia = {
  monetize,
  renderCards,
  resetSession: resetImpreziaSession
};

window.JibuImpreziaReady = Promise.resolve(
  window.JibuImprezia
);
