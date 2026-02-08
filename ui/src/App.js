import './App.css';
import {useEffect, useState} from "react";
import "milligram";
import MovieForm from "./MovieForm";
import MoviesList from "./MoviesList";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSpring, animated } from '@react-spring/web';

function App() {
    const [movies, setMovies] = useState([]);
    const [addingMovie, setAddingMovie] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
    const fetchMovies = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/movies`);
            if (response.ok) {
                const movies = await response.json();
                setMovies(movies);
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

    const buttonSpring = useSpring({
        from: { scale: 0.9, opacity: 0 },
        to: { scale: 1, opacity: 1 },
        config: { tension: 300, friction: 20 }
    });

    return (
        <div className="container">
            <h1>My favourite movies to watch</h1>
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
            {movies.length === 0
                ? <p>No movies yet. Maybe add something?</p>
                : <MoviesList movies={movies}
                              onDeleteMovie={handleDeleteMovie}
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
