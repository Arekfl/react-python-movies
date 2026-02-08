import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { toast } from 'react-toastify';

export default function MovieSearch(props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchMode, setSearchMode] = useState('text'); // Domyślnie tekstowe, semantyczne wyłączone (za dużo pamięci na render.com)

    const searchSpring = useSpring({
        from: { opacity: 0, transform: 'translateY(-10px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        config: { tension: 280, friction: 26 }
    });

    async function handleSearch(e) {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            toast.info('Wprowadź zapytanie wyszukiwania');
            return;
        }

        // Blokada wyszukiwania semantycznego
        if (searchMode === 'semantic') {
            toast.warning('🔒 Wyszukiwanie semantyczne niedostępne w wersji free (wymaga >512MB RAM)');
            return;
        }

        setIsSearching(true);
        
        try {
            const response = await fetch(`/movies/search-text?q=${encodeURIComponent(searchQuery)}`);
            
            if (response.ok) {
                const results = await response.json();
                
                if (results.length === 0) {
                    toast.info('Nie znaleziono filmów pasujących do zapytania');
                } else {
                    toast.success(`Znaleziono ${results.length} filmów`);
                    props.onSearchResults(results);
                }
            } else {
                toast.error(`Błąd wyszukiwania: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            toast.error(`Błąd połączenia: ${error.message}`);
        } finally {
            setIsSearching(false);
        }
    }

    function handleClearSearch() {
        setSearchQuery('');
        props.onClearSearch();
    }

    return (
        <animated.div style={searchSpring} className="search-container">
            <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#fff', opacity: 0.5 }}>
                        <input 
                            type="radio" 
                            value="semantic"
                            checked={searchMode === 'semantic'}
                            onChange={(e) => setSearchMode(e.target.value)}
                            style={{ marginRight: '5px' }}
                        />
                        🧠 Wyszukiwanie semantyczne 🔒
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#fff' }}>
                        <input 
                            type="radio" 
                            value="text"
                            checked={searchMode === 'text'}
                            onChange={(e) => setSearchMode(e.target.value)}
                            style={{ marginRight: '5px' }}
                        />
                        📝 Wyszukiwanie tekstowe
                    </label>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                            searchMode === 'semantic' 
                                ? "🔒 Nie dostępne w wersji free" 
                                : "Wyszukaj po tytule, reżyserze, aktorach lub opisie..."
                        }
                        style={{ flex: 1 }}
                        disabled={isSearching || searchMode === 'semantic'}
                    />
                    <button 
                        type="submit" 
                        disabled={isSearching || searchMode === 'semantic'}
                    >
                        {isSearching ? 'Szukam...' : (searchMode === 'semantic' ? '🔒 Zablokowane' : 'Szukaj 🔍')}
                    </button>
                    {props.isSearchMode && (
                        <button 
                            type="button"
                            onClick={handleClearSearch}
                            style={{ backgroundColor: '#ccc' }}
                        >
                            Pokaż wszystkie
                        </button>
                    )}
                </div>
                <p style={{ fontSize: '0.85em', color: '#fff', marginTop: '5px', marginBottom: 0 }}>
                    {searchMode === 'semantic' 
                        ? '🔒 Wyszukiwanie semantyczne niedostępne w wersji free (wymaga >512MB RAM na render.com)'
                        : '💡 Wyszukiwanie tekstowe - dopasowanie słów w tytule, reżyserze, aktorach i opisie'
                    }
                </p>
            </form>
        </animated.div>
    );
}
