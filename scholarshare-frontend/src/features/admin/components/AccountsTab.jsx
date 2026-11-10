import { useState } from "react";

import UserAvatar from "../../../components/account/UserAvatar";
import Pagination from "../../../components/pagination/Pagination";
import StatusBlock from "../../../components/StatusBlock";
import { PAGE_SIZE } from "../../../config/constants";
import { useAsync } from "../../../hooks/useAsync";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { disableUser, enableUser, getUsers } from "../../../services/adminService";
import { capitalize, dateText } from "../../../utils/format";
import Icon from "../../../components/shell/Icons";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "APPROVED", label: "Active" },
  { value: "DISABLED", label: "Disabled" },
];

// Every account (with a status filter). Students join without approval; an admin can disable or re-enable them.
function AccountsTab() {
  const [version, setVersion] = useState(0); // bumps to reload the list

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

  // Runs one admin action, then refreshes the list. The server's message is shown if it fails.
  const run = async (id, action) => {
    setActionError(null);
    setBusyId(id);
    try {
      await action();
      setVersion((v) => v + 1);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const userList = users.data?.content ?? [];

  return (
    <>
      {actionError && <p className="ui-alert" role="alert">{actionError}</p>}

      <section className="ui-card flush">
        <div className="ui-toolbar">
          <label className="ui-search">
            <Icon name="search" size={18} />
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
          </label>
          <div className="ui-chips" role="group" aria-label="Filter by status">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className={status === f.value ? "on" : ""}
                aria-pressed={status === f.value}
                onClick={() => {
                  setStatus(f.value);
                  setPage(0);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <StatusBlock isLoading={users.isLoading && !users.data} error={users.error} onRetry={users.reload} />
        {users.data && userList.length === 0 && <p className="ui-empty">No accounts match.</p>}

        {userList.length > 0 && (
          <ul className="ui-rows">
            {userList.map((u) => (
              <li key={u.id} className="ui-row">
                <UserAvatar name={u.name} pictureUrl={u.pictureUrl} size={44} />
                <div className="ui-row-main">
                  <strong>
                    {u.name} {u.role === "ADMIN" && <span className="ui-pill navy">Admin</span>}
                  </strong>
                  <small>{u.email}</small>
                </div>
                <span className="ui-row-meta">Joined {dateText(u.createdAt)}</span>
                <span className={`ui-pill ${u.accountStatus === "APPROVED" ? "green" : "red"}`}>
                  {u.accountStatus === "APPROVED" ? "Active" : capitalize(u.accountStatus.toLowerCase())}
                </span>
                <div className="ui-row-actions">
                  {u.accountStatus === "APPROVED" && u.role !== "ADMIN" && (
                    <button type="button" className="ui-btn danger sm" disabled={busyId === u.id}
                      onClick={() => run(u.id, () => disableUser(u.id))}>
                      Disable
                    </button>
                  )}
                  {u.accountStatus === "DISABLED" && (
                    <button type="button" className="ui-btn ghost sm" disabled={busyId === u.id}
                      onClick={() => run(u.id, () => enableUser(u.id))}>
                      Enable
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} totalPages={users.data?.totalPages} onChange={setPage} />
      </section>
    </>
  );
}

export default AccountsTab;
