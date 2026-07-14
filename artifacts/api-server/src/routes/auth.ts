import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import { db, usersTable } from "@workspace/db";
import { RegisterBody, LoginBody, GetMeResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: "محاولات كثيرة، حاول بعد قليل",
  },
});


function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    city: u.city,
    avatarUrl: u.avatarUrl,
    rating: u.rating,
    ratingCount: u.ratingCount,
    isAdmin: u.isAdmin,
    isBanned: u.isBanned,
    createdAt: u.createdAt,
  };
}



// تسجيل حساب جديد
router.post("/auth/register", authLimiter, async (req, res): Promise<void> => {

  const parsed = RegisterBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.message,
    });
    return;
  }


  const { name, email, password, phone, city } = parsed.data;


  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));


  if (existing) {
    res.status(400).json({
      error: "البريد الإلكتروني مستخدم بالفعل",
    });
    return;
  }


  const passwordHash = await bcrypt.hash(password, 10);


  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      passwordHash,
      phone: phone || "",
      city: city || "",
    })
    .returning();



  req.session.userId = user.id;
  req.session.isAdmin = user.isAdmin;



  req.session.save((err) => {

    if (err) {

      logger.error(
        { err },
        "Session save failed"
      );


      res.status(500).json({
        error: "Failed to save session",
      });

      return;
    }


    res.status(201).json({
      user: formatUser(user),
    });

  });

});





// تسجيل الدخول
router.post("/auth/login", authLimiter, async (req, res): Promise<void> => {


  const parsed = LoginBody.safeParse(req.body);


  if (!parsed.success) {

    res.status(400).json({
      error: parsed.error.message,
    });

    return;
  }



  const { email, password } = parsed.data;



  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));



  if (!user) {

    res.status(401).json({
      error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    });

    return;
  }



  if (user.isBanned) {

    res.status(403).json({
      error: "تم حظر هذا الحساب",
    });

    return;
  }



  const valid = await bcrypt.compare(
    password,
    user.passwordHash
  );



  if (!valid) {

    res.status(401).json({
      error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    });

    return;
  }




  req.session.userId = user.id;
  req.session.isAdmin = user.isAdmin;



  req.session.save((err) => {


    if (err) {

      logger.error(
        { err },
        "Session save failed"
      );


      res.status(500).json({
        error: "Failed to save session",
      });


      return;
    }



    res.status(200).json({
      user: formatUser(user),
    });


  });


});







// تسجيل خروج
router.post("/auth/logout", async (req, res): Promise<void> => {


  req.session.destroy((err) => {

    if (err) {

      logger.error(
        { err },
        "Failed to destroy session"
      );

    }

  });


  res.json({
    ok: true,
  });

});







// المستخدم الحالي
router.get("/auth/me", async (req, res): Promise<void> => {


  const userId = req.session.userId;



  if (!userId) {

    res.status(401).json({
      error: "Not authenticated",
    });

    return;
  }



  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));



  if (!user) {

    res.status(401).json({
      error: "Not authenticated",
    });

    return;
  }



  res.json(
    GetMeResponse.parse(
      formatUser(user)
    )
  );


});



export default router;