# NEURAFIELD QUANTUM - API Documentation

**Base URL:** `http://localhost:5000/api`

**Version:** 1.0.0

---

## 🔐 Authentication

All API requests (except auth endpoints) require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Register
```http
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "..." },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

---

## 🎬 AI Generation

### Generate Video
```http
POST /api/generate/video
```

**Body:**
```json
{
  "prompt": "A beautiful sunset over the ocean",
  "provider": "kling-2.6", // "kling" | "kling-2.6" | "runway" | "runway-gen2" | "runway-gen3" | "replicate-zeroscope" | "replicate-animatediff"
  "options": {
    "duration": 5, // 5 or 10 for Kling
    "resolution": "1080p", // "720p" | "1080p" | "4k"
    "fps": 30,
    "mode": "pro", // "standard" | "pro" (Kling only)
    "aspectRatio": "16:9", // "16:9" | "9:16" | "1:1" (Kling only)
    "negativePrompt": "blurry, low quality", // (Kling only)
    "seed": 42 // (Kling only)
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job_123",
      "status": "PENDING",
      "type": "VIDEO",
      "prompt": "...",
      "createdAt": "2026-01-02T..."
    }
  },
  "message": "Video generation started"
}
```

**Credits Cost:** 20 credits

### Generate Image
```http
POST /api/generate/image
```

**Body:**
```json
{
  "prompt": "A futuristic cityscape",
  "provider": "dalle", // "dalle" | "replicate-sdxl" | "replicate-flux"
  "options": {
    "width": 1024,
    "height": 1024,
    "quality": "hd", // "standard" | "hd"
    "style": "vivid" // "vivid" | "natural"
  }
}
```

**Credits Cost:** 5 credits

### Image to Video
```http
POST /api/generate/image-to-video
```

**Body:**
```json
{
  "imageUrl": "https://...",
  "prompt": "Add motion to this image",
  "options": {}
}
```

**Credits Cost:** 25 credits

### Video to Video
```http
POST /api/generate/video-to-video
```

**Body:**
```json
{
  "videoUrl": "https://...",
  "prompt": "Transform to anime style",
  "style": "anime",
  "options": {}
}
```

**Credits Cost:** 30 credits

### Upscale Image
```http
POST /api/generate/upscale
```

**Body:**
```json
{
  "imageUrl": "https://...",
  "scale": 4 // 2 | 4
}
```

**Credits Cost:** 10 credits

### Remove Background
```http
POST /api/generate/remove-background
```

**Body:**
```json
{
  "imageUrl": "https://..."
}
```

**Credits Cost:** 5 credits

### Generate Music
```http
POST /api/generate/music
```

**Body:**
```json
{
  "prompt": "Upbeat electronic music",
  "duration": 8,
  "temperature": 1.0
}
```

**Credits Cost:** 15 credits

### Enhance Prompt
```http
POST /api/generate/enhance-prompt
```

**Body:**
```json
{
  "prompt": "sunset",
  "provider": "claude" // "claude" | "gpt4" | "gemini"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original": "sunset",
    "enhanced": "A breathtaking cinematic sunset over a calm ocean..."
  }
}
```

**Credits Cost:** FREE

### Generate Script
```http
POST /api/generate/script
```

**Body:**
```json
{
  "concept": "Tech startup founder journey",
  "format": "storyboard", // "screenplay" | "storyboard" | "shot-list"
  "duration": 30,
  "provider": "claude" // "claude" | "gemini"
}
```

**Credits Cost:** FREE

### Generate Storyboard
```http
POST /api/generate/storyboard
```

**Body:**
```json
{
  "concept": "Product launch video",
  "scenes": 6
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "concept": "...",
    "scenes": [
      {
        "sceneNumber": 1,
        "description": "...",
        "cameraAngle": "Wide shot",
        "duration": 5,
        "prompt": "..."
      }
    ]
  }
}
```

**Credits Cost:** FREE

### List Available Models
```http
GET /api/generate/models
```

**Response:**
```json
{
  "success": true,
  "data": {
    "models": {
      "text": [...],
      "image": [...],
      "video": [...],
      "audio": [...]
    }
  }
}
```

---

## 🎞️ Video Editing

### Upload Video
```http
POST /api/videos/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `video`: Video file (max 500MB)

### Transcode Video
```http
POST /api/videos/:id/transcode
```

**Body:**
```json
{
  "format": "mp4",
  "resolution": "1080p",
  "fps": 30,
  "bitrate": "5000k"
}
```

### Trim Video
```http
POST /api/videos/:id/trim
```

**Body:**
```json
{
  "startTime": 10,
  "duration": 30
}
```

### Add Audio to Video
```http
POST /api/videos/:id/add-audio
```

**Body:**
```json
{
  "audioUrl": "https://...",
  "audioVolume": 1.0,
  "videoVolume": 0.5,
  "fadeIn": 2,
  "fadeOut": 2
}
```

### Add Text Overlay
```http
POST /api/videos/:id/add-text
```

