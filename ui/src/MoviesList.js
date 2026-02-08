import MovieListItem from "./MovieListItem";
import { useTransition, animated } from '@react-spring/web';

export default function MoviesList(props) {
    const transitions = useTransition(props.movies, {
        from: { opacity: 0, transform: 'translateX(-40px)' },
        enter: { opacity: 1, transform: 'translateX(0px)' },
        leave: { opacity: 0, transform: 'translateX(40px)' },
        keys: movie => movie.id || movie.title,
        trail: 100
    });

    return <div>
        <h2>Movies</h2>
        <ul className="movies-list">
            {transitions((style, movie) => (
                <animated.li key={movie.id || movie.title} style={style}>
                    <MovieListItem movie={movie} onDelete={() => props.onDeleteMovie(movie)}/>
                </animated.li>
            ))}
        </ul>
    </div>;
}
