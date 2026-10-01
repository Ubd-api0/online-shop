"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { updateStorefront } from "@/redux/slices/storefront";
import { TILE_ICON_KEYS, TileIcon } from "@/lib/tileIcons";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function StorefrontEditor() {
  const dispatch = useDispatch();
  const { hero, featureTiles } = useSelector((state) => state.storefront);

  const [heroForm, setHeroForm] = useState({ title: "", subtitle: "", ctaText: "", ctaLink: "", image: "" });
  const [tiles, setTiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHeroForm({
      title: hero?.title || "",
      subtitle: hero?.subtitle || "",
      ctaText: hero?.ctaText || "Shop Now",
      ctaLink: hero?.ctaLink || "/products",
      image: hero?.image || "",
    });
    setTiles((featureTiles || []).map((t) => ({ title: t.title || "", description: t.description || "", icon: t.icon || "truck" })));
  }, [hero, featureTiles]);

  const setHero = (k) => (e) => setHeroForm((f) => ({ ...f, [k]: e.target.value }));
  const setTile = (i, k, v) => setTiles((arr) => arr.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)));
  const addTile = () => setTiles((arr) => [...arr, { title: "", description: "", icon: "truck" }]);
  const removeTile = (i) => setTiles((arr) => arr.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      await dispatch(
        updateStorefront({ hero: heroForm, featureTiles: tiles.filter((t) => t.title || t.description) })
      ).unwrap();
      toast.success("Storefront updated");
    } catch (err) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <Card variant="solid" className="space-y-3 p-4">
        <h3 className="font-medium text-content">Hero banner</h3>
        <Input value={heroForm.title} onChange={setHero("title")} placeholder="Heading" />
        <Input value={heroForm.subtitle} onChange={setHero("subtitle")} placeholder="Subtitle" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input value={heroForm.ctaText} onChange={setHero("ctaText")} placeholder="Button text" />
          <Input value={heroForm.ctaLink} onChange={setHero("ctaLink")} placeholder="Button link (e.g. /products)" />
        </div>
        <Input value={heroForm.image} onChange={setHero("image")} placeholder="Background image URL" />
        {heroForm.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroForm.image} alt="" className="h-28 w-full rounded-DEFAULT object-cover" />
        )}
      </Card>

      <Card variant="solid" className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-content">Feature tiles</h3>
          <button onClick={addTile} className="flex items-center gap-1 text-sm text-brand">
            <Plus className="size-4" /> Add tile
          </button>
        </div>
        {tiles.length === 0 && <p className="text-sm text-muted">No tiles. Add one above.</p>}
        {tiles.map((t, i) => (
          <div key={i} className="space-y-2 rounded-DEFAULT border border-border p-3">
            <div className="flex items-center gap-3">
              <TileIcon name={t.icon} className="text-brand" />
              <select
                value={t.icon}
                onChange={(e) => setTile(i, "icon", e.target.value)}
                className="h-9 rounded-DEFAULT border border-border bg-surface px-2 text-content"
              >
                {TILE_ICON_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <button onClick={() => removeTile(i)} className="ml-auto text-muted hover:text-danger">
                <Trash2 className="size-4" />
              </button>
            </div>
            <Input value={t.title} onChange={(e) => setTile(i, "title", e.target.value)} placeholder="Title" />
            <Input value={t.description} onChange={(e) => setTile(i, "description", e.target.value)} placeholder="Description" />
          </div>
        ))}
      </Card>

      <Button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save storefront"}
      </Button>
    </div>
  );
}
