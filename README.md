# Digital Responsibility Ranking

A web application for ranking companies based on their digital responsibility practices.

## Setup

1. Clone the repository
2. Copy `js/config.example.js` to `js/config.js`
3. Update `js/config.js` with your Firebase configuration values:
   - FIREBASE_API_KEY
   - FIREBASE_AUTH_DOMAIN
   - FIREBASE_PROJECT_ID
   - FIREBASE_STORAGE_BUCKET
   - FIREBASE_MESSAGING_SENDER_ID
   - FIREBASE_APP_ID
   - FIREBASE_DATABASE_URL

## Development

To run the application locally:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Security Note

The `js/config.js` file contains sensitive Firebase configuration and is not tracked in git. Make sure to keep your configuration values secure and never commit them to version control. 