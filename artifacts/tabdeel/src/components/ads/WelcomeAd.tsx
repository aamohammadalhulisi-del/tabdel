import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomeAd() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("welcome_ad_seen");

    if (!seen) {
      setShow(true);
      localStorage.setItem("welcome_ad_seen", "true");
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-background rounded-2xl shadow-xl max-w-md w-full p-6 text-center">

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => setShow(false)}
        >
          <X />
        </Button>

        <h2 className="text-2xl font-bold mb-4">
          إعلان
        </h2>

        <div className="h-52 bg-muted rounded-xl flex items-center justify-center">
          مساحة الإعلان
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          إعلانك هنا
        </p>

      </div>
    </div>
  );
}