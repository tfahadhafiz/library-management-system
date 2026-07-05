function FormField({ label, children }) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
        {children}
      </div>
    );
  }
  
  export const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all";
  
  export default FormField;