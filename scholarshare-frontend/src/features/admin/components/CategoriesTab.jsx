import { useState } from "react";

import ConfirmDialog from "../../../components/confirmDialog/ConfirmDialog";
import StatusBlock from "../../../components/StatusBlock";
import { useAsync } from "../../../hooks/useAsync";
import { createCategory, deleteCategory, renameCategory } from "../../../services/adminService";
import { getCategories } from "../../../services/categoryService";

// Add, rename and delete categories. A category that still has research cannot be deleted (the server says so).
function CategoriesTab() {
  const { data, error, isLoading, reload } = useAsync(getCategories, []);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null); // { id, name }
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState(null);

  const run = async (action) => {
    setActionError(null);
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
    if (await run(() => createCategory(newName.trim()))) setNewName("");
  };

  const handleRename = async (event) => {
    event.preventDefault();
    if (await run(() => renameCategory(editing.id, editing.name.trim()))) setEditing(null);
  };

  const confirmDelete = async () => {
    const category = toDelete;
    setToDelete(null);
    await run(() => deleteCategory(category.id));
  };

  const list = data ?? [];

  return (
    <section className="pg-card">
      <h2>Categories</h2>

      <form className="pg-inline-form" onSubmit={handleAdd}>
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New category name"
          aria-label="New category name"
          maxLength={100}
        />
        <button type="submit" className="pg-btn" disabled={!newName.trim()}>Add category</button>
      </form>

      {actionError && <p className="pg-message error" role="alert" style={{ marginBottom: 12 }}>{actionError}</p>}
      <StatusBlock isLoading={isLoading && !data} error={error} onRetry={reload} />

      <ul className="pg-list">
        {list.map((c) => (
          <li key={c.id} className="pg-list-item">
            {editing?.id === c.id ? (
              <form className="pg-inline-form" style={{ margin: 0, flex: 1 }} onSubmit={handleRename}>
                <input
                  value={editing.name}
                  onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                  aria-label="Category name"
                  maxLength={100}
                  autoFocus
                />
                <button type="submit" className="pg-btn small" disabled={!editing.name.trim()}>Save</button>
                <button type="button" className="pg-btn secondary small" onClick={() => setEditing(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <div>
                  <strong>{c.name}</strong>
                  <small>{c.researchCount} published {c.researchCount === 1 ? "file" : "files"}</small>
                </div>
                <div className="pg-row-actions">
                  <button type="button" className="pg-btn secondary small" onClick={() => setEditing({ id: c.id, name: c.name })}>
                    Rename
                  </button>
                  <button type="button" className="pg-btn danger small" onClick={() => setToDelete(c)}>
                    Delete
                  </button>
                </div>
              </>
            )}
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
