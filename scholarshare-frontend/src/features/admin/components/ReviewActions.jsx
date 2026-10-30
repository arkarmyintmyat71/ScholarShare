import { useState } from "react";

// Approve / Reject buttons for one item. Reject asks for an optional short reason first;
// the reason is sent to the student in their notification.
//   onApprove()   onReject(reason)   both return a promise; `disabled` blocks double clicks.
function ReviewActions({ onApprove, onReject, disabled }) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (isRejecting) {
    return (
      <form
        className="pg-row-actions"
        onSubmit={(event) => {
          event.preventDefault();
          onReject(reason.trim() || undefined);
        }}
      >
        <input
          className="pg-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={120}
          placeholder="Reason (optional)"
          aria-label="Reason for rejecting"
          autoFocus
          style={{ minHeight: 34, padding: "4px 10px", border: "1px solid var(--line)", borderRadius: 10, font: "inherit" }}
        />
        <button type="submit" className="pg-btn danger small" disabled={disabled}>
          Confirm reject
        </button>
        <button type="button" className="pg-btn secondary small" onClick={() => setIsRejecting(false)}>
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="pg-row-actions">
      <button type="button" className="pg-btn small" disabled={disabled} onClick={onApprove}>
        Approve
      </button>
      <button type="button" className="pg-btn danger small" disabled={disabled} onClick={() => setIsRejecting(true)}>
        Reject
      </button>
    </div>
  );
}

export default ReviewActions;
