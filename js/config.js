/**
 * ElevateLabs Creatives: all site content.
 * Edit this file only. main.js renders the page from it.
 * Images: put files in /assets and use "assets/name.jpg". Leave "" for a placeholder.
 * Videos: use only the YouTube video ID (11 characters, the part after v=).
 * Everything marked REPLACE is placeholder text for you to change.
 */
window.SITE = {
  // ---------- Brand ----------
  name: "ElevateLabs Creatives",
  logoMain: "Elevate",
  logoAccent: "Labs",
  email: "hello@yourdomain.com", // REPLACE: the contact form sends to this address

  // ---------- Header ----------
  nav: [
    { label: "Services", href: "#services" },
    { label: "Packages", href: "#packages" },
    { label: "Work", href: "#work" },
    { label: "Process", href: "#process" },
    { label: "Contact", href: "#contact" },
  ],
  headerCta: "Get a quote",

  // ---------- Hero ----------
  hero: {
    badge: "Esports media production",
    titleLine1: "We build the look of",
    titleLine2: "esports.",
    text:
      "ElevateLabs Creatives is an esports media agency. Team branding, stream packages, " +
      "tournament graphics, highlight videos and digital art, delivered on contract.",
    buttons: [
      { label: "View packages", href: "#packages", style: "primary" },
      { label: "See our work", href: "#work", style: "ghost" },
    ],
    meta: "Teams · Streamers · Tournaments · Gaming brands", // REPLACE
  },

  // ---------- Scrolling ticker ----------
  ticker: [
    "Team Logos", "Stream Overlays", "Tournament Branding", "Highlight Reels", "Player Cards",
    "Motion Graphics", "Thumbnails", "Social Packs", "Key Art", "Merch Design",
  ], // REPLACE with your real services

  // ---------- 01 Services ----------
  capabilities: {
    label: "01 / What we create",
    title: "Full-stack media for competitive gaming.",
    lead: "From a single logo to a whole season of content, one studio handles identity, graphics, video and art.",
    items: [
      { tag: "Identity", title: "Team and brand identity",        text: "Logos, mascots, colour systems and brand books that make your roster instantly recognisable.", media: "" },
      { tag: "Stream",   title: "Stream packages and overlays",   text: "Overlays, scenes, alerts, panels and stinger transitions, ready for OBS and Streamlabs.",       media: "" },
      { tag: "Events",   title: "Tournament and event branding",  text: "Broadcast graphics, brackets, lower thirds and stage visuals for online and LAN events.",       media: "" },
      { tag: "Video",    title: "Highlights and video production", text: "Highlight reels, montages, trailers and player intros cut to feel like a broadcast.",           media: "" },
      { tag: "Social",   title: "Player cards and social content", text: "Roster cards, match day graphics, banners and thumbnails that keep your channels consistent.",  media: "" },
      { tag: "Art",      title: "Digital art and illustration",   text: "Custom character art, key art, posters and merch designs with your team's personality.",        media: "" },
    ], // REPLACE texts and add media images/videos (e.g. "assets/overlay.jpg" or "assets/reel.mp4")
  },

  // ---------- 02 Packages (contract based) ----------
  packages: {
    label: "02 / Contract packages",
    title: "Pick a contract. Or build your own.",
    lead: "Every package runs on a written contract with agreed scope, deliverables, revision rounds and timelines.",
    featuredLabel: "Most picked",
    items: [
      {
        tag: "For new teams and streamers", name: "Rookie", price: "₹0,000", period: "/ month · 3-month contract", featured: false, // REPLACE price
        text: "A clean, professional look to get you started.",
        features: ["Logo refresh or mini brand kit", "1 stream overlay set", "4 social graphics per month", "2 revision rounds", "Email support"],
        cta: "Choose Rookie",
      },
      {
        tag: "For active rosters", name: "Pro League", price: "₹0,000", period: "/ month · 6-month contract", featured: true, // REPLACE price
        text: "A complete visual system for a full competitive season.",
        features: ["Full team identity and brand book", "Complete stream package", "12 social graphics per month", "2 highlight edits per month", "3 revision rounds", "Priority turnaround"],
        cta: "Choose Pro League",
      },
      {
        tag: "For orgs and events", name: "Championship", price: "₹0,000", period: "/ month · 12-month contract", featured: false, // REPLACE price
        text: "Your own media department, on retainer.",
        features: ["Full brand system and guidelines", "Tournament and broadcast graphics", "Unlimited social graphics (fair use)", "6 video edits per month", "Dedicated art lead", "Same-week turnaround"],
        cta: "Choose Championship",
      },
    ], // REPLACE features and prices with your real offer
    custom: {
      name: "Custom contract",
      title: "Need something different?",
      text: "One-off tournament, a rebrand, a single trailer or a mix of everything. Tell us the scope and we'll write a contract around it.",
      cta: "Request custom quote",
    },
    note: "Prices are placeholders. Replace them in js/config.js. Contract length, revisions and payment terms are set in your agreement.",
  },

  // ---------- 03 Work (horizontal scroll) ----------
  work: {
    label: "03 / Selected work",
    title: "Made by ElevateLabs.",
    items: [
      { tag: "Tournament branding", title: "Project name one",   youtubeId: "", image: "" },
      { tag: "Stream package",      title: "Project name two",   youtubeId: "", image: "" },
      { tag: "Highlight reel",      title: "Project name three", youtubeId: "", image: "" },
      { tag: "Team identity",       title: "Project name four",  youtubeId: "", image: "" },
      { tag: "Key art",             title: "Project name five",  youtubeId: "", image: "" },
    ], // REPLACE: add a YouTube ID for video or an image path. Empty shows a placeholder.
  },

  // ---------- 04 Process ----------
  process: {
    label: "04 / How a contract works",
    title: "From brief to broadcast.",
    steps: [
      { title: "Brief",     text: "We learn your team, audience, games and goals." },
      { title: "Contract",  text: "We agree scope, deliverables, timelines and revisions in writing." },
      { title: "Production", text: "We design, animate and edit, with regular check-ins." },
      { title: "Delivery",  text: "You get final files, source and usage rights, ready to deploy." },
    ],
  },

  // ---------- Contact ----------
  cta: {
    pill: "Now booking season contracts",
    title: "Let's level up your brand.",
    text: "Tell us about your team or event. We'll reply within two working days.",
    button: "Send message",
  },

  // ---------- Footer ----------
  footer: {
    about: "An esports media production agency for graphics, video, design and art.",
    columns: [
      { title: "Services", links: [
        { label: "Team Identity",   href: "#services" },
        { label: "Stream Packages", href: "#services" },
        { label: "Tournaments",     href: "#services" },
        { label: "Video & Art",     href: "#services" },
      ] },
      { title: "Studio", links: [
        { label: "Packages", href: "#packages" },
        { label: "Work",     href: "#work" },
        { label: "Process",  href: "#process" },
        { label: "Contact",  href: "#contact" },
      ] },
      { title: "Social", links: [
        { label: "Instagram", href: "https://instagram.com/yourhandle" },      // REPLACE
        { label: "YouTube",   href: "https://youtube.com/@yourchannel" },      // REPLACE
        { label: "Discord",   href: "https://discord.gg/yourinvite" },         // REPLACE
        { label: "LinkedIn",  href: "https://linkedin.com/company/yourpage" }, // REPLACE
      ] },
    ],
    location: "Navi Mumbai, India", // REPLACE or ""
    tagline: "Made by gamers and artists",
  },
};