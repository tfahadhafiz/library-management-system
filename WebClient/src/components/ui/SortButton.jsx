import { ArrowUpAZ, ArrowDownAZ, ArrowUp01, ArrowDown01 } from 'lucide-react';

function SortButton({ ascending, onToggle, numeric = false }) {
  const AscIcon = numeric ? ArrowUp01 : ArrowUpAZ;
  const DescIcon = numeric ? ArrowDown01 : ArrowDownAZ;
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
      title={ascending ? 'Ascending' : 'Descending'}
    >
      {ascending ? <AscIcon size={16} /> : <DescIcon size={16} />}
    </button>
  );
}

export default SortButton;