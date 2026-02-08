from fastapi import FastAPI, Body, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Any, Optional
import sqlite3
import chromadb
from chromadb.utils import embedding_functions


class Movie(BaseModel):
    title: str
    year: str
    director: str = ""
    actors: str = ""
    description: str = ""

app = FastAPI()

# Lazy initialization of ChromaDB - will be initialized on first use
chroma_client = None
collection = None

def get_chroma_collection():
    """Lazy initialization of ChromaDB collection"""
    global chroma_client, collection
    if collection is None:
        chroma_client = chromadb.PersistentClient(path="./chroma_db")
        sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        collection = chroma_client.get_or_create_collection(
            name="movies",
            embedding_function=sentence_transformer_ef
        )
    return collection

def get_movie_text(movie_dict):
    """Tworzy tekst do indeksowania z danych filmu"""
    parts = [
        f"Title: {movie_dict.get('title', '')}",
        f"Director: {movie_dict.get('director', '')}",
        f"Actors: {movie_dict.get('actors', '')}",
        f"Description: {movie_dict.get('description', '')}"
    ]
    return " ".join(parts)

def index_movie(movie_id, movie_dict):
    """Dodaje lub aktualizuje film w indeksie wektorowym"""
    try:
        # Upewnij się, że wszystkie wartości są stringami (ChromaDB nie akceptuje None)
        clean_dict = {
            'id': str(movie_id),
            'title': str(movie_dict.get('title', '')),
            'year': str(movie_dict.get('year', '')),
            'actors': str(movie_dict.get('actors', '')),
            'director': str(movie_dict.get('director', '')),
            'description': str(movie_dict.get('description', ''))
        }
        text = get_movie_text(clean_dict)
        coll = get_chroma_collection()
        coll.upsert(
            ids=[str(movie_id)],
            documents=[text],
            metadatas=[clean_dict]
        )
    except Exception as e:
        print(f"Error indexing movie {movie_id}: {e}")

def delete_from_index(movie_id):
    """Usuwa film z indeksu wektorowego"""
    try:
        coll = get_chroma_collection()
        coll.delete(ids=[str(movie_id)])
    except Exception as e:
        print(f"Error deleting movie {movie_id} from index: {e}")

app.mount("/static", StaticFiles(directory="../ui/build/static", check_dir=False), name="static")

@app.get("/")
def serve_react_app():
   return FileResponse("../ui/build/index.html")

@app.get('/movies')
def get_movies():  # put application's code here
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    movies = cursor.execute('SELECT * FROM movies')

    output = []
    for movie in movies:
         movie_dict = {
             'id': movie[0], 
             'title': movie[1], 
             'year': movie[2], 
             'actors': movie[3] if len(movie) > 3 else '',
             'director': movie[4] if len(movie) > 4 else '',
             'description': movie[5] if len(movie) > 5 else ''
         }
         output.append(movie_dict)
    return output

@app.get('/movies/search')
def search_movies(q: str = Query(..., description="Query for semantic search")):
    """Wyszukiwanie semantyczne filmów używając ChromaDB"""
    try:
        coll = get_chroma_collection()
        results = coll.query(
            query_texts=[q],
            n_results=10
        )
        
        if not results['ids'] or not results['ids'][0]:
            return []
        
        # Pobierz pełne dane z bazy SQL
        db = sqlite3.connect('movies.db')
        cursor = db.cursor()
        
        output = []
        for movie_id, distance in zip(results['ids'][0], results['distances'][0]):
            movie = cursor.execute(
                "SELECT * FROM movies WHERE id = ?", (int(movie_id),)
            ).fetchone()
            
            if movie:
                movie_dict = {
                    'id': movie[0],
                    'title': movie[1],
                    'year': movie[2],
                    'actors': movie[3] if len(movie) > 3 else '',
                    'director': movie[4] if len(movie) > 4 else '',
                    'description': movie[5] if len(movie) > 5 else '',
                    'similarity': 1 - distance  # ChromaDB zwraca distance, więc konwertujemy na similarity
                }
                output.append(movie_dict)
        
        db.close()
        return output
    except Exception as e:
        return {"error": str(e), "results": []}

