# Super Skylab API

**Version:** 1.0
**Description:** Super Skylab Service API

**Base URL:** `https://api.yildizskylab.com`

---

# Endpoints

## announcement-controller

### GET `/api/announcements/`

**Operation ID:** `getAllAnnouncements`

#### Parameters

| Name             | In    | Required | Type    |
| ---------------- | ----- | -------- | ------- |
| includeUser      | query | False    | boolean |
| includeEventType | query | False    | boolean |
| includeImages    | query | False    | boolean |

#### Responses

| Code | Description | Type                                                            |
| ---- | ----------- | --------------------------------------------------------------- |
| 200  | OK          | [DataResultListAnnouncementDto](#dataresultlistannouncementdto) |

### POST `/api/announcements/`

**Operation ID:** `addAnnouncement`

#### Request Body (multipart/form-data)

Type: object

#### Responses

| Code | Description | Type                                                    |
| ---- | ----------- | ------------------------------------------------------- |
| 200  | OK          | [DataResultAnnouncementDto](#dataresultannouncementdto) |

### GET `/api/announcements/{id}`

**Operation ID:** `getAnnouncementById`

#### Parameters

| Name             | In    | Required | Type          |
| ---------------- | ----- | -------- | ------------- |
| id               | path  | True     | string (uuid) |
| includeEventType | query | False    | boolean       |

#### Responses

| Code | Description | Type                                                    |
| ---- | ----------- | ------------------------------------------------------- |
| 200  | OK          | [DataResultAnnouncementDto](#dataresultannouncementdto) |

### DELETE `/api/announcements/{id}`

**Operation ID:** `deleteAnnouncement`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### PATCH `/api/announcements/{id}`

**Operation ID:** `updateAnnouncement`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Request Body (application/json)

Type: [UpdateAnnouncementRequest](#updateannouncementrequest)

#### Responses

| Code | Description | Type                                                    |
| ---- | ----------- | ------------------------------------------------------- |
| 200  | OK          | [DataResultAnnouncementDto](#dataresultannouncementdto) |

### GET `/api/announcements/event-type/{eventTypeId}`

**Operation ID:** `getAllAnnouncementsByEventTypeId`

#### Parameters

| Name             | In    | Required | Type          |
| ---------------- | ----- | -------- | ------------- |
| eventTypeId      | path  | True     | string (uuid) |
| includeUser      | query | False    | boolean       |
| includeEventType | query | False    | boolean       |
| includeImages    | query | False    | boolean       |

#### Responses

| Code | Description | Type                                                            |
| ---- | ----------- | --------------------------------------------------------------- |
| 200  | OK          | [DataResultListAnnouncementDto](#dataresultlistannouncementdto) |

## auth-controller

### POST `/api/auth/register`

**Operation ID:** `register`

#### Request Body (application/json)

Type: [CreateUserRequest](#createuserrequest)

#### Responses

| Code | Description | Type                            |
| ---- | ----------- | ------------------------------- |
| 200  | OK          | [SuccessResult](#successresult) |

## competitor-controller

### GET `/api/competitors/{id}`

**Operation ID:** `getCompetitorById`

#### Parameters

| Name         | In    | Required | Type          |
| ------------ | ----- | -------- | ------------- |
| id           | path  | True     | string (uuid) |
| includeUser  | query | False    | boolean       |
| includeEvent | query | False    | boolean       |

#### Responses

| Code | Description | Type                                                |
| ---- | ----------- | --------------------------------------------------- |
| 200  | OK          | [DataResultCompetitorDto](#dataresultcompetitordto) |

### PUT `/api/competitors/{id}`

**Operation ID:** `updateCompetitor`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Request Body (application/json)

Type: [UpdateCompetitorRequest](#updatecompetitorrequest)

#### Responses

| Code | Description | Type                                                |
| ---- | ----------- | --------------------------------------------------- |
| 200  | OK          | [DataResultCompetitorDto](#dataresultcompetitordto) |

### DELETE `/api/competitors/{id}`

**Operation ID:** `deleteCompetitor`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### GET `/api/competitors/`

**Operation ID:** `getAllCompetitors`

#### Parameters

| Name         | In    | Required | Type    |
| ------------ | ----- | -------- | ------- |
| includeUser  | query | False    | boolean |
| includeEvent | query | False    | boolean |

#### Responses

| Code | Description | Type                                                        |
| ---- | ----------- | ----------------------------------------------------------- |
| 200  | OK          | [DataResultListCompetitorDto](#dataresultlistcompetitordto) |

### POST `/api/competitors/`

**Operation ID:** `addCompetitor`

#### Request Body (application/json)

Type: [CreateCompetitorRequest](#createcompetitorrequest)

#### Responses

| Code | Description | Type                                                |
| ---- | ----------- | --------------------------------------------------- |
| 200  | OK          | [DataResultCompetitorDto](#dataresultcompetitordto) |

### GET `/api/competitors/user/{userId}`

**Operation ID:** `getCompetitorsByUserId`

#### Parameters

| Name         | In    | Required | Type          |
| ------------ | ----- | -------- | ------------- |
| userId       | path  | True     | string (uuid) |
| includeUser  | query | False    | boolean       |
| includeEvent | query | False    | boolean       |

#### Responses

| Code | Description | Type                                                        |
| ---- | ----------- | ----------------------------------------------------------- |
| 200  | OK          | [DataResultListCompetitorDto](#dataresultlistcompetitordto) |

### GET `/api/competitors/my`

**Operation ID:** `getMyCompetitors`

#### Parameters

| Name         | In    | Required | Type    |
| ------------ | ----- | -------- | ------- |
| includeUser  | query | False    | boolean |
| includeEvent | query | False    | boolean |

#### Responses

| Code | Description | Type                                                        |
| ---- | ----------- | ----------------------------------------------------------- |
| 200  | OK          | [DataResultListCompetitorDto](#dataresultlistcompetitordto) |

### GET `/api/competitors/leaderboard`

**Operation ID:** `getLeaderboard`

#### Parameters

| Name          | In    | Required | Type    |
| ------------- | ----- | -------- | ------- |
| eventTypeName | query | True     | string  |
| includeUser   | query | False    | boolean |
| includeEvent  | query | False    | boolean |

#### Responses

| Code | Description | Type                                                          |
| ---- | ----------- | ------------------------------------------------------------- |
| 200  | OK          | [DataResultListLeaderboardDto](#dataresultlistleaderboarddto) |

### GET `/api/competitors/leaderboard/season/{seasonId}`

**Operation ID:** `getSeasonLeaderboard`

#### Parameters

| Name          | In    | Required | Type          |
| ------------- | ----- | -------- | ------------- |
| seasonId      | path  | True     | string (uuid) |
| eventTypeName | query | True     | string        |

#### Responses

| Code | Description | Type                                                          |
| ---- | ----------- | ------------------------------------------------------------- |
| 200  | OK          | [DataResultListLeaderboardDto](#dataresultlistleaderboarddto) |

### GET `/api/competitors/event/{eventId}`

**Operation ID:** `getCompetitorsByEventId`

#### Parameters

| Name         | In    | Required | Type          |
| ------------ | ----- | -------- | ------------- |
| eventId      | path  | True     | string (uuid) |
| includeUser  | query | False    | boolean       |
| includeEvent | query | False    | boolean       |

#### Responses

| Code | Description | Type                                                        |
| ---- | ----------- | ----------------------------------------------------------- |
| 200  | OK          | [DataResultListCompetitorDto](#dataresultlistcompetitordto) |

### GET `/api/competitors/event/{eventId}/winner`

**Operation ID:** `getEventWinner`

#### Parameters

| Name         | In    | Required | Type          |
| ------------ | ----- | -------- | ------------- |
| eventId      | path  | True     | string (uuid) |
| includeUser  | query | False    | boolean       |
| includeEvent | query | False    | boolean       |

#### Responses

| Code | Description | Type                                                |
| ---- | ----------- | --------------------------------------------------- |
| 200  | OK          | [DataResultCompetitorDto](#dataresultcompetitordto) |

## event-controller

### GET `/api/events/{id}`

**Operation ID:** `getEventById`

#### Parameters

| Name               | In    | Required | Type          |
| ------------------ | ----- | -------- | ------------- |
| id                 | path  | True     | string (uuid) |
| includeEventType   | query | False    | boolean       |
| includeSession     | query | False    | boolean       |
| includeCompetitors | query | False    | boolean       |
| includeImages      | query | False    | boolean       |
| includeSeason      | query | False    | boolean       |

#### Responses

| Code | Description | Type                                      |
| ---- | ----------- | ----------------------------------------- |
| 200  | OK          | [DataResultEventDto](#dataresulteventdto) |

### PUT `/api/events/{id}`

**Operation ID:** `updateEvent`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Request Body (application/json)

Type: [UpdateEventRequest](#updateeventrequest)

#### Responses

| Code | Description | Type                                      |
| ---- | ----------- | ----------------------------------------- |
| 200  | OK          | [DataResultEventDto](#dataresulteventdto) |

### DELETE `/api/events/{id}`

**Operation ID:** `deleteEvent`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### GET `/api/events/`

**Operation ID:** `getAllEvents`

#### Parameters

| Name               | In    | Required | Type    |
| ------------------ | ----- | -------- | ------- |
| includeEventType   | query | False    | boolean |
| includeSession     | query | False    | boolean |
| includeCompetitors | query | False    | boolean |
| includeImages      | query | False    | boolean |
| includeSeason      | query | False    | boolean |

#### Responses

| Code | Description | Type                                              |
| ---- | ----------- | ------------------------------------------------- |
| 200  | OK          | [DataResultListEventDto](#dataresultlisteventdto) |

### POST `/api/events/`

**Summary:** Add new event
**Description:** Adds a new event with optional cover image
**Operation ID:** `addEvent`

#### Request Body (multipart/form-data)

Type: object

#### Responses

| Code | Description | Type                                      |
| ---- | ----------- | ----------------------------------------- |
| 200  | OK          | [DataResultEventDto](#dataresulteventdto) |

### GET `/api/events/event-type`

**Operation ID:** `getAllByEventType`

#### Parameters

| Name               | In    | Required | Type    |
| ------------------ | ----- | -------- | ------- |
| eventTypeName      | query | True     | string  |
| includeEventType   | query | False    | boolean |
| includeSession     | query | False    | boolean |
| includeCompetitors | query | False    | boolean |
| includeImages      | query | False    | boolean |
| includeSeason      | query | False    | boolean |

#### Responses

| Code | Description | Type   |
| ---- | ----------- | ------ |
| 200  | OK          | object |

### GET `/api/events/active`

**Operation ID:** `getActiveEvents`

#### Parameters

| Name               | In    | Required | Type    |
| ------------------ | ----- | -------- | ------- |
| includeEventType   | query | False    | boolean |
| includeSession     | query | False    | boolean |
| includeCompetitors | query | False    | boolean |
| includeImages      | query | False    | boolean |
| includeSeason      | query | False    | boolean |

#### Responses

| Code | Description | Type                                              |
| ---- | ----------- | ------------------------------------------------- |
| 200  | OK          | [DataResultListEventDto](#dataresultlisteventdto) |

## event-type-controller

### GET `/api/event-types/{id}`

**Operation ID:** `getEventTypeById`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Responses

| Code | Description | Type                                              |
| ---- | ----------- | ------------------------------------------------- |
| 200  | OK          | [DataResultEventTypeDto](#dataresulteventtypedto) |

### PUT `/api/event-types/{id}`

**Operation ID:** `updateEventType`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Request Body (application/json)

Type: [UpdateEventTypeRequest](#updateeventtyperequest)

#### Responses

| Code | Description | Type                                              |
| ---- | ----------- | ------------------------------------------------- |
| 200  | OK          | [DataResultEventTypeDto](#dataresulteventtypedto) |

### DELETE `/api/event-types/{id}`

**Operation ID:** `deleteEventType`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### GET `/api/event-types/`

**Operation ID:** `getAllEventTypes`

#### Responses

| Code | Description | Type                                                      |
| ---- | ----------- | --------------------------------------------------------- |
| 200  | OK          | [DataResultListEventTypeDto](#dataresultlisteventtypedto) |

### POST `/api/event-types/`

**Operation ID:** `addEventType`

#### Request Body (application/json)

Type: [CreateEventTypeRequest](#createeventtyperequest)

#### Responses

| Code | Description | Type                                              |
| ---- | ----------- | ------------------------------------------------- |
| 200  | OK          | [DataResultEventTypeDto](#dataresulteventtypedto) |

### GET `/api/event-types/{eventTypeName}/coordinators`

**Operation ID:** `getCoordinatorsByEventType`

#### Parameters

| Name          | In   | Required | Type   |
| ------------- | ---- | -------- | ------ |
| eventTypeName | path | True     | string |

#### Responses

| Code | Description | Type                                          |
| ---- | ----------- | --------------------------------------------- |
| 200  | OK          | [DataResultSetUserDto](#dataresultsetuserdto) |

## group-controller

### POST `/api/groups/`

**Operation ID:** `createGroup`

#### Request Body (application/json)

Type: [CreateGroupRequest](#creategrouprequest)

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

## image-controller

### POST `/api/images/`

**Operation ID:** `uploadImage`

#### Request Body (application/json)

Type: object

#### Responses

| Code | Description | Type                                                                                |
| ---- | ----------- | ----------------------------------------------------------------------------------- |
| 200  | OK          | [SuccessDataResultUploadImageResponseDto](#successdataresultuploadimageresponsedto) |

### DELETE `/api/images/{imageId}`

**Operation ID:** `deleteImage`

#### Parameters

| Name    | In   | Required | Type          |
| ------- | ---- | -------- | ------------- |
| imageId | path | True     | string (uuid) |

#### Responses

| Code | Description | Type                            |
| ---- | ----------- | ------------------------------- |
| 200  | OK          | [SuccessResult](#successresult) |

## internal-auth-controller

### POST `/internal/api/auth/register/oauth2`

**Operation ID:** `registerOauth2User`

#### Request Body (application/json)

Type: [RegisterRequestDto](#registerrequestdto)

#### Responses

| Code | Description | Type                                        |
| ---- | ----------- | ------------------------------------------- |
| 200  | OK          | [RegisterResponseDto](#registerresponsedto) |

## qr-code-controller

### GET `/api/qrCodes/generateQRCode`

**Operation ID:** `generateQRCode`

#### Parameters

| Name   | In    | Required | Type            |
| ------ | ----- | -------- | --------------- |
| url    | query | True     | string          |
| width  | query | True     | integer (int32) |
| height | query | True     | integer (int32) |

#### Responses

| Code | Description | Type          |
| ---- | ----------- | ------------- |
| 200  | OK          | string (byte) |

### GET `/api/qrCodes/generateQRCodeWithLogo`

**Operation ID:** `generateQRCodeWithLogo`

#### Parameters

| Name     | In    | Required | Type            |
| -------- | ----- | -------- | --------------- |
| url      | query | True     | string          |
| width    | query | True     | integer (int32) |
| height   | query | True     | integer (int32) |
| logoSize | query | False    | integer (int32) |

#### Responses

| Code | Description | Type          |
| ---- | ----------- | ------------- |
| 200  | OK          | string (byte) |

## season-controller

### GET `/api/seasons/{id}`

**Operation ID:** `getSeasonById`

#### Parameters

| Name          | In    | Required | Type          |
| ------------- | ----- | -------- | ------------- |
| id            | path  | True     | string (uuid) |
| includeEvents | query | False    | boolean       |

#### Responses

| Code | Description | Type                                        |
| ---- | ----------- | ------------------------------------------- |
| 200  | OK          | [DataResultSeasonDto](#dataresultseasondto) |

### PUT `/api/seasons/{id}`

**Operation ID:** `updateSeason`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Request Body (application/json)

Type: [UpdateSeasonRequest](#updateseasonrequest)

#### Responses

| Code | Description | Type                                        |
| ---- | ----------- | ------------------------------------------- |
| 200  | OK          | [DataResultSeasonDto](#dataresultseasondto) |

### DELETE `/api/seasons/{id}`

**Operation ID:** `deleteSeason`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### POST `/api/seasons/{seasonId}/events/{eventId}`

**Operation ID:** `addEventToSeason`

#### Parameters

| Name     | In   | Required | Type          |
| -------- | ---- | -------- | ------------- |
| seasonId | path | True     | string (uuid) |
| eventId  | path | True     | string (uuid) |

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### DELETE `/api/seasons/{seasonId}/events/{eventId}`

**Operation ID:** `removeEventFromSeason`

#### Parameters

| Name     | In   | Required | Type          |
| -------- | ---- | -------- | ------------- |
| seasonId | path | True     | string (uuid) |
| eventId  | path | True     | string (uuid) |

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### GET `/api/seasons/`

**Operation ID:** `getAllSeasons`

#### Parameters

| Name          | In    | Required | Type    |
| ------------- | ----- | -------- | ------- |
| includeEvents | query | False    | boolean |

#### Responses

| Code | Description | Type                                                |
| ---- | ----------- | --------------------------------------------------- |
| 200  | OK          | [DataResultListSeasonDto](#dataresultlistseasondto) |

### POST `/api/seasons/`

**Operation ID:** `addSeason`

#### Request Body (application/json)

Type: [CreateSeasonRequest](#createseasonrequest)

#### Responses

| Code | Description | Type                                        |
| ---- | ----------- | ------------------------------------------- |
| 200  | OK          | [DataResultSeasonDto](#dataresultseasondto) |

### GET `/api/seasons/active`

**Operation ID:** `getActiveSeasons`

#### Parameters

| Name          | In    | Required | Type    |
| ------------- | ----- | -------- | ------- |
| includeEvents | query | False    | boolean |

#### Responses

| Code | Description | Type                                                |
| ---- | ----------- | --------------------------------------------------- |
| 200  | OK          | [DataResultListSeasonDto](#dataresultlistseasondto) |

## session-controller

### GET `/api/sessions/`

**Operation ID:** `getAllSessions`

#### Parameters

| Name         | In    | Required | Type    |
| ------------ | ----- | -------- | ------- |
| includeEvent | query | False    | boolean |

#### Responses

| Code | Description | Type                                                  |
| ---- | ----------- | ----------------------------------------------------- |
| 200  | OK          | [DataResultListSessionDto](#dataresultlistsessiondto) |

### POST `/api/sessions/`

**Operation ID:** `addSession`

#### Request Body (application/json)

Type: [CreateSessionRequest](#createsessionrequest)

#### Responses

| Code | Description | Type                                          |
| ---- | ----------- | --------------------------------------------- |
| 200  | OK          | [DataResultSessionDto](#dataresultsessiondto) |

### DELETE `/api/sessions/{id}`

**Operation ID:** `deleteSession`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Responses

| Code | Description | Type                              |
| ---- | ----------- | --------------------------------- |
| 200  | OK          | [DataResultVoid](#dataresultvoid) |

## user-controller

### GET `/api/users/{id}`

**Operation ID:** `getUserById`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Responses

| Code | Description | Type                                    |
| ---- | ----------- | --------------------------------------- |
| 200  | OK          | [DataResultUserDto](#dataresultuserdto) |

### PUT `/api/users/{id}`

**Operation ID:** `updateUserById`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Request Body (application/json)

Type: [UpdateUserRequest](#updateuserrequest)

#### Responses

| Code | Description | Type                                    |
| ---- | ----------- | --------------------------------------- |
| 200  | OK          | [DataResultUserDto](#dataresultuserdto) |

### DELETE `/api/users/{id}`

**Operation ID:** `deleteUser`

#### Parameters

| Name | In   | Required | Type          |
| ---- | ---- | -------- | ------------- |
| id   | path | True     | string (uuid) |

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### PUT `/api/users/remove-role/{username}`

**Operation ID:** `removeRoleFromUser`

#### Parameters

| Name     | In    | Required | Type   |
| -------- | ----- | -------- | ------ |
| username | path  | True     | string |
| role     | query | True     | string |

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### GET `/api/users/me`

**Operation ID:** `getAuthenticatedUser`

#### Responses

| Code | Description | Type                                    |
| ---- | ----------- | --------------------------------------- |
| 200  | OK          | [DataResultUserDto](#dataresultuserdto) |

### PUT `/api/users/me`

**Operation ID:** `updateAuthenticatedUser`

#### Request Body (application/json)

Type: [UpdateUserRequest](#updateuserrequest)

#### Responses

| Code | Description | Type                                    |
| ---- | ----------- | --------------------------------------- |
| 200  | OK          | [DataResultUserDto](#dataresultuserdto) |

### PUT `/api/users/assign-role/{username}`

**Operation ID:** `assignRoleToUser`

#### Parameters

| Name     | In    | Required | Type   |
| -------- | ----- | -------- | ------ |
| username | path  | True     | string |
| role     | query | True     | string |

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### POST `/api/users/me/profile-picture`

**Operation ID:** `updateProfilePicture`

#### Request Body (application/json)

Type: object

#### Responses

| Code | Description | Type              |
| ---- | ----------- | ----------------- |
| 200  | OK          | [Result](#result) |

### GET `/api/users/`

**Operation ID:** `getAllUsers`

#### Responses

| Code | Description | Type                                            |
| ---- | ----------- | ----------------------------------------------- |
| 200  | OK          | [DataResultListUserDto](#dataresultlistuserdto) |

---

# Schemas

### UpdateUserRequest

**Type:** object
| Property | Type |
|---|---|
| firstName | string |
| lastName | string |
| linkedin | string |
| university | string |
| faculty | string |
| department | string |

### DataResultUserDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | [UserDto](#userdto) |

### UserDto

**Type:** object
| Property | Type |
|---|---|
| id | string (uuid) |
| username | string |
| email | string |
| firstName | string |
| lastName | string |
| profilePictureUrl | string |
| linkedin | string |
| university | string |
| faculty | string |
| department | string |
| roles | Array<string> |

### Result

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |

### UpdateSeasonRequest

**Type:** object
| Property | Type |
|---|---|
| name | string |
| startDate | string (date-time) |
| endDate | string (date-time) |
| active | boolean |

### CompetitorDto

**Type:** object
| Property | Type |
|---|---|
| id | string (uuid) |
| user | [UserDto](#userdto) |
| event | [EventDto](#eventdto) |
| score | number (double) |
| rank | integer (int32) |
| winner | boolean |

### DataResultSeasonDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | [SeasonDto](#seasondto) |

### EventDto

**Type:** object
| Property | Type |
|---|---|
| id | string (uuid) |
| name | string |
| coverImageUrl | string |
| description | string |
| location | string |
| type | [EventTypeDto](#eventtypedto) |
| formUrl | string |
| startDate | string (date-time) |
| endDate | string (date-time) |
| linkedin | string |
| active | boolean |
| prizeInfo | string |
| season | [SeasonDto](#seasondto) |
| sessions | Array<[SessionDto](#sessiondto)> |
| imageUrls | Array<string> |
| competitors | Array<[CompetitorDto](#competitordto)> |
| ranked | boolean |

### EventTypeDto

**Type:** object
| Property | Type |
|---|---|
| id | string (uuid) |
| name | string |
| authorizedRoles | Array<string> |

### SeasonDto

**Type:** object
| Property | Type |
|---|---|
| id | string (uuid) |
| name | string |
| startDate | string (date-time) |
| endDate | string (date-time) |
| active | boolean |
| events | Array<[EventDto](#eventdto)> |

### SessionDto

**Type:** object
| Property | Type |
|---|---|
| id | string (uuid) |
| title | string |
| speakerName | string |
| speakerLinkedin | string |
| speakerImageUrl | string |
| description | string |
| startTime | string (date-time) |
| endTime | string (date-time) |
| orderIndex | integer (int32) |
| event | [EventDto](#eventdto) |
| sessionType | string |

### UpdateEventRequest

**Type:** object
| Property | Type |
|---|---|
| name | string |
| description | string |
| location | string |
| type | string |
| formUrl | string |
| prizeInfo | string |
| startDate | string (date-time) |
| typeId | string (uuid) |
| seasonId | string (uuid) |
| endDate | string (date-time) |
| linkedin | string |
| active | boolean |
| competitionId | string (uuid) |
| ranked | boolean |

### DataResultEventDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | [EventDto](#eventdto) |

### UpdateEventTypeRequest

**Type:** object
| Property | Type |
|---|---|
| name | string |
| authorizedRoles | Array<string> |

### DataResultEventTypeDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | [EventTypeDto](#eventtypedto) |

### UpdateCompetitorRequest

**Type:** object
| Property | Type |
|---|---|
| userId | string (uuid) |
| eventId | string (uuid) |
| points | number (double) |
| winner | boolean |

### DataResultCompetitorDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | [CompetitorDto](#competitordto) |

### RegisterRequestDto

**Type:** object
| Property | Type |
|---|---|
| username | string |
| email | string |
| firstName | string |
| lastName | string |

### RegisterResponseDto

**Type:** object
| Property | Type |
|---|---|
| ldapSkyNumber | string |

### CreateSessionRequest

**Type:** object
| Property | Type |
|---|---|
| eventId | string (uuid) |
| title | string |
| speakerName | string |
| speakerLinkedin | string |
| description | string |
| startTime | string (date-time) |
| endTime | string (date-time) |
| orderIndex | integer (int32) |
| sessionType | string |

### DataResultSessionDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | [SessionDto](#sessiondto) |

### CreateSeasonRequest

**Type:** object
| Property | Type |
|---|---|
| name | string |
| startDate | string (date-time) |
| endDate | string (date-time) |
| active | boolean |

### SuccessDataResultUploadImageResponseDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | [UploadImageResponseDto](#uploadimageresponsedto) |

### UploadImageResponseDto

**Type:** object
| Property | Type |
|---|---|
| id | string (uuid) |
| fileName | string |
| fileType | string |
| fileUrl | string |
| fileSize | integer (int64) |

### CreateGroupRequest

**Type:** object
| Property | Type |
|---|---|
| groupName | string |

### CreateEventRequest

**Type:** object
| Property | Type |
|---|---|
| name | string |
| description | string |
| location | string |
| eventTypeId | string (uuid) |
| seasonId | string (uuid) |
| formUrl | string |
| startDate | string (date-time) |
| endDate | string (date-time) |
| linkedin | string |
| active | boolean |
| competitionId | string (uuid) |
| prizeInfo | string |
| ranked | boolean |

### CreateEventTypeRequest

**Type:** object
| Property | Type |
|---|---|
| name | string |
| authorizedRoles | Array<string> |

### CreateCompetitorRequest

**Type:** object
| Property | Type |
|---|---|
| userId | string (uuid) |
| eventId | string (uuid) |
| points | number (double) |
| winner | boolean |

### CreateUserRequest

**Type:** object
| Property | Type |
|---|---|
| username | string |
| firstName | string |
| lastName | string |
| email | string |
| password | string |

### SuccessResult

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |

### CreateAnnouncementRequestDto

**Type:** object
| Property | Type |
|---|---|
| title | string |
| body | string |
| active | boolean |
| eventTypeId | string (uuid) |
| formUrl | string |

### AnnouncementDto

**Type:** object
| Property | Type |
|---|---|
| id | string (uuid) |
| title | string |
| body | string |
| active | boolean |
| eventType | [EventTypeDto](#eventtypedto) |
| formUrl | string |
| coverImageUrl | string |

### DataResultAnnouncementDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | [AnnouncementDto](#announcementdto) |

### UpdateAnnouncementRequest

**Type:** object
| Property | Type |
|---|---|
| title | string |
| body | string |
| active | boolean |
| eventTypeId | string (uuid) |
| formUrl | string |

### DataResultListUserDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | Array<[UserDto](#userdto)> |

### DataResultListSessionDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | Array<[SessionDto](#sessiondto)> |

### DataResultListSeasonDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | Array<[SeasonDto](#seasondto)> |

### DataResultListEventDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | Array<[EventDto](#eventdto)> |

### DataResultSetUserDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | Array<[UserDto](#userdto)> |

### DataResultListEventTypeDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | Array<[EventTypeDto](#eventtypedto)> |

### DataResultListCompetitorDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | Array<[CompetitorDto](#competitordto)> |

### DataResultListLeaderboardDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | Array<[LeaderboardDto](#leaderboarddto)> |

### LeaderboardDto

**Type:** object
| Property | Type |
|---|---|
| user | [UserDto](#userdto) |
| totalScore | number (double) |
| eventCount | integer (int64) |
| rank | integer (int32) |

### DataResultListAnnouncementDto

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | Array<[AnnouncementDto](#announcementdto)> |

### DataResultVoid

**Type:** object
| Property | Type |
|---|---|
| success | boolean |
| message | string |
| httpStatus | string |
| path | string |
| timeStamp | string (date-time) |
| data | object |
