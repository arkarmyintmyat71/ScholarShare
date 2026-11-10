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
        className="ui-reject"
        onSubmit={(event) => {
          event.preventDefault();
          onReject(reason.trim() || undefined);
        }}
      >
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={120}
          placeholder="Reason for the student (optional)"
          aria-label="Reason for rejecting"
          autoFocus
        />
        <button type="submit" className="ui-btn danger sm" disabled={disabled}>Confirm reject</button>
        <button type="button" className="ui-btn ghost sm" onClick={() => setIsRejecting(false)}>Cancel</button>
      </form>
    );
  }

  return (
    <div className="ui-row-actions">
      <button type="button" className="ui-btn sm" disabled={disabled} onClick={onApprove}>Approve</button>
      <button type="button" className="ui-btn danger sm" disabled={disabled} onClick={() => setIsRejecting(true)}>Reject</button>
    </div>
  );
}

export default ReviewActions;
