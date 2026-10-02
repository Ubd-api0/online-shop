"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Trash2, Plus, Image as ImageIcon, LayoutGrid } from "lucide-react";
import { updateStorefront } from "@/redux/slices/storefront";
import { TILE_ICON_KEYS, TileIcon } from "@/lib/tileIcons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DASHBOARD_FORM_WIDTH, SectionCard } from "@/components/dashboard/section-card";

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
    <div className={DASHBOARD_FORM_WIDTH}>
      <SectionCard icon={ImageIcon} title="Hero banner" description="The large banner at the top of your home page.">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input value={heroForm.title} onChange={setHero("title")} placeholder="e.g. Furniture for every room" />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={heroForm.subtitle} onChange={setHero("subtitle")} placeholder="A short line under the heading" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Button text</Label>
                <Input value={heroForm.ctaText} onChange={setHero("ctaText")} placeholder="Shop Now" />
              </div>
              <div className="space-y-2">
                <Label>Button link</Label>
                <Input value={heroForm.ctaLink} onChange={setHero("ctaLink")} placeholder="/products" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Background image URL</Label>
              <Input value={heroForm.image} onChange={setHero("image")} placeholder="https://…" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Preview</Label>
            {heroForm.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroForm.image} alt="" className="aspect-[3/1] w-full rounded-DEFAULT border border-border object-cover lg:aspect-video" />
            ) : (
              <div className="flex aspect-[3/1] w-full items-center justify-center rounded-DEFAULT border-2 border-dashed lg:aspect-video border-border text-sm text-muted">
                Add an image URL to preview it
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={LayoutGrid}
        title="Feature tiles"
        description="Short highlights shown under the banner, e.g. free delivery or warranty."
        action={
          <Button type="button" variant="outline" size="sm" onClick={addTile}>
            <Plus className="size-4" /> Add tile
          </Button>
        }
      >
        {tiles.length === 0 && <p className="text-sm text-muted">No tiles yet. Use “Add tile” to create one.</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {tiles.map((t, i) => (
            <div key={i} className="space-y-3 rounded-DEFAULT border border-border p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-DEFAULT bg-surface-alt">
                  <TileIcon name={t.icon} className="text-brand" />
                </span>
                <select
                  value={t.icon}
                  onChange={(e) => setTile(i, "icon", e.target.value)}
                  aria-label="Tile icon"
                  className="h-9 min-w-0 flex-1 rounded-DEFAULT border border-border bg-surface px-2 text-content"
                >
                  {TILE_ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeTile(i)}
                  aria-label="Remove tile"
                  className="p-2 text-muted hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <Input value={t.title} onChange={(e) => setTile(i, "title", e.target.value)} placeholder="Title" aria-label="Tile title" />
              <Input
                value={t.description}
                onChange={(e) => setTile(i, "description", e.target.value)}
                placeholder="Description"
                aria-label="Tile description"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="w-full sm:w-auto sm:min-w-[180px]">
          {saving ? "Saving…" : "Save storefront"}
        </Button>
      </div>
    </div>
  );
}
