import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export default function MovieListItem(props) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(props.movie.title);
    const [editedYear, setEditedYear] = useState(props.movie.year);
    const [editedDirector, setEditedDirector] = useState(props.movie.director || '');
    const [editedActors, setEditedActors] = useState(props.movie.actors || '');
    const [editedDescription, setEditedDescription] = useState(props.movie.description || '');

    const hoverSpring = useSpring({
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered 
            ? '0 10px 30px rgba(0, 0, 0, 0.15)' 
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        config: { tension: 300, friction: 20 }
    });

    const handleSave = () => {
        props.onUpdate(props.movie.id, {
            title: editedTitle,
            year: editedYear,
            director: editedDirector,
            actors: editedActors,
            description: editedDescription
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedTitle(props.movie.title);
        setEditedYear(props.movie.year);
        setEditedDirector(props.movie.director || '');
        setEditedActors(props.movie.actors || '');
        setEditedDescription(props.movie.description || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <animated.div
                style={hoverSpring}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={{ padding: '10px' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '5px' }}>Tytuł</label>
                        <input 
                            type="text" 
                            value={editedTitle} 
                            onChange={(e) => setEditedTitle(e.target.value)}
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '5px' }}>Rok</label>
                        <input 
                            type="text" 
                            value={editedYear} 
                            onChange={(e) => setEditedYear(e.target.value)}
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '5px' }}>Reżyser</label>
                        <input 
                            type="text" 
                            value={editedDirector} 
                            onChange={(e) => setEditedDirector(e.target.value)}
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '5px' }}>Aktorzy</label>
                        <input 
                            type="text" 
                            value={editedActors} 
                            onChange={(e) => setEditedActors(e.target.value)}
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '5px' }}>Opis</label>
                        <textarea 
                            value={editedDescription} 
                            onChange={(e) => setEditedDescription(e.target.value)}
                            style={{ width: '100%', padding: '5px', minHeight: '60px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleSave} style={{ padding: '5px 15px' }}>Zapisz</button>
                        <button onClick={handleCancel} style={{ padding: '5px 15px', backgroundColor: '#ccc' }}>Anuluj</button>
                    </div>
                </div>
            </animated.div>
        );
    }

    return (
        <animated.div
            style={hoverSpring}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ padding: '5px' }}>
                <div>
                    <strong>{props.movie.title}</strong>
                    {' '}
                    <span>({props.movie.year})</span>
                    {' '}
                    directed by {props.movie.director}
                    {' '}
                    <a onClick={() => setIsEditing(true)} style={{ cursor: 'pointer', marginRight: '10px' }}>Edit</a>
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
            </div>
        </animated.div>
    );
}
