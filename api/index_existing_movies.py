"""
Skrypt do ponownego indeksowania istniejących filmów w ChromaDB
Uruchom to raz po dodaniu funkcjonalności wyszukiwania.
"""
import sqlite3
import chromadb
from chromadb.utils import embedding_functions

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Usuń starą kolekcję i stwórz nową
try:
    chroma_client.delete_collection("movies")
    print("Deleted old collection")
except:
    pass

collection = chroma_client.create_collection(
    name="movies",
    embedding_function=sentence_transformer_ef
)

def get_movie_text(movie_dict):
    """Tworzy tekst do indeksowania z danych filmu"""
    parts = [
        f"Title: {movie_dict.get('title', '')}",
        f"Director: {movie_dict.get('director', '')}",
        f"Actors: {movie_dict.get('actors', '')}",
        f"Description: {movie_dict.get('description', '')}"
    ]
    return " ".join(parts)

# Pobierz wszystkie filmy z bazy
db = sqlite3.connect('movies.db')
cursor = db.cursor()
movies = cursor.execute('SELECT * FROM movies').fetchall()

print(f"Found {len(movies)} movies to index")

# Indeksuj każdy film
for movie in movies:
    movie_dict = {
        'id': str(movie[0]),
        'title': str(movie[1]) if movie[1] else '',
        'year': str(movie[2]) if movie[2] else '',
        'actors': str(movie[3]) if len(movie) > 3 and movie[3] else '',
        'director': str(movie[4]) if len(movie) > 4 and movie[4] else '',
        'description': str(movie[5]) if len(movie) > 5 and movie[5] else ''
    }
    
    text = get_movie_text(movie_dict)
    collection.add(
        ids=[str(movie[0])],
        documents=[text],
        metadatas=[movie_dict]
    )
    print(f"Indexed movie: {movie_dict['title']}")

db.close()
print("Indexing complete!")
