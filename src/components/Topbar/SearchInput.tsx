import { useState, useRef, useEffect } from 'react';
import { IconSearch } from '@tabler/icons-react';

export default function SearchInput({ onNavigate, onSelectConteudo }: { onNavigate: any, onSelectConteudo: any }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.results || []);
          setIsOpen(true);
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    setQuery('');
    if (item.tipo === 'curso') {
      onSelectConteudo(item._id, item.titulo);
    } else if (item.tipo === 'exercicio') {
      onNavigate('exercicios'); // Simplificado, ideal seria abrir o exercicio direto
    } else {
      onNavigate('cursos'); // Simplificado
    }
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="search-input-container">
        <IconSearch size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar aulas, exercícios..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(results.length > 0) setIsOpen(true) }}
        />
        {loading && <div className="search-spinner" />}
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="search-dropdown glass-panel">
          {results.map((item, idx) => (
            <div 
              key={`${item.tipo}-${item._id}-${idx}`} 
              className="search-item"
              onClick={() => handleSelect(item)}
            >
              <span className="search-item-type">{item.tipo}</span>
              <span className="search-item-title">{item.titulo}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
