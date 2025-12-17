/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Успешность операции
 *         data:
 *           type: object
 *           description: Данные ответа
 *         message:
 *           type: string
 *           description: Сообщение
 *         error:
 *           type: string
 *           description: Сообщение об ошибке
 *         errors:
 *           type: object
 *           description: Детали ошибок валидации
 *
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT токен доступа
 *         refreshToken:
 *           type: string
 *           description: JWT токен обновления
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email адрес
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: Пароль (минимум 8 символов, должен содержать заглавные, строчные буквы, цифры и спецсимволы)
 *           example: Password123!
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: Password123!
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: JWT токен обновления
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *           nullable: true
 *           maxLength: 50
 *         lastName:
 *           type: string
 *           nullable: true
 *           maxLength: 50
 *         bio:
 *           type: string
 *           nullable: true
 *           maxLength: 500
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *         preferences:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           nullable: true
 *           minLength: 1
 *           maxLength: 50
 *         lastName:
 *           type: string
 *           nullable: true
 *           minLength: 1
 *           maxLength: 50
 *         bio:
 *           type: string
 *           nullable: true
 *           maxLength: 500
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *         preferences:
 *           type: object
 *
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           maxLength: 200
 *         content:
 *           type: string
 *           maxLength: 50000
 *         isDeleted:
 *           type: boolean
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateNoteRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           example: Моя первая заметка
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 50000
 *           example: Содержимое заметки
 *         tagIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example: ["123e4567-e89b-12d3-a456-426614174000"]
 *
 *     UpdateNoteRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 50000
 *         tagIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *
 *     NotesListResponse:
 *       type: object
 *       properties:
 *         notes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Note'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9\s\-_]+$'
 *         color:
 *           type: string
 *           pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *           nullable: true
 *         userId:
 *           type: string
 *           format: uuid
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateTagRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9\s\-_]+$'
 *           example: Работа
 *         color:
 *           type: string
 *           pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *           nullable: true
 *           example: "#FF5733"
 *
 *     UpdateTagRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9\s\-_]+$'
 *         color:
 *           type: string
 *           pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *           nullable: true
 *
 *     ValidateTagsRequest:
 *       type: object
 *       required:
 *         - tagIds
 *       properties:
 *         tagIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           minItems: 1
 *           example: ["123e4567-e89b-12d3-a456-426614174000"]
 *
 *     ValidateTagsResponse:
 *       type: object
 *       properties:
 *         validTags:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         invalidTags:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *
 *     TagsListResponse:
 *       type: object
 *       properties:
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Error message
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 */
