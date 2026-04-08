# Review listing API update

**Date:** 2026-04-09  
**Area:** Public review listing endpoints under `/api/reviews`

## Summary

The previous single endpoint that combined a numeric review-type flag and a UUID was replaced with **three explicit GET routes**—one per target entity (workshop template, event, point). Listing queries now use **inner joins** from `reviews` to the corresponding parent table so only reviews tied to a real parent row are returned (with the correct `review_type_flg` for each case).

## Removed

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/reviews/{reviewTypeFlg}/{reviewTypeId}` | `reviewTypeFlg`: 1 = workshop, 2 = event, 3 = point |

**Client action:** Stop calling this URL. Use one of the new paths below.

## Added

All three endpoints return the same payload shape: `ApiResponse<PagedResponse<ReviewResponse>>` (paged list of reviews).

| Method | Path | Description |
|--------|------|--------------|
| `GET` | `/api/reviews/workshops/{workshopTemplateId}` | Reviews for a workshop template (`review_type_flg = 1`) |
| `GET` | `/api/reviews/events/{eventId}` | Reviews for an event (`review_type_flg = 2`) |
| `GET` | `/api/reviews/points/{pointId}` | Reviews for a point (`review_type_flg = 3`) |

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `workshopTemplateId` | UUID | ID in `workshop_templates` |
| `eventId` | UUID | ID in `events` |
| `pointId` | UUID | ID in `points` |

### Query parameters (all optional)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | `0` | Zero-based page index |
| `size` | `10` | Page size (capped at `PaginationConstants.MAX_PAGE_SIZE`, typically 100) |
| `sortBy` | `createdAt` | Allowed: `createdAt`, `updatedAt`, `rating` (unknown values fall back to `createdAt`) |
| `sortDir` | `desc` | `asc` or `desc` |

### Example requests

```http
GET /api/reviews/workshops/550e8400-e29b-41d4-a716-446655440000?page=0&size=10&sortBy=createdAt&sortDir=desc
GET /api/reviews/events/{eventId}
GET /api/reviews/points/{pointId}
```

### HTTP behavior

- **404** if the workshop template, event, or point does not exist (same validation behavior as before).
- Only reviews with status **VISIBLE** are included.

## Security (public access)

These paths are configured as **permit-all** for anonymous `GET` access (see `SecurityConfig`):

- `/api/reviews/workshops/**`
- `/api/reviews/events/**`
- `/api/reviews/points/**`

Create/update review endpoints remain protected as before (`ROLE_TOURIST` where applicable).

## Implementation notes (backend)

- **Repository:** `ReviewRepository` defines JPQL queries that `JOIN` `Review` to `WorkshopTemplate`, `Event`, or `Point` and filter by the matching `reviewTypeFlg` and `ReviewStatus.VISIBLE`.
- **Service:** `ReviewService` exposes `getReviewsForWorkshopTemplate`, `getReviewsForEvent`, and `getReviewsForPoint` instead of `getReviewsByReviewTypeIdAndFlg`.

## Why three URLs instead of `/api/reviews/{id}`?

Workshop, event, and point IDs are all UUIDs. A single path variable cannot distinguish which entity type the ID refers to, so the API uses **resource-specific segments** (`workshops`, `events`, `points`) for unambiguous routing and documentation.
