import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
        toast.success("You're subscribed! Watch your inbox for African tech event updates.");
      }
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <Mail className="w-4 h-4" />
        Stay in the loop
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Get weekly updates on African blockchain & tech events.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-full text-sm h-9"
          required
        />
        <Button type="submit" size="sm" className="rounded-full px-5 shrink-0" disabled={loading}>
          {loading ? "..." : "Subscribe"}
        </Button>
      </form>
    </div>
  );
};
