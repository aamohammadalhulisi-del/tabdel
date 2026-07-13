import { db } from "./lib/db/src/index";
import { categoriesTable } from "./lib/db/src/schema/categories";

async function seed() {
  await db.insert(categoriesTable).values([
    { name: "سيارات", slug: "cars", icon: "car" },
    { name: "إلكترونيات", slug: "electronics", icon: "smartphone" },
    { name: "ملابس", slug: "clothes", icon: "shirt" },
    { name: "أثاث", slug: "furniture", icon: "home" },
    { name: "أدوات", slug: "tools", icon: "tool" },
    { name: "ألعاب", slug: "games", icon: "gamepad" },
    { name: "كتب", slug: "books", icon: "book" },
    { name: "خدمات", slug: "services", icon: "briefcase" },
  ]);

  console.log("Categories added ✅");
  process.exit(0);
}

seed();