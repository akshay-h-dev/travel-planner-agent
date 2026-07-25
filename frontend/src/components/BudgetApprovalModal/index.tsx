import React, { useState, useEffect } from "react";
import { useTrip } from "../../context/TripContext";

/**
 * BudgetApprovalModal
 *
 * Displays a full-screen modal when the LangGraph agent determines
 * that the trip cost exceeds the user's budget and pauses (HITL interrupt).
 * The user can approve the required budget increase or decline to force
 * the agent into strict budget mode.
 */
const BudgetApprovalModal: React.FC = () => {
  const { budgetApprovalRequest, resumeTrip, isGenerating } = useTrip();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (budgetApprovalRequest) {
      // Small delay so the modal animates in cleanly
      const t = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
    }
  }, [budgetApprovalRequest]);

  if (!budgetApprovalRequest) return null;

  const { requiredBudget, originalBudget, message } = budgetApprovalRequest;
  const difference = requiredBudget - originalBudget;

  const fmt = (n: number) =>
    "₹" + Math.round(n).toLocaleString("en-IN");

  const handleApprove = () => resumeTrip(true);
  const handleDecline = () => resumeTrip(false);

  return (
    <div
      className={`budget-modal-overlay ${isVisible ? "budget-modal-overlay--visible" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-modal-title"
    >
      <div className={`budget-modal ${isVisible ? "budget-modal--visible" : ""}`}>
        {/* Header */}
        <div className="budget-modal__header">
          <div className="budget-modal__icon-wrap">
            <svg
              className="budget-modal__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 id="budget-modal-title" className="budget-modal__title">
            Budget Adjustment Required
          </h2>
          <p className="budget-modal__subtitle">
            Your AI travel agent needs your approval to continue
          </p>
        </div>

        {/* Budget comparison */}
        <div className="budget-modal__comparison">
          <div className="budget-modal__budget-item budget-modal__budget-item--original">
            <span className="budget-modal__budget-label">Your Budget</span>
            <span className="budget-modal__budget-amount">{fmt(originalBudget)}</span>
          </div>
          <div className="budget-modal__arrow" aria-hidden="true">→</div>
          <div className="budget-modal__budget-item budget-modal__budget-item--required">
            <span className="budget-modal__budget-label">Trip Cost</span>
            <span className="budget-modal__budget-amount">{fmt(requiredBudget)}</span>
          </div>
        </div>

        <p className="budget-modal__difference">
          Additional {fmt(difference)} needed
        </p>

        {/* Agent message */}
        <div className="budget-modal__message">
          <p>{message}</p>
        </div>

        {/* Agent status indicator */}
        <div className="budget-modal__agent-status">
          <span className="budget-modal__agent-dot" aria-hidden="true" />
          <span>AI Agent is paused and waiting for your decision</span>
        </div>

        {/* Action buttons */}
        <div className="budget-modal__actions">
          <button
            id="budget-modal-decline"
            className="budget-modal__btn budget-modal__btn--decline"
            onClick={handleDecline}
            disabled={isGenerating}
            aria-label={`Decline budget increase and plan within ${fmt(originalBudget)}`}
          >
            {isGenerating ? (
              <span className="budget-modal__spinner" aria-hidden="true" />
            ) : null}
            No, keep my budget
            <span className="budget-modal__btn-sub">
              Agent will plan strictly within {fmt(originalBudget)}
            </span>
          </button>

          <button
            id="budget-modal-approve"
            className="budget-modal__btn budget-modal__btn--approve"
            onClick={handleApprove}
            disabled={isGenerating}
            aria-label={`Approve budget increase to ${fmt(requiredBudget)}`}
          >
            {isGenerating ? (
              <span className="budget-modal__spinner" aria-hidden="true" />
            ) : null}
            Yes, increase budget
            <span className="budget-modal__btn-sub">
              New budget: {fmt(requiredBudget)}
            </span>
          </button>
        </div>

        {isGenerating && (
          <p className="budget-modal__loading-text" aria-live="polite">
            Agent is replanning your trip…
          </p>
        )}
      </div>
    </div>
  );
};

export default BudgetApprovalModal;
