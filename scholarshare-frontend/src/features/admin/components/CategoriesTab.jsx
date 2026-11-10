import { useRef, useState } from "react";

import ConfirmDialog from "../../../components/confirmDialog/ConfirmDialog";
import StatusBlock from "../../../components/StatusBlock";
import { useAsync } from "../../../hooks/useAsync";
import {
  createCategory,
  deleteCategory,
  removeCategoryImage,
  renameCategory,
  setCategoryImage,
} from "../../../services/adminService";
import { getCategories } from "../../../services/categoryService";
import { categoryImage } from "../../../utils/categoryImage";
import Icon from "../../../components/shell/Icons";

// Add, rename, change the photo of, and delete categories. A category that still has research cannot be deleted (the server says so).
function CategoriesTab() {
  const { data, error, isLoading, reload } = useAsync(getCategories, []);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null); // { id, name }
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState(null);
  const nameInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const photoTarget = useRef(null); // the category whose photo is being chosen

  const run = async (action) => {
    setActionError(null);
    setNotice(null);
    try {
      await action();
      reload();
      return true;
    } catch (err) {
      setActionError(err.message);
      return false;
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      setNotice(null);
      setActionError("Type a category name first.");
      nameInputRef.current?.focus();
      return;
    }
    if (await run(() => createCategory(name))) {
      setNewName("");
      setNotice(`Category "${name}" was added.`);
    }
  };

  const handleRename = async (event) => {
    event.preventDefault();
    if (await run(() => renameCategory(editing.id, editing.name.trim()))) setEditing(null);
  };

  const choosePhoto = (category) => {
    photoTarget.current = category;
    photoInputRef.current.click();
  };

  const handlePhoto = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    const category = photoTarget.current;
    if (!file || !category) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setActionError("Choose an image (PNG, JPG, GIF or WebP) under 2 MB.");
      return;
    }
    await run(() => setCategoryImage(category.id, file));
  };

  const confirmDelete = async () => {
    const category = toDelete;
    setToDelete(null);
    await run(() => deleteCategory(category.id));
  };

  const list = data ?? [];

  return (
    <section className="ui-stack">
      <form className="ui-card ui-add" onSubmit={handleAdd}>
        <label htmlFor="new-category">Add a category</label>
        <div className="ui-add-row">
          <input
            id="new-category"
            ref={nameInputRef}
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="For example: Data Science"
            maxLength={100}
          />
          <button type="submit" className="ui-btn">
            <Icon name="plus" size={18} /> Add category
          </button>
        </div>
      </form>

      <input ref={photoInputRef} type="file" hidden accept="image/png,image/jpeg,image/gif,image/webp" onChange={handlePhoto} />
      {actionError && <p className="ui-alert" role="alert">{actionError}</p>}
      {notice && <p className="ui-alert ok" role="status">{notice}</p>}
      <StatusBlock isLoading={isLoading && !data} error={error} onRetry={reload} />

      <ul className="ui-cats">
        {list.map((c) => (
          <li key={c.id} className="ui-cat">
            <img src={categoryImage(c.name, c.imageUrl)} alt="" loading="lazy" />
            <div className="ui-cat-body">
              {editing?.id === c.id ? (
                <form className="ui-rename" onSubmit={handleRename}>
                  <input
                    value={editing.name}
                    onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                    aria-label="Category name"
                    maxLength={100}
                    autoFocus
                  />
                  <button type="submit" className="ui-btn sm" disabled={!editing.name.trim()}>Save</button>
                  <button type="button" className="ui-btn ghost sm" onClick={() => setEditing(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <h2>{c.name}</h2>
                  <small>{c.researchCount} published {c.researchCount === 1 ? "file" : "files"}</small>
                  <div className="ui-cat-actions">
                    <button type="button" className="ui-btn ghost sm" onClick={() => choosePhoto(c)}>
                      <Icon name="image" size={16} /> {c.imageUrl ? "Change photo" : "Add photo"}
                    </button>
                    {c.imageUrl && (
                      <button type="button" className="ui-btn ghost sm" onClick={() => run(() => removeCategoryImage(c.id))}>
                        Remove photo
                      </button>
                    )}
                    <button type="button" className="ui-btn ghost sm" onClick={() => setEditing({ id: c.id, name: c.name })}>
                      <Icon name="edit" size={16} /> Rename
                    </button>
                    <button type="button" className="ui-btn danger sm" onClick={() => setToDelete(c)}>
                      <Icon name="trash" size={16} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {toDelete && (
        <ConfirmDialog
          title={`Delete "${toDelete.name}"?`}
          message="This only works when no research uses the category."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}

export default CategoriesTab;
