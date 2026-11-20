export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} · Vet Freedom OS` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Vet Freedom OS` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
