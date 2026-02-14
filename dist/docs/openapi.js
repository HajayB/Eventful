"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenAPIDocument = exports.registry = void 0;
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const authValidation_1 = require("../validation/authValidation");
const zod_to_openapi_2 = require("@asteasolutions/zod-to-openapi");
const zod_1 = require("zod");
(0, zod_to_openapi_2.extendZodWithOpenApi)(zod_1.z);
exports.registry = new zod_to_openapi_1.OpenAPIRegistry();
exports.registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});
/**
 * STEP 1 — Define Schemas
 */
const ErrorResponseSchema = exports.registry.register("ErrorResponse", zod_1.z.object({
    message: zod_1.z.string(),
}));
//REGISTER 
const AuthResponseSchema = exports.registry.register("AuthResponse", zod_1.z.object({
    token: zod_1.z.string(),
    user: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        email: zod_1.z.string(),
        role: zod_1.z.enum(["CREATOR", "EVENTEE"]),
    }),
}));
//LOGIN
const LoginResponseSchema = exports.registry.register("LoginResponse", zod_1.z.object({
    user: zod_1.z.object({
        _id: zod_1.z.string(),
        name: zod_1.z.string(),
        email: zod_1.z.string(),
        role: zod_1.z.enum(["CREATOR", "EVENTEE"]),
        createdAt: zod_1.z.string(),
    }),
    token: zod_1.z.string(),
}));
//GET ALL EVENTS  
const EventResponseSchema = exports.registry.register("EventListResponse", zod_1.z.object({
    _id: zod_1.z.string(),
    creatorId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.date(),
    endTime: zod_1.z.date(),
    price: zod_1.z.number(),
    totalTickets: zod_1.z.number(),
    ticketsSold: zod_1.z.number(),
    createdAt: zod_1.z.date(),
}));
//GET SINGLE EVENT
const SingleEventResponseSchema = exports.registry.register("SingleEventResponse", zod_1.z.object({
    _id: zod_1.z.string(),
    creatorId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.date(),
    endTime: zod_1.z.date(),
    price: zod_1.z.number(),
    totalTickets: zod_1.z.number(),
    ticketsSold: zod_1.z.number(),
    createdAt: zod_1.z.date(),
}));
//GET EVENT SHARE LINK
const shareEventResponseSchema = exports.registry.register("ShareEventResponse", zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    startTime: zod_1.z.date(),
    location: zod_1.z.string(),
    price: zod_1.z.number(),
    coverImage: zod_1.z.string(),
    shareUrl: zod_1.z.string(),
}));
//(CREATOR) CREATE EVENT
const createEventRequestSchema = exports.registry.register("CreateEventRequest", zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.date(),
    endTime: zod_1.z.date(),
    price: zod_1.z.number(),
    totalTickets: zod_1.z.number(),
}));
const createEventResponseSchema = exports.registry.register("CreateEventResponse", zod_1.z.object({
    message: zod_1.z.string(),
    id: zod_1.z.string(),
    creatorId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.date(),
    endTime: zod_1.z.date(),
    price: zod_1.z.number(),
    totalTickets: zod_1.z.number(),
    ticketsSold: zod_1.z.number(),
    createdAt: zod_1.z.string(),
}));
//(CREATOR)EDITS EVENT
const EditEventRequestSchema = exports.registry.register("CreateEventRequest", zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.date(),
    endTime: zod_1.z.date(),
    price: zod_1.z.number(),
    totalTickets: zod_1.z.number(),
}));
const EditEventResponseSchema = exports.registry.register("CreateEventResponse", zod_1.z.object({
    message: zod_1.z.string(),
    id: zod_1.z.string(),
    creatorId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    price: zod_1.z.number(),
    totalTickets: zod_1.z.number(),
    ticketsSold: zod_1.z.number(),
    createdAt: zod_1.z.string(),
}));
//(CREATOR)DELETE EVENT
const DeleteEventResponseSchema = exports.registry.register("CreateEventResponse", zod_1.z.object({
    message: zod_1.z.string(),
}));
//(CREATOR)GET ALL CREATED EVENTS
const CreatedEventsResponseSchema = exports.registry.register("CreatedEventResponse", zod_1.z.object({
    _id: zod_1.z.string(),
    creatorId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    price: zod_1.z.number(),
    totalTickets: zod_1.z.number(),
    ticketsSold: zod_1.z.number(),
    createdAt: zod_1.z.string(),
}));
//EVENTID SCHEMA
const TicketEventSchema = exports.registry.register("TicketEvent", zod_1.z.object({
    _id: zod_1.z.string(),
    title: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.date(),
    endTime: zod_1.z.date(),
    price: zod_1.z.number(),
}));
//(EVENTEE)GET ALL PURCHASED TICKETS
const PurchasedTicketsResponseSchema = exports.registry.register("PurchasedTicketsResponse", zod_1.z.object({
    _id: zod_1.z.string(),
    eventId: TicketEventSchema,
    paymentRef: zod_1.z.string(),
    isScanned: zod_1.z.boolean(),
    createdAt: zod_1.z.string().datetime(),
    status: zod_1.z.enum(["UNUSED", "USED"]),
    hasQr: zod_1.z.boolean(),
}));
//(CREATOR)SCAN PURCHASED TICKETS
const ScanTicketResponseSchema = exports.registry.register("ScanTicketResponse", zod_1.z.object({
    valid: zod_1.z.boolean(),
    status: zod_1.z.enum(["USED", "UNUSED"]),
    message: zod_1.z.string(),
    ticketId: zod_1.z.string(),
    scannedAt: zod_1.z.string().datetime(),
}));
const ScanTicketRequestSchema = exports.registry.register("ScanTicketRequest", zod_1.z.object({
    qrPayload: zod_1.z.string(),
    eventId: zod_1.z.string()
}));
//(EVENTEE)PAYMENT
const InitializePaymentRequestSchema = exports.registry.register("InitializePaymentRequest", zod_1.z.object({
    eventId: zod_1.z.string().length(24),
    quantity: zod_1.z.number().min(1),
    email: zod_1.z.string().email(),
}));
const InitializePaymentResponseSchema = exports.registry.register("InitializePaymentResponse", zod_1.z.object({
    authorizationUrl: zod_1.z.string(),
    paymentRef: zod_1.z.string(),
}));
//(EVENTEE) RESEND TICKET TO EMAIL
const ResendTicketResponseSchema = exports.registry.register("ResendTicketResponse", zod_1.z.object({
    message: zod_1.z.string(),
}));
//(CREATOR) ANALYTICS ALL TIME 
const CreatorAllTimeAnalyticsSchema = exports.registry.register("CreatorAllTimeAnalytics", zod_1.z.object({
    totalTicketsSold: zod_1.z.number(),
    totalRevenue: zod_1.z.number(),
    totalAttendees: zod_1.z.number(),
    totalUnusedTickets: zod_1.z.number(),
}));
//(CREATOR) PAYMENT ANALYTICS ALL TIME 
const CreatorPaymentAnalyticsSchema = exports.registry.register("CreatorPaymentAnalytics", zod_1.z.object({
    totalPayments: zod_1.z.number(),
    successfulPayments: zod_1.z.number(),
    failedPayments: zod_1.z.number(),
    totalRevenue: zod_1.z.number(),
}));
//(CREATOR) SINGLE EVENT ANALYTICS
const CreatorEventAnalyticsSchema = exports.registry.register("CreatorEventAnalytics", zod_1.z.object({
    eventId: zod_1.z.string(),
    totalTicketsSold: zod_1.z.number(),
    totalRevenue: zod_1.z.number(),
    totalAttendees: zod_1.z.number(),
    totalUnusedTickets: zod_1.z.number(),
}));
//NOTIFICATIONS SCHEMA 
const createReminderSchema = exports.registry.register("ReminderRequest", zod_1.z.object({
    eventId: zod_1.z.string(),
    remindAt: zod_1.z.date()
}));
const ReminderResponseSchema = exports.registry.register("ReminderResponse", zod_1.z.object({
    id: zod_1.z.string(),
    eventId: zod_1.z.string(),
    remindAt: zod_1.z.date(),
    createdAt: zod_1.z.date(),
}));
const cronResponseSchema = exports.registry.register("cronResponse", zod_1.z.object({
    message: zod_1.z.string(),
}));
/**
 * STEP 2 — Register Routes
 */
