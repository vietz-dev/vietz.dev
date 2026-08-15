// @ts-check
import tailwindcss from '@tailwindcss/vite';
import umami from '@yeskunall/astro-umami';
import { defineConfig } from 'astro/config';

// Umami ist self-hosted unter https://analytics.vietz.dev (cookieless Analytics).
// Website-ID aus dem Umami-Dashboard (Settings → Websites → vietz.dev).
// Optional per Umgebungsvariable UMAMI_WEBSITE_ID übersteuerbar.
const umamiWebsiteId =
  process.env.UMAMI_WEBSITE_ID || "f2b443d5-da6a-47ad-8c9b-e22897d8c6ea";

// https://astro.build/config
export default defineConfig({
  site: "https://vietz.dev",
  integrations: [
    umami({
      id: umamiWebsiteId,
      // Self-hosted Instanz (Script + API laufen auf analytics.vietz.dev)
      endpointUrl: "https://analytics.vietz.dev",
      // Tracker nur auf der eigenen Domain ausführen lassen
      domains: ["vietz.dev", "www.vietz.dev"],
      // Do-Not-Track/GPC respektieren
      doNotTrack: true,
      // Keine URL-Parameter/Hash erfassen (mehr Privatsphäre; deaktiviert UTM-Attribution)
      excludeSearch: true,
      excludeHash: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
