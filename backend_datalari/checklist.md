# API Integration Checklist

## announcement-controller

- [x] getAllAnnouncements (GET /api/announcements/)
- [x] addAnnouncement (POST /api/announcements/)
- [x] getAnnouncementById (GET /api/announcements/{id})
- [x] deleteAnnouncement (DELETE /api/announcements/{id})
- [x] updateAnnouncement (PATCH /api/announcements/{id})
- [x] getAllAnnouncementsByEventTypeId (GET /api/announcements/event-type/{eventTypeId})

## auth-controller

- [x] register (POST /api/auth/register)

## competitor-controller

- [x] getCompetitorById (GET /api/competitors/{id})
- [x] updateCompetitor (PUT /api/competitors/{id})
- [x] deleteCompetitor (DELETE /api/competitors/{id})
- [x] getAllCompetitors (GET /api/competitors/)
- [x] addCompetitor (POST /api/competitors/)
- [x] getCompetitorsByUserId (GET /api/competitors/user/{userId})
- [x] getMyCompetitors (GET /api/competitors/my)
- [x] getLeaderboard (GET /api/competitors/leaderboard)
- [x] getSeasonLeaderboard (GET /api/competitors/leaderboard/season/{seasonId})
- [x] getCompetitorsByEventId (GET /api/competitors/event/{eventId})
- [x] getEventWinner (GET /api/competitors/event/{eventId}/winner)

## event-controller

- [x] getEventById (GET /api/events/{id})
- [x] updateEvent (PUT /api/events/{id})
- [x] deleteEvent (DELETE /api/events/{id})
- [x] getAllEvents (GET /api/events/)
- [x] addEvent (POST /api/events/)
- [x] getAllByEventType (GET /api/events/event-type)
- [x] getActiveEvents (GET /api/events/active)

## event-type-controller

- [x] getEventTypeById (GET /api/event-types/{id})
- [x] updateEventType (PUT /api/event-types/{id})
- [x] deleteEventType (DELETE /api/event-types/{id})
- [x] getAllEventTypes (GET /api/event-types/)
- [x] addEventType (POST /api/event-types/)
- [x] getCoordinatorsByEventType (GET /api/event-types/{eventTypeName}/coordinators)

## group-controller

- [x] createGroup (POST /api/groups/)

## image-controller

- [x] uploadImage (POST /api/images/)
- [x] deleteImage (DELETE /api/images/{imageId})

## internal-auth-controller

- [x] registerOauth2User (POST /internal/api/auth/register/oauth2)

## qr-code-controller

- [x] generateQRCode (GET /api/qrCodes/generateQRCode)
- [x] generateQRCodeWithLogo (GET /api/qrCodes/generateQRCodeWithLogo)

## season-controller

- [x] getSeasonById (GET /api/seasons/{id})
- [x] updateSeason (PUT /api/seasons/{id})
- [x] deleteSeason (DELETE /api/seasons/{id})
- [x] addEventToSeason (POST /api/seasons/{seasonId}/events/{eventId})
- [x] removeEventFromSeason (DELETE /api/seasons/{seasonId}/events/{eventId})
- [x] getAllSeasons (GET /api/seasons/)
- [x] addSeason (POST /api/seasons/)
- [x] getActiveSeasons (GET /api/seasons/active)

## session-controller

- [x] getAllSessions (GET /api/sessions/)
- [x] addSession (POST /api/sessions/)
- [x] deleteSession (DELETE /api/sessions/{id})

## user-controller

- [x] getUserById (GET /api/users/{id})
- [x] updateUserById (PUT /api/users/{id})
- [x] deleteUser (DELETE /api/users/{id})
- [x] removeRoleFromUser (PUT /api/users/remove-role/{username})
- [x] getAuthenticatedUser (GET /api/users/me)
- [x] updateAuthenticatedUser (PUT /api/users/me)
- [x] assignRoleToUser (PUT /api/users/assign-role/{username})
- [x] updateProfilePicture (POST /api/users/me/profile-picture)
- [x] getAllUsers (GET /api/users/)
