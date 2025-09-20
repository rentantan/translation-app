# Translation App

A modern web application for text translation built with FastAPI (backend) and React + TypeScript (frontend). Features user authentication, real-time translation using Google Translate API, and a clean, responsive interface.

## Features

- **User Authentication**: Secure registration and login system with JWT tokens
- **Real-time Translation**: Translate text between multiple languages
- **Auto Language Detection**: Automatically detects source language
- **Modern UI**: Clean, responsive design with gradient backgrounds
- **Translation History**: Track your translation usage (backend support ready)
- **Multiple Languages**: Support for English, Japanese, French, Spanish, German, Italian, Korean, and Chinese

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for Python
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database for development
- **JWT Authentication**: Secure token-based authentication
- **Google Translate API**: Translation service via `googletrans` library
- **Passlib**: Password hashing and verification

### Frontend
- **React 19**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS-in-JS**: Inline styling for component-based design

## Project Structure

```
translation-app/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── auth.py              # Authentication utilities
│   ├── crud.py              # Database operations
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── api.ts          # API client functions
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── App.tsx         # Main application component
│   ├── package.json        # Node.js dependencies
│   └── tsconfig.json       # TypeScript configuration
├── .gitignore
├── LICENSE
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/translation-app.git
   cd translation-app
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   
   # Activate virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   # venv\Scripts\activate
   
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   source venv/bin/activate  # Activate virtual environment if not already active
   uvicorn main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```
   The web application will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Main Endpoints

- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /translate` - Text translation (requires authentication)

## Usage

1. **Register a new account** or **log in** with existing credentials
2. **Enter text** to translate in the input field
3. **Select target language** from the dropdown menu
4. **Click translate** or press Enter to get the translation
5. **View results** in the result panel below

## Configuration

### Backend Configuration

The backend uses several configurable parameters:

- **Database**: SQLite database (`app.db`) for development
- **JWT Secret**: Update `SECRET_KEY` in `auth.py` for production
- **CORS**: Currently allows all origins for development

### Frontend Configuration

- **API URL**: Currently set to `http://localhost:8000` in API calls
- **Supported Languages**: Defined in `types.ts`

## Development

### Backend Development

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Frontend Development

```bash
cd frontend
npm start
```

The application supports hot reloading for both backend and frontend during development.

## Testing

### Backend Testing
```bash
cd backend
# Example API test
curl -X POST "http://localhost:8000/translate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text":"Hello world","target_lang":"ja"}'
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Deployment

### Production Considerations

1. **Update JWT Secret**: Change the `SECRET_KEY` in `auth.py`
2. **Database**: Consider upgrading to PostgreSQL for production
3. **CORS**: Restrict allowed origins in production
4. **Environment Variables**: Use environment variables for sensitive configuration
5. **HTTPS**: Enable SSL/TLS for secure communication

### Build for Production

```bash
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Known Issues

- Translation service may have rate limits
- Long texts might timeout - consider implementing chunking
- Google Translate API requires internet connection

## Future Enhancements

- [ ] Translation history persistence
- [ ] Offline translation support
- [ ] File upload for document translation
- [ ] Speech-to-text integration
- [ ] Multiple translation provider support
- [ ] User preferences and settings
- [ ] Export translation results
- [ ] Dark/light theme toggle

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google Translate](https://translate.google.com/) for translation services
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python web framework
- [React](https://reactjs.org/) for the frontend framework
- All contributors and users of this application

## Support

If you encounter any issues or have questions, please:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information about the problem
3. Include steps to reproduce the issue

---
