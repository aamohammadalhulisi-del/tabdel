import { eq } from "drizzle-orm";
import { db, listingsTable, usersTable, categoriesTable } from "@workspace/db";

export async function buildListingRow(listing: typeof listingsTable.$inferSelect) {
  const [owner] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      city: usersTable.city,
      avatarUrl: usersTable.avatarUrl,
      rating: usersTable.rating,
      ratingCount: usersTable.ratingCount,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, listing.userId));

  const [category] = await db
    .select({ id: categoriesTable.id, name: categoriesTable.name, slug: categoriesTable.slug, icon: categoriesTable.icon })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, listing.categoryId));

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    condition: listing.condition,
    wantsInExchange: listing.wantsInExchange,
    city: listing.city,
    images: listing.images,
    isFeatured: listing.isFeatured,
    isActive: listing.isActive,
    createdAt: listing.createdAt,
    category: { ...category, listingsCount: 0 },
    owner: { ...owner, listingsCount: 0 },
  };
}
