import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RxCross1 } from 'react-icons/rx';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../redux/actions/storefront';

const empty = { name: '', subTitle: '', image: '' };

const CategoryManager = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.storefront);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editingId) {
        await dispatch(updateCategory(editingId, form));
        toast.success('Category updated');
      } else {
        await dispatch(createCategory(form));
        toast.success('Category added');
      }
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const edit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, subTitle: c.subTitle || '', image: c.image || '' });
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try {
      await dispatch(deleteCategory(c._id));
      toast.success('Category deleted');
      if (editingId === c._id) reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Categories</h1>

      <form
        onSubmit={submit}
        className="bg-surface border border-border rounded-md p-4 mb-6 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            {editingId ? 'Edit category' : 'Add category'}
          </h3>
          {editingId && (
            <button type="button" onClick={reset} className="text-muted">
              <RxCross1 />
            </button>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={form.name}
            onChange={set('name')}
            placeholder="Name *"
            className="border border-border rounded px-3 h-[38px] bg-surface text-content"
          />
          <input
            value={form.subTitle}
            onChange={set('subTitle')}
            placeholder="Subtitle (optional)"
            className="border border-border rounded px-3 h-[38px] bg-surface text-content"
          />
        </div>
        <input
          value={form.image}
          onChange={set('image')}
          placeholder="Image URL (optional)"
          className="w-full border border-border rounded px-3 h-[38px] bg-surface text-content"
        />
        <button
          disabled={saving}
          className="h-[40px] px-5 rounded-md bg-brand text-white font-semibold disabled:opacity-60"
        >
          {saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
        </button>
      </form>

      <div className="bg-surface border border-border rounded-md divide-y divide-border">
        {(categories || []).length === 0 && (
          <p className="p-4 text-muted text-sm">No categories yet.</p>
        )}
        {(categories || []).map((c) => (
          <div key={c._id} className="flex items-center gap-3 p-3">
            {c.image ? (
              <img src={c.image} alt="" className="w-10 h-10 rounded object-cover" />
            ) : (
              <div className="w-10 h-10 rounded bg-surface-alt" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-content truncate">{c.name}</div>
              {c.subTitle && (
                <div className="text-xs text-muted truncate">{c.subTitle}</div>
              )}
            </div>
            <button onClick={() => edit(c)} className="p-2 text-muted hover:text-brand">
              <FiEdit2 />
            </button>
            <button onClick={() => remove(c)} className="p-2 text-muted hover:text-red-500">
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
