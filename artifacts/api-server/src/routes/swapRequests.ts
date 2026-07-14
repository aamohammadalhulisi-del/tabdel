import { Router, type IRouter } from "express";
import { eq, or, and } from "drizzle-orm";
import {
  db,
  swapRequestsTable,
  listingsTable,
  usersTable,
  notificationsTable,
} from "@workspace/db";
import {
  CreateSwapRequestBody,
  GetSwapRequestsQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { buildListingRow } from "./listings-helper";

const router: IRouter = Router();

async function buildSwapRequest(
  sr: typeof swapRequestsTable.$inferSelect
) {
  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, sr.listingId));

  const [requester] = await db
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
    .where(eq(usersTable.id, sr.requesterId));

  return {
    id: sr.id,
    listing: listing ? await buildListingRow(listing) : null,
    requester: {
      ...requester,
      listingsCount: 0,
    },
    message: sr.message,
    status: sr.status,
    createdAt: sr.createdAt,
  };
}


// جلب طلبات التبديل
router.get("/swap-requests", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId as number;

  const params = GetSwapRequestsQueryParams.safeParse(req.query);

  const { type, status } = params.success
    ? params.data
    : ({} as any);

  let rows: typeof swapRequestsTable.$inferSelect[] = [];

  if (type === "sent") {
    rows = await db
      .select()
      .from(swapRequestsTable)
      .where(eq(swapRequestsTable.requesterId, userId));

  } else if (type === "received") {
    rows = await db
      .select()
      .from(swapRequestsTable)
      .where(eq(swapRequestsTable.ownerId, userId));

  } else {
    rows = await db
      .select()
      .from(swapRequestsTable)
      .where(
        or(
          eq(swapRequestsTable.requesterId, userId),
          eq(swapRequestsTable.ownerId, userId)
        )!
      );
  }


  if (status) {
    rows = rows.filter(
      (r) => r.status === status
    );
  }


  const result = await Promise.all(
    rows.map(buildSwapRequest)
  );


  res.json(result);
});



// إنشاء طلب تبديل
router.post("/swap-requests", requireAuth, async (req, res): Promise<void> => {

  console.log("========== SWAP REQUEST ==========");
  console.log("BODY:", req.body);
  console.log("USER:", req.session.userId);

  const requesterId = (req.session as any).userId as number;

  // إصلاح مشكلة وصول الرقم كنص
  const body = {
    ...req.body,
    listingId: Number(req.body.listingId),
  };


  const parsed = CreateSwapRequestBody.safeParse(body);


  if (!parsed.success) {

    console.log(
      "SWAP REQUEST INVALID BODY:",
      req.body
    );

    console.log(
      parsed.error
    );


    res.status(400).json({
      error: parsed.error.message,
      received: req.body,
    });


    return;
  }



  const {
    listingId,
    message,
  } = parsed.data;



  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId));



  if (!listing) {

    res.status(404).json({
      error: "Listing not found",
    });

    return;
  }



  if (listing.userId === requesterId) {

    res.status(400).json({
      error: "Cannot request swap on your own listing",
    });

    return;
  }



  const [existing] = await db
    .select()
    .from(swapRequestsTable)
    .where(
      and(
        eq(
          swapRequestsTable.listingId,
          listingId
        ),
        eq(
          swapRequestsTable.requesterId,
          requesterId
        )
      )
    );



  if (existing) {

    res.status(400).json({
      error: "Already sent a swap request for this listing",
    });

    return;
  }




  const [sr] = await db
    .insert(swapRequestsTable)
    .values({

      listingId,

      requesterId,

      ownerId: listing.userId,

      message: message || null,

    })
    .returning();




  const [requester] = await db
    .select({
      name: usersTable.name,
    })
    .from(usersTable)
    .where(
      eq(
        usersTable.id,
        requesterId
      )
    );



  await db
    .insert(notificationsTable)
    .values({

      userId: listing.userId,

      type: "swap_request",

      title: "طلب تبديل جديد",

      body:
        `أرسل ${requester.name} طلب تبديل على إعلانك "${listing.title}"`,

      relatedId: sr.id,

    });




  const result =
    await buildSwapRequest(sr);



  res
    .status(201)
    .json(result);

});




// قبول الطلب
router.patch(
  "/swap-requests/:id/accept",
  requireAuth,
  async (req, res): Promise<void> => {

    const userId =
      (req.session as any).userId as number;


    const id =
      Number(req.params.id);



    const [sr] =
      await db
        .select()
        .from(swapRequestsTable)
        .where(
          eq(
            swapRequestsTable.id,
            id
          )
        );



    if (!sr) {
      res.status(404).json({
        error:"Not found",
      });
      return;
    }



    if (sr.ownerId !== userId) {
      res.status(403).json({
        error:"Forbidden",
      });
      return;
    }



    const [updated] =
      await db
        .update(swapRequestsTable)
        .set({
          status:"accepted",
        })
        .where(
          eq(
            swapRequestsTable.id,
            id
          )
        )
        .returning();



    const result =
      await buildSwapRequest(updated);


    res.json(result);

  }
);



export default router;
