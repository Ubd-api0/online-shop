import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import { updateStorefront } from '../../redux/actions/storefront';
import { TILE_ICON_KEYS, TileIcon } from '../../utils/tileIcons';

const StorefrontEditor = () => {
  const dispatch = useDispatch();
  const { hero, featureTiles } = useSelector((state) => state.storefront);

  const [heroForm, setHeroForm] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    image: '',
  });
  const [tiles, setTiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHeroForm({
      title: hero?.title || '',
      subtitle: hero?.subtitle || '',
      ctaText: hero?.ctaText || 'Shop Now',
      ctaLink: hero?.ctaLink || '/products',
      image: hero?.image || '',
    });
    setTiles(
      (featureTiles || []).map((t) => ({
        title: t.title || '',
        description: t.description || '',
        icon: t.icon || 'truck',
      }))
    );
  }, [hero, featureTiles]);

  const setHero = (k) => (e) =>
    setHeroForm((f) => ({ ...f, [k]: e.target.value }));

  const setTile = (i, k, v) =>
    setTiles((arr) => arr.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)));

  const addTile = () =>
    setTiles((arr) => [...arr, { title: '', description: '', icon: 'truck' }]);

  const removeTile = (i) =>
    setTiles((arr) => arr.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      await dispatch(
        updateStorefront({
          hero: heroForm,
          featureTiles: tiles.filter((t) => t.title || t.description),
        })
      );
      toast.success('Storefront updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const input =
    'w-full border border-border rounded px-3 h-[38px] bg-surface text-content';

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-xl font-semibold">Storefront</h1>

      {/* Hero */}
      <section className="bg-surface border border-border rounded-md p-4 space-y-3">
        <h3 className="font-medium">Hero banner</h3>
        <input value={heroForm.title} onChange={setHero('title')} placeholder="Heading" className={input} />
        <input value={heroForm.subtitle} onChange={setHero('subtitle')} placeholder="Subtitle" className={input} />
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={heroForm.ctaText} onChange={setHero('ctaText')} placeholder="Button text" className={input} />
          <input value={heroForm.ctaLink} onChange={setHero('ctaLink')} placeholder="Button link (e.g. /products)" className={input} />
        </div>
        <input value={heroForm.image} onChange={setHero('image')} placeholder="Background image URL" className={input} />
        {heroForm.image && (
          <img src={heroForm.image} alt="" className="h-28 w-full object-cover rounded" />
        )}
      </section>

      {/* Feature tiles */}
      <section className="bg-surface border border-border rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Feature tiles</h3>
          <button onClick={addTile} className="flex items-center gap-1 text-brand text-sm">
            <FiPlus /> Add tile
          </button>
        </div>
        {tiles.length === 0 && (
          <p className="text-muted text-sm">No tiles. Add one above.</p>
        )}
        {tiles.map((t, i) => (
          <div key={i} className="border border-border rounded p-3 space-y-2">
            <div className="flex items-center gap-3">
              <TileIcon name={t.icon} className="text-brand" />
              <select
                value={t.icon}
                onChange={(e) => setTile(i, 'icon', e.target.value)}
                className="border border-border rounded px-2 h-[34px] bg-surface text-content"
              >
                {TILE_ICON_KEYS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <button onClick={() => removeTile(i)} className="ml-auto text-muted hover:text-red-500">
                <FiTrash2 />
              </button>
            </div>
            <input
              value={t.title}
              onChange={(e) => setTile(i, 'title', e.target.value)}
              placeholder="Title"
              className={input}
            />
            <input
              value={t.description}
              onChange={(e) => setTile(i, 'description', e.target.value)}
              placeholder="Description"
              className={input}
            />
          </div>
        ))}
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="h-[42px] px-6 rounded-md bg-brand text-white font-semibold disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save storefront'}
      </button>
    </div>
  );
};

export default StorefrontEditor;
