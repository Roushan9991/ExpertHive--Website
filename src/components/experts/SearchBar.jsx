import React from 'react';

export const SearchBar = ({ problemStatement, setProblemStatement }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <textarea
        value={problemStatement}
        onChange={e => setProblemStatement(e.target.value)}
        placeholder="Describe your farm problem or consultation need (e.g., Need help with paddy disease diagnosis)"
        className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface shadow-sm transition-all min-h-[60px]"
      />
    </div>
  );
};
