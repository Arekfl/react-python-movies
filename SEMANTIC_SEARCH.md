# Wyszukiwarka Semantyczna Filmów

## Opis funkcjonalności

Aplikacja została rozszerzona o zaawansowaną wyszukiwarkę semantyczną opartą na bazie wektorowej ChromaDB i modelu embeddings Sentence Transformers.

## Jak to działa?

### Backend (Python/FastAPI)

1. **ChromaDB** - wektorowa baza danych przechowująca embeddingi filmów
2. **Sentence Transformers (all-MiniLM-L6-v2)** - model ML do generowania wektorów z tekstu
3. **Automatyczne indeksowanie** - każdy film jest automatycznie indeksowany przy dodawaniu/edycji

### Wyszukiwanie semantyczne

Zamiast zwykłego dopasowania słów kluczowych, wyszukiwarka rozumie **znaczenie** zapytania:

**Przykłady:**
- "akcja z helikopterami" - znajdzie filmy akcji nawet bez słowa "helikopter" w opisie
- "rodzinny dramat" - znajdzie dramaty o rodzinach na podstawie kontekstu
- "komedia romantyczna" - zrozumie gatunki i nastrój filmu

### Komponenty

**Backend API:**
- `GET /movies/search?q=<query>` - endpoint wyszukiwania
- Indeksuje: tytuł, reżyser, aktorzy, opis filmu
- Zwraca wyniki posortowane według podobieństwa

**Frontend React:**
- `MovieSearch.js` - komponent wyszukiwarki
- Animacje z react-spring
- Powiadomienia z react-toastify
- Przełączanie między wszystkimi filmami a wynikami wyszukiwania

## Instalacja

### Backend
```bash
cd api
pip install chromadb sentence-transformers
```

### Indeksowanie istniejących filmów
```bash
cd api
python index_existing_movies.py
```

## Użytkowanie

1. **Wpisz zapytanie** w pole wyszukiwania (np. "science fiction")
2. **Kliknij "Szukaj 🔍"** - algorytm znajdzie podobne filmy
3. **"Pokaż wszystkie"** - powrót do pełnej listy filmów

## Technologia

- **ChromaDB** - persystentna baza wektorowa
- **all-MiniLM-L6-v2** - lekki, szybki model embeddings (384 wymiary)
- **Cosine Similarity** - miara podobieństwa między wektorami
- **React Spring** - płynne animacje w UI

## Zalety wyszukiwania semantycznego

✅ Rozumie kontekst i znaczenie  
✅ Nie wymaga dokładnych słów kluczowych  
✅ Znajduje podobne treści nawet bez identycznych fraz  
✅ Działa w języku naturalnym  
✅ Szybkie (cached embeddings)
