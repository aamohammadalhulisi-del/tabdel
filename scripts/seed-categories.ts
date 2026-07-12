import { db, categoriesTable } from "../lib/db/src/index.ts";
async function seed() {
  await db.insert(categoriesTable).values([
    { name: "إلكترونيات", slug: "electronics", icon: "devices" },
    { name: "سيارات", slug: "cars", icon: "car" },
    { name: "ملابس", slug: "clothes", icon: "shirt" },
    { name: "أجهزة منزلية", slug: "home-appliances", icon: "home" },
    { name: "ألعاب", slug: "games", icon: "gamepad" },
    { name: "كتب", slug: "books", icon: "book" },
    { name: "خدمات", slug: "services", icon: "briefcase" },
    { name: "أدوات", slug: "tools", icon: "tool" },
  ]);

  console.log("Categories added");
  process.exit(0);
}

seed();