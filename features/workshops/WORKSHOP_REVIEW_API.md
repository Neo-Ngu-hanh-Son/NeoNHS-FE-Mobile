# Workshop Review & Rating API Guide

This guide details the APIs for the Review and Rating system for Workshop Templates. These APIs allow Tourists to view reviews for a workshop and submit their own reviews (including ratings and images).

## 1. Get Reviews for a Workshop Template

**Endpoint:** `GET /api/public/reviews/workshops/{workshopTemplateId}` (or `/api/reviews/workshops/{workshopTemplateId}` if public access is configured via SecurityConfig)

> **Note:** Based on the current configuration, the endpoint is configured as public in `SecurityConfig` via `/api/reviews/workshops/**`.

**Description:** Retrieves a paginated list of reviews for a specific workshop template. Only reviews with `VISIBLE` status are returned.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `workshopTemplateId` | Path Variable (UUID) | Yes | - | The unique ID of the workshop template. |
| `page` | Query Parameter | No | 0 | Page number (0-based). |
| `size` | Query Parameter | No | 10 | Number of items per page. |
| `sort` | Query Parameter | No | createdAt,desc | Sorting criteria (e.g., `rating,desc`). |

**Request Example:**
```http
GET /api/reviews/workshops/123e4567-e89b-12d3-a456-426614174000?page=0&size=5
```

**Response Example (200 OK):**
```json
{
  "status": "OK",
  "message": "Reviews retrieved successfully",
  "data": {
    "content": [
      {
        "id": "review-uuid-1",
        "workshopTemplateId": "123e4567-e89b-12d3-a456-426614174000",
        "user": {
          "id": "user-uuid-1",
          "fullname": "John Doe",
          "avatarUrl": "https://example.com/avatar.jpg",
          "role": "TOURIST"
        },
        "rating": 5,
        "comment": "Great workshop! Highly recommended.",
        "createdAt": "2023-10-27T10:00:00",
        "imageUrls": [
          "https://example.com/review-image-1.jpg"
        ]
      }
    ],
    "page": 0,
    "size": 5,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true,
    "empty": false
  }
}
```

---

## 2. Create a Review

**Endpoint:** `POST /api/reviews`

**Authentication:** Required (User must have `TOURIST` role).

**Description:** Allows a Tourist to submit a review for a workshop template. This updates the workshop's average rating and total review count.

**Request Body:**

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `workshopTemplateId` | UUID | Yes | ID of the workshop template being reviewed. | Must be valid. |
| `rating` | Integer | Yes | Rating score. | Min: 1, Max: 5. |
| `comment` | String | No | Textual feedback. | - |
| `imageUrls` | List<String> | No | List of URLs for review images. | - |

**Request Example:**
```json
{
  "workshopTemplateId": "123e4567-e89b-12d3-a456-426614174000",
  "rating": 5,
  "comment": "I learned so much! The instructor was fantastic.",
  "imageUrls": [
    "https://resource.cloudinary.com/example/image/upload/v1/review1.jpg"
  ]
}
```

**Response Example (201 Created):**
```json
{
  "status": "CREATED",
  "message": "Review created successfully",
  "data": {
    "id": "new-review-uuid",
    "workshopTemplateId": "123e4567-e89b-12d3-a456-426614174000",
    "user": {
      "id": "current-user-uuid",
      "fullname": "Jane Smith",
      ...
    },
    "rating": 5,
    "comment": "I learned so much! The instructor was fantastic.",
    "createdAt": "2023-10-28T14:30:00",
    "imageUrls": [
      "https://resource.cloudinary.com/example/image/upload/v1/review1.jpg"
    ]
  }
}

---

## 3. Update a Review

**Endpoint:** `PUT /api/reviews/{id}`

**Authentication:** Required (User must have `TOURIST` role and be the owner of the review).

**Description:** Allows a Tourist to update their existing review.

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | Path Variable (UUID) | Yes | The ID of the review to update. |

**Request Body:**

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `rating` | Integer | No | New rating score. | Min: 1, Max: 5. |
| `comment` | String | No | New textual feedback. | - |
| `imageUrls` | List<String> | No | New list of image URLs (replaces existing ones). | - |

**Request Example:**
```json
{
  "rating": 4,
  "comment": "Updated comment: Still good but found some minor issues.",
  "imageUrls": []
}
```

**Response Example (200 OK):**
```json
{
  "status": "OK",
  "message": "Review updated successfully",
  "data": {
    "id": "review-uuid-1",
    "workshopTemplateId": "123e4567-e89b-12d3-a456-426614174000",
    "user": { ... },
    "rating": 4,
    "comment": "Updated comment: Still good but found some minor issues.",
    "createdAt": "2023-10-28T14:30:00",
    "imageUrls": []
  }
}
```

## Error Codes

| Status Code | Description | possible Causes |
|---|---|---|
| 400 Bad Request | Invalid input | Validation error (e.g., rating out of range), or duplicate review attempted on Create. |
| 401 Unauthorized | Authentication failed | Missing or invalid token. |
| 403 Forbidden | Access denied | User is not a TOURIST. |
| 404 Not Found | Resource not found | Workshop Template ID does not exist. |
