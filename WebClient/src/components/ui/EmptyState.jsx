function EmptyState({ icon: Icon, message }) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-600">
        {Icon && <Icon size={40} className="mb-3 opacity-40" />}
        <p className="text-sm">{message}</p>
      </div>
    );
  }
  
  export default EmptyState;