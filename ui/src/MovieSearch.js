import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { toast } from 'react-toastify';

export default function MovieSearch(props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchMode, setSearchMode] = useState('semantic'); // 'semantic' lub 'text'

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

        setIsSearching(true);
        
        try {
            const endpoint = searchMode === 'semantic' ? '/movies/search' : '/movies/search-text';
            const response = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}`);
            
            if (response.ok) {
                const results = await response.json();
                
                if (results.length === 0) {
                    toast.info('Nie znaleziono filmów pasujących do zapytania');
                } else {
                    const modeText = searchMode === 'semantic' ? 'semantycznie' : 'tekstowo';
                    toast.success(`Znaleziono ${results.length} filmów (${modeText})`);
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
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#fff' }}>
                        <input 
                            type="radio" 
                            value="semantic"
                            checked={searchMode === 'semantic'}
                            onChange={(e) => setSearchMode(e.target.value)}
                            style={{ marginRight: '5px' }}
                        />
                        🧠 Wyszukiwanie semantyczne
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
                                ? "Wyszukaj semantycznie (np. 'akcja z helikopterami', 'dramat o rodzinie')..." 
                                : "Wyszukaj po tytule, reżyserze, aktorach lub opisie..."
                        }
                        style={{ flex: 1 }}
                        disabled={isSearching}
                    />
                    <button 
                        type="submit" 
                        disabled={isSearching}
                    >
                        {isSearching ? 'Szukam...' : 'Szukaj 🔍'}
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
                        ? '💡 Wyszukiwarka semantyczna - znajdzie filmy na podstawie znaczenia, nie tylko słów kluczowych'
                        : '💡 Wyszukiwanie tekstowe - dokładne dopasowanie słów w tytule, reżyserze, aktorach i opisie'
                    }
                </p>
            </form>
        </animated.div>
    );
}
