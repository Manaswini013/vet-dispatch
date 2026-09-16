function ErrorState({ title, message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
      <div className="text-sm font-bold uppercase tracking-[0.14em]">{title}</div>
      <p className="mt-2 text-sm text-red-700/90">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500">
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;