//AUTH
exports.registry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["Auth"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: authValidation_1.registerSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "User registered successfully",
            content: {
                "application/json": {
                    schema: AuthResponseSchema,
                },
            },
        },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        email: zod_1.z.string().email(),
                        password: zod_1.z.string().min(6),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Login successful",
            content: {
                "application/json": {
                    schema: LoginResponseSchema,
                },
            },
        },
        401: {
            description: "Invalid credentials",
        },
        429: {
            description: "Too many login attempts",
        },
    },
});
//EVENTS
exports.registry.registerPath({
    method: "get",
    path: "/events",
    tags: ["Events"],
    responses: {
        200: {
            description: "List of events",
            content: {
                "application/json": {
                    schema: zod_1.z.array(EventResponseSchema),
                },
            },
        },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/events/{eventId}",
    tags: ["Events"],
    responses: {
        200: {
            description: "Return single event",
            content: {
                "application/json": {
                    schema: SingleEventResponseSchema,
                },
            },
        },
        404: {
            description: "Event not found",
        },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/events/share/{eventId}",
    tags: ["Events"],
    responses: {
        200: {
            description: "Return event details with cover image and shareUrl",
            content: {
                "application/json": {
                    schema: shareEventResponseSchema,
                },
            },
        },
        404: {
            description: "Event not found",
        },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/events",
    tags: ["Events"],
    security: [{ bearerAuth: [] }], // 🔐 requires login
    description: "Create a new event (Creator role required)",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createEventRequestSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Event created successfully",
            content: {
                "application/json": {
                    schema: createEventResponseSchema,
                },
            },
        },
        400: {
            description: "Validation error",
        },
        401: {
            description: "Unauthorized",
        },
        403: {
            description: "Creator access required",
        },
    },
});
exports.registry.registerPath({
    method: "put",
    path: "/events/{eventId}",
    tags: ["Events"],
    security: [{ bearerAuth: [] }], // 🔐 requires login
    description: "Edit an event (Creator role required)",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: EditEventRequestSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Event edited successfully",
            content: {
                "application/json": {
                    schema: EditEventResponseSchema,
                },
            },
        },
        400: {
            description: "Validation error",
        },
        401: {
            description: "Unauthorized",
        },
        403: {
            description: "Creator access required",
        },
    },
});
exports.registry.registerPath({
    method: "delete",
    path: "/events/{eventId}",
    tags: ["Events"],
    security: [{ bearerAuth: [] }], // 🔐 requires login
    description: "Delete an event (Creator role required)",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: DeleteEventResponseSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Event deleted",
            content: {
                "application/json": {
                    schema: DeleteEventResponseSchema,
                },
            },
        },
        400: {
            description: "Validation error",
        },
        401: {
            description: "Unauthorized",
        },
        403: {
            description: "Creator access required",
        },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/events/creator/me",
    tags: ["Events"],
    security: [{ bearerAuth: [] }], // 🔐 requires login
    description: "View created events (Creator role required)",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreatedEventsResponseSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Created events",
            content: {
                "application/json": {
                    schema: CreatedEventsResponseSchema,
                },
            },
        },
        400: {
            description: "Validation error",
        },
        401: {
            description: "Unauthorized",
        },
        403: {
            description: "Creator access required",
        },
    },
});
//TICKETS
exports.registry.registerPath({
    method: "get",
    path: "/tickets/me",
    tags: ["Tickets"],
    security: [{ bearerAuth: [] }], // 🔐 requires login
    description: "View purchased events",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: PurchasedTicketsResponseSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Purchased events",
            content: {
                "application/json": {
                    schema: PurchasedTicketsResponseSchema,
                },
            },
        },
        401: {
            description: "Unauthorized",
        },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/tickets/scan",
    tags: ["Tickets"],
    description: "Scan a ticket (Creator only)",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: ScanTicketRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Ticket scanned successfully",
            content: {
                "application/json": {
                    schema: ScanTicketResponseSchema,
                },
            },
        },
        400: {
            description: "Invalid or already used ticket",
        },
        401: {
            description: "Unauthorized",
        },
        403: {
            description: "Only creators can scan tickets",
        },
        429: {
            description: "Too many scan attempts",
        },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/tickets/{ticketId}/qr",
    tags: ["Tickets"],
    description: "Retrieve QR payload for a specific ticket",
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            ticketId: zod_1.z.string().length(24),
        }),
    },
    responses: {
        200: {
            description: "QR payload retrieved successfully",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        qrPayload: zod_1.z.string(),
                    }),
                },
            },
        },
        401: {
            description: "Unauthorized",
        },
        404: {
            description: "Ticket not found",
        },
        409: {
            description: "Ticket already used",
        },
        429: {
            description: "Too many requests",
        },
    },
});
//PAYMENTS 
exports.registry.registerPath({
    method: "post",
    path: "/payments/initialize",
    tags: ["Payments"],
    description: "Initialize payment for event tickets",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: InitializePaymentRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Payment initialized successfully",
            content: {
                "application/json": {
                    schema: InitializePaymentResponseSchema,
                },
            },
        },
        400: {
            description: "Invalid request",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        401: {
            description: "Unauthorized",
        },
        429: {
            description: "Too many requests",
        },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/payments/webhook",
    tags: ["Payments"],
    description: "Paystack webhook endpoint",
    request: {
        headers: zod_1.z.object({
            "x-paystack-signature": zod_1.z.string(),
        }),
    },
    responses: {
        200: {
            description: "Webhook processed successfully",
        },
        400: {
            description: "Invalid webhook payload or signature",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/payments/resend-ticket/{paymentRef}",
    tags: ["Payments"],
    description: "Resend ticket email using payment reference",
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            paymentRef: zod_1.z.string(),
        }),
    },
    responses: {
        200: {
            description: "Tickets resent successfully",
            content: {
                "application/json": {
                    schema: ResendTicketResponseSchema,
                },
            },
        },
        401: {
            description: "Unauthorized",
        },
        404: {
            description: "Payment not found",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        429: {
            description: "Too many requests",
        },
    },
});
//ANALYTICS 
exports.registry.registerPath({
    method: "get",
    path: "/analytics/creator",
    tags: ["Analytics"],
    description: "Get creator all-time analytics",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Creator analytics retrieved successfully",
            content: {
                "application/json": {
                    schema: CreatorAllTimeAnalyticsSchema,
                },
            },
        },
        401: { description: "Unauthorized" },
        403: { description: "Only creators allowed" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/analytics/creator/payments",
    tags: ["Analytics"],
    description: "Get creator payment analytics",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Payment analytics retrieved successfully",
            content: {
                "application/json": {
                    schema: CreatorPaymentAnalyticsSchema,
                },
            },
        },
        401: { description: "Unauthorized" },
        403: { description: "Only creators allowed" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/analytics/creator/{eventId}",
    tags: ["Analytics"],
    description: "Get analytics for a specific event",
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            eventId: zod_1.z.string().length(24),
        }),
    },
    responses: {
        200: {
            description: "Event analytics retrieved successfully",
            content: {
                "application/json": {
                    schema: CreatorEventAnalyticsSchema,
                },
            },
        },
        401: { description: "Unauthorized" },
        403: { description: "Only creators allowed" },
        404: {
            description: "Event not found",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});