**Body:**
```json
{
  "text": "Subscribe!",
  "x": 10,
  "y": 10,
  "fontSize": 48,
  "fontColor": "white",
  "startTime": 0,
  "duration": 5
}
```

### Add Watermark
```http
POST /api/videos/:id/add-watermark
```

**Body:**
```json
{
  "watermarkUrl": "https://...",
  "position": "bottom-right", // "top-left" | "top-right" | "bottom-left" | "bottom-right"
  "opacity": 0.5
}
```

### Apply Filters
```http
POST /api/videos/:id/filters
```

**Body:**
```json
{
  "filters": {
    "brightness": 0.2,
    "contrast": 0.1,
    "saturation": 0.5,
    "blur": 2,
    "sharpen": true,
    "grayscale": false,
    "vignette": true
  }
}
```

### Change Speed
```http
POST /api/videos/:id/speed
```

**Body:**
```json
{
  "speed": 2.0 // 0.5 = half speed, 2 = double speed
}
```

### Concatenate Videos
```http
POST /api/videos/concatenate
```

**Body:**
```json
{
  "videoPaths": [
    "path/to/video1.mp4",
    "path/to/video2.mp4"
  ]
}
```

### Generate Thumbnail
```http
POST /api/videos/:id/thumbnail
```

**Body:**
```json
{
  "timeInSeconds": 1
}
```

### Convert to GIF
```http
POST /api/videos/:id/convert-gif
```

**Body:**
```json
{
  "fps": 15,
  "width": 480,
  "startTime": 0,
  "duration": 5
}
```

### Create Video from Images
```http
POST /api/videos/create-from-images
```

**Body:**
```json
{
  "imagePaths": ["path1.jpg", "path2.jpg"],
  "fps": 30,
  "duration": 3,
  "transition": "fade" // "fade" | "dissolve" | "none"
}
```

---

## 📁 Project Management

### Get All Projects
```http
GET /api/projects?page=1&limit=20
```

### Create Project
```http
POST /api/projects
```

**Body:**
```json
{
  "name": "My Video Project",
  "description": "Product launch video"
}
```

### Get Project
```http
GET /api/projects/:id
```

### Update Project
```http
PATCH /api/projects/:id
```

**Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Project
```http
DELETE /api/projects/:id
```

### Duplicate Project
```http
POST /api/projects/:id/duplicate
```

### Get Project Jobs
```http
GET /api/projects/:id/jobs
```

### Get Project Assets
```http
GET /api/projects/:id/assets
```

---

## 📦 Asset Management

### Get All Assets
```http
GET /api/assets
```

### Upload Asset
```http
POST /api/assets/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Image/Video/Audio file

### Get Asset
```http
GET /api/assets/:id
```

### Delete Asset
```http
DELETE /api/assets/:id
```

### Update Asset
```http
PATCH /api/assets/:id
```

**Body:**
```json
{
  "name": "New name",
  "tags": ["tag1", "tag2"]
}
```

### Get Download URL
```http
GET /api/assets/:id/download
```

---

## 👤 User

### Get Profile
```http
GET /api/users/me
```

### Update Profile
```http
PATCH /api/users/me
```

**Body:**
```json
{
  "name": "New Name",
  "avatar": "https://..."
}
```

### Get Credits
```http
GET /api/users/me/credits
```

**Response:**
```json
{
  "success": true,
  "data": {
    "credits": 100,
    "plan": "PRO"
  }
}
```

### Get Usage Statistics
```http
GET /api/users/me/usage
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalJobs": 50,
    "completedJobs": 45,
    "failedJobs": 3,
    "pendingJobs": 2
  }
}
```

### Get All Jobs
```http
GET /api/users/me/jobs?page=1&limit=20&status=COMPLETED
```

### Get Job Status
```http
GET /api/users/me/jobs/:jobId
```

---

## 🔌 WebSocket Events

Connect to: `ws://localhost:5000`

### Events from Server

**job:created**
```json
{
  "jobId": "job_123"
}
```

**job:processing**
```json
{
  "jobId": "job_123"
}
```

**job:completed**
```json
{
  "jobId": "job_123",
  "outputUrl": "https://..."
}
```

**job:failed**
```json
{
  "jobId": "job_123",
  "error": "Error message"
}
```

### Events to Server

**join-project**
```json
{
  "projectId": "project_123"
}
```

**leave-project**
```json
{
  "projectId": "project_123"
}
```

---

## 💳 Credit Costs

| Operation | Credits |
|-----------|---------|
| Video Generation | 20 |
| Image Generation | 5 |
| Image-to-Video | 25 |
| Video-to-Video | 30 |
| Image Upscaling | 10 |
| Background Removal | 5 |
| Music Generation | 15 |
| Video Processing | Varies |

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `402` - Payment Required (insufficient credits)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Rate Limits

- **General API:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 5 attempts per 15 minutes per IP

---

This is a **REAL, working API** - all endpoints are fully implemented!
