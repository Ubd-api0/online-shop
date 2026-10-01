"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const TOPICS = ["Order & delivery", "Returns & refunds", "Payments", "Product question", "Account", "Other"];

const selectClass =
  "h-11 w-full rounded-DEFAULT border border-border bg-surface px-3 text-sm text-content outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/50";

export function ContactForm() {
  const { user } = useSelector((state) => state.user);
  const [form, setForm] = useState({ name: "", email: "", subject: TOPICS[0], orderId: "", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const value = (k) => form[k] || (k === "name" ? user?.name : k === "email" ? user?.email : "") || "";
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, name: value("name"), email: value("email") };
    if (payload.message.trim().length < 10) return toast.error("Please write a message of at least 10 characters");
    setSending(true);
    try {
      const { data } = await api.post("/contact", payload);
      toast.success(data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send your message");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Card variant="solid" className="flex flex-col items-center p-10 text-center">
        <CheckCircle2 className="size-14 text-success" strokeWidth={1.5} />
        <h2 className="mt-4 text-xl font-semibold text-content">Message sent</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Thanks for reaching out. We&apos;ll reply to <span className="text-content">{value("email")}</span> as soon as
          we can.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSent(false);
            setForm((f) => ({ ...f, message: "", orderId: "" }));
          }}
        >
          Send another message
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="solid" className="p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-content">Send us a message</h2>
      <p className="mt-1 text-sm text-muted">We usually reply within one business day.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c-name">Your name</Label>
          <Input id="c-name" required value={value("name")} onChange={set("name")} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" type="email" required value={value("email")} onChange={set("email")} autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-topic">Topic</Label>
          <select id="c-topic" className={selectClass} value={form.subject} onChange={set("subject")}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-order">Order number (optional)</Label>
          <Input id="c-order" value={form.orderId} onChange={set("orderId")} placeholder="e.g. #99BB259A" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="c-msg">Message</Label>
          <Textarea id="c-msg" rows={6} required value={form.message} onChange={set("message")} placeholder="How can we help?" />
        </div>
        {/* honeypot — hidden from people, bots fill it */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={set("website")}
          className="hidden"
          aria-hidden
        />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={sending} className="w-full sm:w-auto">
            {sending ? <Loader2 className="animate-spin" /> : <Send />} Send message
          </Button>
        </div>
      </form>
    </Card>
  );
}
