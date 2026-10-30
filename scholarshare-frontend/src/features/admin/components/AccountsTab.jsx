import { useState } from "react";

import Pagination from "../../../components/pagination/Pagination";
import StatusBlock from "../../../components/StatusBlock";
import { PAGE_SIZE } from "../../../config/constants";
import { useAsync } from "../../../hooks/useAsync";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import {
  approveUser,
  disableUser,
  getPendingUsers,
  getUsers,
  rejectUser,
} from "../../../services/adminService";
import { capitalize, dateText } from "../../../utils/format";
import ReviewActions from "./ReviewActions";

const STATUS_FILTERS = ["", "PENDING", "APPROVED", "REJECTED", "DISABLED"];

// Registrations waiting for a decision, and the list of every account (with a status filter).
function AccountsTab() {
  const pending = useAsync(getPendingUsers, []);
  const [version, setVersion] = useState(0); // bumps to reload the "all accounts" list too

  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const debouncedQuery = useDebouncedValue(query);
  const users = useAsync(
    () => getUsers({ status, q: debouncedQuery, page, size: PAGE_SIZE.users }),
    [status, debouncedQuery, page, version]
  );

  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Runs one admin action, then refreshes both lists. The server's message is shown if it fails.
  const run = async (id, action) => {
    setActionError(null);
    setBusyId(id);
    try {
      await action();
      pending.reload();
      setVersion((v) => v + 1);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const pendingList = pending.data ?? [];
  const userList = users.data?.content ?? [];

  return (
    <>
      {actionError && <p className="pg-message error" role="alert" style={{ marginBottom: 14 }}>{actionError}</p>}

      <section className="pg-card">
        <h2>Waiting for approval ({pendingList.length})</h2>
        <StatusBlock isLoading={pending.isLoading && !pending.data} error={pending.error} onRetry={pending.reload} />
        {pending.data && pendingList.length === 0 && <p className="pg-empty">No registrations are waiting.</p>}
        <ul className="pg-list">
          {pendingList.map((u) => (
            <li key={u.id} className="pg-list-item">
              <div>
                <strong>{u.name}</strong>
                <small>{u.email} · registered {dateText(u.createdAt)}</small>
              </div>
              <ReviewActions
                disabled={busyId === u.id}
                onApprove={() => run(u.id, () => approveUser(u.id))}
                onReject={(reason) => run(u.id, () => rejectUser(u.id, reason))}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="pg-card">
        <h2>All accounts</h2>
        <div className="pg-filters" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <input
            type="search"
            placeholder="Search name or e-mail"
            aria-label="Search accounts"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>{s ? capitalize(s.toLowerCase()) : "Any status"}</option>
            ))}
          </select>
        </div>

        <StatusBlock isLoading={users.isLoading && !users.data} error={users.error} onRetry={users.reload} />
        {users.data && userList.length === 0 && <p className="pg-empty">No accounts match.</p>}
        <ul className="pg-list">
          {userList.map((u) => (
            <li key={u.id} className="pg-list-item">
              <div>
                <strong>
                  {u.name} <span className={`pg-badge ${u.accountStatus.toLowerCase()}`}>{capitalize(u.accountStatus.toLowerCase())}</span>{" "}
                  {u.role === "ADMIN" && <span className="pg-badge">Admin</span>}
                </strong>
                <small>{u.email} · joined {dateText(u.createdAt)}</small>
              </div>
              <div className="pg-row-actions">
                {u.accountStatus === "APPROVED" && u.role !== "ADMIN" && (
                  <button type="button" className="pg-btn danger small" disabled={busyId === u.id}
                    onClick={() => run(u.id, () => disableUser(u.id))}>
                    Disable
                  </button>
                )}
                {(u.accountStatus === "DISABLED" || u.accountStatus === "REJECTED") && (
                  <button type="button" className="pg-btn secondary small" disabled={busyId === u.id}
                    onClick={() => run(u.id, () => approveUser(u.id))}>
                    Approve
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <Pagination page={page} totalPages={users.data?.totalPages} onChange={setPage} />
      </section>
    </>
  );
}

export default AccountsTab;
