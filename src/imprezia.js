import React from "react";
import { createRoot } from "react-dom/client";
import Imprezia, {
  MonetizedContentWithCards
} from "@adimpress/imprezia-sdk";

const IMPREZIA_ENDPOINT = `${window.location.origin}/imprezia`;
const IMPREZIA_IMPRESSION_ENDPOINT =
  `${window.location.origin}/imprezia/v1/events/sdk-impression`;

const SESSION_KEY = "jibu_imprezia_session_id";

function createSessionId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "jibu-" + Date.now() + "-" + Math.random().toString(36).slice(2);
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

function renderCards(containerId, result) {
  const container = document.getElementById(containerId);

  if (!container || !result) {
    return;
  }

  try {
    const root = createRoot(container);

    root.render(
      React.createElement(MonetizedContentWithCards, {
        response: result,
        theme: "dark",
        onCardClick: (trackingId) => {
          console.log("Imprezia card click:", trackingId);
        },
        onLinkClick: (trackingId) => {
          console.log("Imprezia link click:", trackingId);
        }
      })
    );
  } catch (error) {
    console.warn("Imprezia renderer failed:", error);
  }
}

window.JibuImprezia = {
  monetize,
  renderCards,
  resetSession: resetImpreziaSession
};

window.JibuImpreziaReady = Promise.resolve(window.JibuImprezia);
