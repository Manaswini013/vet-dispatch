function SymptomList({ items = [] }) {
  if (!items.length) return <p className="text-sm text-slate-600">No symptoms recorded.</p>;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-slate-900" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default SymptomList;
