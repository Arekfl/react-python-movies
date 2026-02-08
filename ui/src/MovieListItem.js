import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export default function MovieListItem(props) {
    const [isHovered, setIsHovered] = useState(false);

    const hoverSpring = useSpring({
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered 
            ? '0 10px 30px rgba(0, 0, 0, 0.15)' 
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        config: { tension: 300, friction: 20 }
    });

    return (
        <animated.div
            style={hoverSpring}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div>
                <strong>{props.movie.title}</strong>
                {' '}
                <span>({props.movie.year})</span>
                {' '}
                directed by {props.movie.director}
                {' '}
                <a onClick={props.onDelete} style={{ cursor: 'pointer' }}>Delete</a>
            </div>
            {props.movie.actors && (
                <div style={{ fontSize: '0.9em', color: '#666', marginTop: '0.5rem' }}>
                    <strong>Aktorzy:</strong> {props.movie.actors}
                </div>
            )}
            {props.movie.description && (
                <div style={{ marginTop: '0.5rem' }}>
                    {props.movie.description}
                </div>
            )}
        </animated.div>
    );
}