//EVENTEE ANALYTICS 
exports.registry.registerPath({
    method: "get",
    path: "/analytics/eventee/paid",
    tags: ["Analytics"],
    description: "Get paid events for eventee",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Paid events retrieved successfully",
            content: {
                "application/json": {
                    schema: zod_1.z.array(SingleEventResponseSchema),
                },
            },
        },
        401: { description: "Unauthorized" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/analytics/eventee/attended",
    tags: ["Analytics"],
    description: "Get attended events for eventee",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Attended events retrieved successfully",
            content: {
                "application/json": {
                    schema: zod_1.z.array(SingleEventResponseSchema),
                },
            },
        },
        401: { description: "Unauthorized" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/analytics/eventee/unattended",
    tags: ["Analytics"],
    description: "Get unattended events for eventee",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Unattended events retrieved successfully",
            content: {
                "application/json": {
                    schema: zod_1.z.array(SingleEventResponseSchema),
                },
            },
        },
        401: { description: "Unauthorized" },
    },
});
//NOTIFICATIONS 
exports.registry.registerPath({
    method: "post",
    path: "/notifications/reminder",
    tags: ["Notifications"],
    description: "Create a reminder for an event",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createReminderSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Reminder created successfully",
            content: {
                "application/json": {
                    schema: ReminderResponseSchema,
                },
            },
        },
        400: {
            description: "Invalid request",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        401: {
            description: "Unauthorized",
        },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/notifications/reminder/me",
    tags: ["Notifications"],
    description: "Get all reminders for logged-in user",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "User reminders retrieved successfully",
            content: {
                "application/json": {
                    schema: zod_1.z.array(ReminderResponseSchema),
                },
            },
        },
        401: {
            description: "Unauthorized",
        },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/notifications/internal/run-reminders",
    tags: ["Notifications"],
    description: "Run worker for reminders",
    security: [{ bearerAuth: [] }, { xCronSecret: [] }],
    responses: {
        200: {
            description: "Reminders processed",
            content: {
                "application/json": {
                    schema: zod_1.z.array(cronResponseSchema),
                },
            },
        },
        401: {
            description: "Unauthorized",
        },
    },
});
/**
 * STEP 3 — Generate Document
 */
const generateOpenAPIDocument = () => {
    const generator = new zod_to_openapi_1.OpenApiGeneratorV3(exports.registry.definitions);
    return generator.generateDocument({
        openapi: "3.0.0",
        info: {
            title: "Eventful API",
            version: "1.0.0",
        },
        servers: [
            {
                url: "http://localhost:4000",
            },
        ],
    });
};
exports.generateOpenAPIDocument = generateOpenAPIDocument;
