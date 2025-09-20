# Translation App

A modern web application for text translation built with FastAPI (backend) and React + TypeScript (frontend). Features user authentication, real-time translation using Google Translate API, comprehensive translation history management, and a clean, responsive interface.

## Features

- **User Authentication**: Secure registration and login system with JWT tokens
- **Real-time Translation**: Translate text between multiple languages with auto-detection
- **Translation History Management**: Automatic saving of all translations with full CRUD operations
- **History Reuse**: One-click restoration of previous translations for editing or retranslation
- **User Privacy**: Translation history is user-specific and securely stored with authentication
- **Auto Language Detection**: Automatically detects source language and saves it with translation
- **Modern UI**: Clean, responsive design with gradient backgrounds and modal interfaces
- **Multiple Languages**: Support for English, Japanese, French, Spanish, German, Italian, Korean, and Chinese

## Translation History Features

### Automatic History Saving
Every translation is automatically saved to the database with:
- Timestamp of translation
- Detected source language
- Target language selection
- Original text and translated result
- User association for privacy

### History Management Interface
- **View History**: Click the "履歴" (History) button to open the history modal
- **Reuse Translations**: Click any history item to restore it to the input fields
- **Individual Delete**: Use the "×" button on each entry to delete specific translations
- **Bulk Delete**: Use "全削除" (Clear All) button to remove all history
- **Search & Filter**: History is displayed in chronological order (most recent first)

### History API Endpoints
```
GET    /translations/history           # Retrieve user's translation history
DELETE /translations/history/{id}      # Delete specific translation
DELETE /translations/history           # Clear all user's translation history
```

### Database Schema
Translation history uses the following database structure:
```sql
CREATE TABLE translations (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    source_text TEXT,
    translated_text TEXT,
    source_lang TEXT,
    target_lang TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Privacy & Security
- All history data requires user authentication
- Users can only access their own translation records
- Complete user control over data deletion
- No client-side storage of sensitive translation data
- Secure JWT-based API access

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for Python
- **SQLAlchemy**: SQL toolkit and ORM with SQLite database
- **JWT Authentication**: Secure token-based user authentication
- **Google Translate API**: Translation service via `googletrans` library
- **Passlib**: Password hashing and verification

### Frontend
- **React 19**: Modern React with hooks and functional components
- **TypeScript**: Type-safe JavaScript development
- **React Router**: Client-side routing for SPA navigation
- **Modal Components**: Custom translation history interface
- **CSS-in-JS**: Inline styling for component-based design

## Getting Started

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd translation-app
   ```

2. **Backend setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload --port 8000
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

The application will be available at `http://localhost:3000` with the API at `http://localhost:8000`.

## Usage

1. **Register** a new account or **login** with existing credentials
2. **Enter text** to translate in the input field
3. **Select target language** from the dropdown menu
4. **Click translate** or press Enter to get the translation
5. **View translation history** by clicking the "履歴" button
6. **Reuse previous translations** by clicking on any history item
7. **Manage your data** with individual or bulk delete options

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.