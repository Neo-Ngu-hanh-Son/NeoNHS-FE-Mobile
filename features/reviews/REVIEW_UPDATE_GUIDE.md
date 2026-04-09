# Frontend Review Module Update Guide

The Review module has been improved to support multiple entity types instead of just `workshop` and `event` as before.

Below are the key changes to the DTO structure, API, and logic flow for the Frontend team to update.

## 1. Data Structure Changes

The `event` and `workshopTemplate` fields have been completely removed from the `Review` table. Instead, the system uses polymorphic identifiers with two new fields:

- `reviewTypeFlg` (Integer): A flag identifying the entity type.

- `reviewTypeId` (UUID): The ID of the corresponding entity.

### Meaning of `reviewTypeFlg`:
- **`1`** : Workshop
- **`2`** : Event
- **`3`** : Point

## 2. Updating API Endpoint

The endpoint that previously retrieved review lists by Workshop has been changed to a general endpoint for all branches.

**Old:**

`GET /api/reviews/workshops/{workshopTemplateId}`

**New:**
`GET /api/reviews/{reviewTypeFlg}/{reviewTypeId}?page=0&size=10&sort=createdAt,desc`

**Examples:**
- To get the review of Workshop with ID `abc-123`: `GET /api/reviews/1/abc-123`
- To get the review of Event with ID `xyz-789`: `GET /api/reviews/2/xyz-789`
- To get the review of Point with ID `def-456`: `GET /api/reviews/3/def-456`

## 3. Changes in the Request/Response Body

### A. API for Creating New Reviews (`POST /api/reviews`)

The review creation payload has removed the `workshopTemplateId` field and replaced it with the pair of fields `reviewTypeFlg` / `reviewTypeId`.

**Old Format:**
```json
{ 
"workshopTemplateId": "uuid", 
"rating": 5, 
"comment": "Great!", 
"imageUrls": ["url1", "url2"]
}
```

**New Format:**
```json
{ 
"reviewTypeFlg": 1, // 1: Workshop, 2: Event, 3: Point 
"reviewTypeId": "uuid-cua-thuc-the", // corresponding ID 
"rating": 5, 
"comment": "Great!", 
"imageUrls": ["url1", "url2"]
}
```

### B. API for Retrieving/Updating Reviews (`ReviewResponse`)

Similarly, the response will not include the `workshopTemplateId`. FE can use the `reviewTypeFlg` and `reviewTypeId` pair if it needs to retrieve the information.

**New Return Format:**
```json
{
  "id": "review-uuid",
  "reviewTypeFlg": 1,
  "reviewTypeId": "uuid-cua-thuc-the",
  "user": {
    "id": "user-id",
    "fullname": "Nguyen Van A",
    "email": "a@ex.com",
    "avatarUrl": "...",
    "role": "TOURIST"
  },
  "rating": 5,
  "comment": "Great!",
  "createdAt": "2024-03-10T12:00:00",
  "imageUrls": ["url1"]
}
```

## 4. Other Notes
- Updating reviews (`PUT /api/reviews/{id}`) to the basic payload only supports `rating`, `comment` and `imageUrls` and `reviewTypeId` or `reviewTypeFlg` cannot be changed after creation.

- The review creation API limits each user to one review per entity. A 400 error will be thrown if the user attempts a second review (Users should be directed to use the "Update" function).