@app.get('/movies/search-text')
def search_movies_text(q: str = Query(..., description="Query for text search")):
    """Zwykłe wyszukiwanie tekstowe filmów (SQL LIKE)"""
    try:
        db = sqlite3.connect('movies.db')
        cursor = db.cursor()
        
        # Wyszukiwanie w tytule, reżyserze, aktorach i opisie
        search_pattern = f"%{q}%"
        movies = cursor.execute(
            """SELECT * FROM movies 
               WHERE title LIKE ? 
               OR director LIKE ? 
               OR actors LIKE ? 
               OR description LIKE ?
               LIMIT 50""",
            (search_pattern, search_pattern, search_pattern, search_pattern)
        ).fetchall()
        
        output = []
        for movie in movies:
            movie_dict = {
                'id': movie[0],
                'title': movie[1],
                'year': movie[2],
                'actors': movie[3] if len(movie) > 3 else '',
                'director': movie[4] if len(movie) > 4 else '',
                'description': movie[5] if len(movie) > 5 else ''
            }
            output.append(movie_dict)
        
        db.close()
        return output
    except Exception as e:
        return {"error": str(e), "results": []}

@app.get('/movies/{movie_id}')
def get_single_movie(movie_id:int):  # put application's code here
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    movie = cursor.execute(f"SELECT * FROM movies WHERE id={movie_id}").fetchone()
    if movie is None:
        return {'message': "Movie not found"}
    return {
        'title': movie[1], 
        'year': movie[2], 
        'actors': movie[3] if len(movie) > 3 else '',
        'director': movie[4] if len(movie) > 4 else '',
        'description': movie[5] if len(movie) > 5 else ''
    }

@app.post("/movies")
def add_movie(movie: Movie):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO movies (title, year, actors, director, description) VALUES (?, ?, ?, ?, ?)",
        (movie.title, movie.year, movie.actors, movie.director, movie.description)
    )
    db.commit()
    movie_id = cursor.lastrowid
    
    # Indeksuj film w ChromaDB
    movie_dict = {
        'id': movie_id,
        'title': movie.title,
        'year': movie.year,
        'actors': movie.actors,
        'director': movie.director,
        'description': movie.description
    }
    index_movie(movie_id, movie_dict)
    
    return {
        "message": f"Movie added with id = {cursor.lastrowid} added successfully",
        "id": cursor.lastrowid}

@app.put("/movies/{movie_id}")
def update_movie(movie_id:int, params: dict[str, Any]):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute(
    "UPDATE movies SET title = ?, year = ?, actors = ?, director = ?, description = ? WHERE id = ?",
    (params.get('title'), params.get('year'), params.get('actors', ''), 
     params.get('director', ''), params.get('description', ''), movie_id)
    )
    db.commit()
    if cursor.rowcount == 0:
        return {"message": f"Movie with id = {movie_id} not found"}
    
    # Aktualizuj w ChromaDB
    movie_dict = {
        'id': movie_id,
        'title': params.get('title', ''),
        'year': params.get('year', ''),
        'actors': params.get('actors', ''),
        'director': params.get('director', ''),
        'description': params.get('description', '')
    }
    index_movie(movie_id, movie_dict)
    
    return {"message": f"Movie with id = {cursor.lastrowid} updated successfully"}

@app.delete("/movies/{movie_id}")
def delete_movie(movie_id:int):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute("DELETE FROM movies WHERE id = ?", (movie_id,))
    db.commit()
    if cursor.rowcount == 0:
        return {"message": f"Movie with id = {movie_id} not found"}
    
    # Usuń z ChromaDB
    delete_from_index(movie_id)
    
    return {"message": f"Movie with id = {movie_id} deleted successfully"}

@app.delete("/movies")
def delete_movies(movie_id:int):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute("DELETE FROM movies")
    db.commit()
    return {"message": f"Deleted {cursor.rowcount} movies"}


# if __name__ == '__main__':
#     app.run()
