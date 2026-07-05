function SelectFilter({ value, onChange, children }) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all"
      >
        {children}
      </select>
    );
  }
  
  export default SelectFilter;