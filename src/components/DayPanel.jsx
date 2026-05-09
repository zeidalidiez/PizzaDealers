import { MAX_DAYS, LOAN_AMOUNT, LOAN_PENALTY } from '../data/gameData.js';

export default function DayPanel({ day, cash, totalWeight, maxWeight, loan, onSkip, onTakeLoan, onRepayLoan, disabled }) {
  const isLastDay = day === MAX_DAYS;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dealer-black bg-dealer-dark p-4">
      <div className="flex-1">
        <div className="text-sm text-gray-400">Day</div>
        <div className={`text-2xl font-bold ${isLastDay ? 'text-dealer-red' : 'text-white'}`}>
          {day} / {MAX_DAYS}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-400">Cash</div>
        <div className="text-2xl font-bold text-dealer-orange">${cash.toLocaleString()}</div>
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-400">Weight</div>
        <div className="text-lg font-semibold text-white">
          {totalWeight} / {maxWeight}
        </div>
      </div>
      <div className="flex gap-2">
        {!loan.active && !loan.repaid && (
          <button
            disabled={disabled}
            onClick={onTakeLoan}
            className="rounded-lg bg-dealer-orange px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            Loan +${LOAN_AMOUNT}
          </button>
        )}
        {loan.active && !loan.repaid && (
          <button
            disabled={disabled || cash < LOAN_AMOUNT}
            onClick={onRepayLoan}
            className="rounded-lg bg-dealer-red px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            Repay ${LOAN_AMOUNT}
          </button>
        )}
        <button
          disabled={disabled}
          onClick={onSkip}
          className="rounded-lg border border-gray-600 px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700 disabled:opacity-50"
        >
          Skip Day
        </button>
      </div>
      {loan.active && !loan.repaid && (
        <div className="w-full text-xs text-dealer-red">
          Loan active! Unpaid penalty at end: -${LOAN_PENALTY}
        </div>
      )}
    </div>
  );
}
