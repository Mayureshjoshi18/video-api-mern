# video-api-mern
# Online Video Editing Web API

This project provides an online video editing web API that allows users to upload, trim, merge, and share videos.

## Getting Started

### Prerequisites
- Node.js (>= 16.x)
- npm (>= 8.x)
- FFmpeg (must be installed on your system)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Mayureshjoshi18/video-api-mern.git
   cd video-api-mern
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the Project

Start the server:
```sh
npm start
```

The server will run on `http://localhost:3000`.

### Running Tests

Run end-to-end tests:
```sh
npx jest tests/e2e/__test__/video-api.e2e.test.ts
```
or 

```sh
npm test
```

## API Endpoints

### 1. Upload Video
- **Endpoint:** `POST /upload`
- **Headers:**
  ```json
  {
    "Authorization": "Bearer static-token"
  }
  ```
- **Form Data:**
  ```
  video: <file>
  ```
- **Response:**
  ```json
  {
    "videoId": "generated-video-id"
  }
  ```

### 2. Trim Video
- **Endpoint:** `POST /trim`
- **Headers:**
  ```json
  {
    "Authorization": "Bearer static-token",
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "videoId": "generated-video-id",
    "startTime": 10,
    "endTime": 30
  }
  ```
- **Response:**
  ```json
  {
    "trimmedVideoId": "trimmed-video-id"
  }
  ```

### 3. Merge Videos
- **Endpoint:** `POST /merge`
- **Headers:**
  ```json
  {
    "Authorization": "Bearer static-token",
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "videoIds": ["video1-id", "video2-id"]
  }
  ```
- **Response:**
  ```json
  {
    "mergedVideoId": "merged-video-id"
  }
  ```

### 4. Share Video
- **Endpoint:** `POST /share`
- **Headers:**
  ```json
  {
    "Authorization": "Bearer static-token",
    "Content-Type": "application/json"
  }
  ```
- **Request Body:**
  ```json
  {
    "videoId": "generated-video-id",
    "expiryTime": 3600
  }
  ```
- **Response:**
  ```json
  {
    "link": "/view/shared-link-id"
  }
  ```

### 5. View Shared Video
- **Endpoint:** `GET /view/:sharedLinkId`
- **Response:**
  ```json
  {
    "videoUrl": "https://localhost:3000/link.mp4"
  }
  ```

## Flow of Execution

1. **Router (`routes.ts`)** - Defines API endpoints and forwards requests to corresponding controllers.
2. **Controller (`controller.ts`)** - Extracts request data, calls the service layer, and handles responses.
3. **Service (`service.ts`)** - Contains business logic for video processing (upload, trim, merge, share).
4. **Database (`database.ts`)** - Executes SQL queries to store and retrieve video data.

For example, when a user shares a video:
- The request goes to `routes.ts`, which calls `shareVideoHandler` in `controller.ts`.
- The `controller.ts` extracts `videoId` and `expiryTime` and calls `shareVideo` from `service.ts`.
- `service.ts` validates inputs, queries the database to check if the video exists, and generates a shareable link.
- The generated link is saved in `shared_links` table, and a response is returned to the user.

## License
MIT

