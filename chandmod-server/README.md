# ChandMod APK Server

Deploy this on chandtricker.qzz.io

## Setup

```bash
npm install
npm start
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Home page |
| GET | /health | Server health check |
| POST | /apk/generate | Generate APK record |
| GET | /apk/:id.apk | APK download page |
| GET | /apk/:id | Get APK info (JSON) |
| GET | /apk/user/:userId | Get user APK history |
| DELETE | /apk/:id | Delete APK record |
