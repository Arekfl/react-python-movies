import './App.css';
import {useEffect, useState} from "react";
import "milligram";
import MovieForm from "./MovieForm";
import MoviesList from "./MoviesList";
import MovieSearch from "./MovieSearch";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSpring, animated } from '@react-spring/web';

function App() {
    const [movies, setMovies] = useState([]);
    const [displayedMovies, setDisplayedMovies] = useState([]);
    const [addingMovie, setAddingMovie] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);

    useEffect(() => {
    const fetchMovies = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/movies`);
            if (response.ok) {
                const movies = await response.json();
                setMovies(movies);
                setDisplayedMovies(movies);
            } else {
                toast.error(`Błąd przy pobieraniu filmów: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            toast.error(`Błąd połączenia z serwerem: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    fetchMovies();
}, []);

    async function handleAddMovie(movie) {
    setIsLoading(true);
    try {
        const response = await fetch('/movies', {
            method: 'POST',
            body: JSON.stringify(movie),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const newMovie = await response.json();
            movie.id = newMovie.id;
            setMovies([...movies, movie]);
            setDisplayedMovies([...movies, movie]);
            setAddingMovie(false);
            toast.success('Film został dodany pomyślnie!');
        } else {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.detail || `${response.status} ${response.statusText}`;
            toast.error(`Błąd przy dodawaniu filmu: ${errorMessage}`);
        }
    } catch (error) {
        toast.error(`Błąd połączenia z serwerem: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
    }

    async function handleUpdateMovie(movieId, updatedData) {
        setIsLoading(true);
        try {
            const response = await fetch(`/movies/${movieId}`, {
                method: 'PUT',
                body: JSON.stringify(updatedData),
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const updatedMovies = movies.map(movie => 
                    movie.id === movieId ? { ...movie, ...updatedData } : movie
                );
                setMovies(updatedMovies);
                
                // Aktualizuj również displayedMovies aby zmiany były widoczne natychmiast
                const updatedDisplayedMovies = displayedMovies.map(movie => 
                    movie.id === movieId ? { ...movie, ...updatedData } : movie
                );
                setDisplayedMovies(updatedDisplayedMovies);
                
                toast.success('Film został zaktualizowany pomyślnie!');
            } else {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.detail || `${response.status} ${response.statusText}`;
                toast.error(`Błąd przy aktualizacji filmu: ${errorMessage}`);
            }
        } catch (error) {
            toast.error(`Błąd połączenia z serwerem: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    function handleDeleteMovie(movie) {
        const ConfirmToast = ({ closeToast }) => (
            <div>
                <p style={{ marginBottom: '10px' }}>
                    Czy na pewno chcesz usunąć film "<strong>{movie.title}</strong>"?
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        style={{ padding: '5px 15px', cursor: 'pointer' }}
                        onClick={async () => {
                            closeToast();
                            setIsDeleting(true);
                            try {
                                const response = await fetch(`/movies/${movie.id}`, {
                                    method: 'DELETE',
                                });
                                if (response.ok) {
                                    const nextMovies = movies.filter(m => m !== movie);
                                    setMovies(nextMovies);
                                    setDisplayedMovies(nextMovies);
                                    toast.success('Film został usunięty pomyślnie!');
                                } else {
                                    toast.error(`Błąd przy usuwaniu filmu: ${response.status} ${response.statusText}`);
                                }
                            } catch (error) {
                                toast.error(`Błąd połączenia z serwerem: ${error.message}`);
                            } finally {
                                setIsDeleting(false);
                            }
                        }}
                    >
                        Tak, usuń
                    </button>
                    <button
                        style={{ padding: '5px 15px', cursor: 'pointer', backgroundColor: '#ccc' }}
                        onClick={closeToast}
                    >
                        Anuluj
                    </button>
                </div>
            </div>
        );

        toast.warn(ConfirmToast, {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false,
        });
    }

    function handleSearchResults(results) {
        setDisplayedMovies(results);
        setIsSearchMode(true);
    }

    function handleClearSearch() {
        setDisplayedMovies(movies);
        setIsSearchMode(false);
    }

    const buttonSpring = useSpring({
        from: { scale: 0.9, opacity: 0 },
        to: { scale: 1, opacity: 1 },
        config: { tension: 300, friction: 20 }
    });

    return (
        <div className="container">
            <h1>My favourite movies to watch</h1>
            
            <MovieSearch 
                onSearchResults={handleSearchResults}
                onClearSearch={handleClearSearch}
                isSearchMode={isSearchMode}
            />
            
            {(isLoading || isDeleting) && (
                <div className="loader-overlay">
                    <div className="lds-ring">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            )}
            {displayedMovies.length === 0
                ? <p>No movies yet. Maybe add something?</p>
                : <MoviesList movies={displayedMovies}
                              onDeleteMovie={handleDeleteMovie}
                              onUpdateMovie={handleUpdateMovie}
                />}
            {addingMovie
                ? <MovieForm onMovieSubmit={handleAddMovie}
                             buttonLabel="Add a movie"
                />
                : <animated.button 
                    style={buttonSpring}
                    onClick={() => setAddingMovie(true)}
                  >
                    Add a movie
                  </animated.button>}
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}

export default App;
