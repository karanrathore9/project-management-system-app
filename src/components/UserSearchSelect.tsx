import { useEffect, useRef, useState } from 'react';
import { userApi } from '../api/userApi';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { UserBasic } from '../types';

interface Props {
  selected: UserBasic | null;
  onSelect: (user: UserBasic | null) => void;
  placeholder?: string;
}

export default function UserSearchSelect({ selected, onSelect, placeholder = 'Search by name or email…' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    userApi
      .search(q)
      .then((users) => {
        if (active) setResults(users);
      })
      .catch(() => {
        if (active) setResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  if (selected) {
    return (
      <div className="user-chip">
        <span>
          {selected.name} <span className="muted">({selected.email})</span>
        </span>
        <button type="button" className="link-btn" onClick={() => onSelect(null)}>
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="user-search">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && query.trim().length >= 2 && (
        <div className="user-search-dropdown">
          {loading && <div className="user-search-hint">Searching…</div>}
          {!loading && results.length === 0 && <div className="user-search-hint">No matches</div>}
          {!loading &&
            results.map((user) => (
              <button
                type="button"
                key={user.id}
                className="user-search-option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (blurTimeout.current) clearTimeout(blurTimeout.current);
                  onSelect(user);
                  setQuery('');
                  setResults([]);
                  setOpen(false);
                }}
              >
                <span>{user.name}</span>
                <span className="muted">{user.email}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
