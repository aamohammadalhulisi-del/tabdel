import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { v2 as cloudinary } from "cloudinary";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();

const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    error: "لقد تجاوزت الحد المسموح لرفع الصور، حاول لاحقاً."
  }
});

cloudinary.config({
  cloud_name: "ki93wfkn",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post(
  "/upload",
  requireAuth,
  uploadLimiter,
  async (req, res): Promise<void> => {
    try {
      const { base64 } = req.body;

      if (!base64 || typeof base64 !== "string") {
        res.status(400).json({
          error: "لم يتم إرسال صورة.",
        });
        return;
      }

      // السماح فقط بالصور
      if (
        !base64.startsWith("data:image/jpeg") &&
        !base64.startsWith("data:image/png") &&
        !base64.startsWith("data:image/webp")
      ) {
        res.status(400).json({
          error: "نوع الصورة غير مدعوم.",
        });
        return;
      }

      // الحد الأقصى 5MB تقريباً
      if (base64.length > 7_000_000) {
        res.status(400).json({
          error: "حجم الصورة كبير جداً.",
        });
        return;
      }

      const result = await cloudinary.uploader.upload(base64, {
  folder: "tabdeel",
  resource_type: "image",
});

      res.json({
        url: result.secure_url,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "فشل رفع الصورة.",
      });
    }
  }
);

export default router;