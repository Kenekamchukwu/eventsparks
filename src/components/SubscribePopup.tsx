import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SubscribePopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("subscribe_dismissed");
    if (dismissed) return;
    const timer = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email });
      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("You're subscribed! 🎉");
      }
      setOpen(false);
      sessionStorage.setItem("subscribe_dismissed", "true");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (val: boolean) => {
    setOpen(val);
    if (!val) sessionStorage.setItem("subscribe_dismissed", "true");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: "var(--font-display)" }}>
            <Sparkles className="w-5 h-5 text-primary" />
            Don't Miss Out!
          </DialogTitle>
          <DialogDescription>
            Get weekly updates on the hottest blockchain & tech events across Africa. No spam, ever.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
          <Input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-full"
            required
          />
          <Button type="submit" className="rounded-full font-semibold" size="lg" disabled={loading}>
            {loading ? "Subscribing..." : "Subscribe Now"}
          </Button>
          <button type="button" onClick={() => handleClose(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            No thanks, maybe later
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
