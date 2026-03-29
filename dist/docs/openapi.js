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
// AUTH
const AuthResponseSchema = exports.registry.register("AuthResponse", zod_1.z.object({
    token: zod_1.z.string(),
    user: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        email: zod_1.z.string(),
        role: zod_1.z.enum(["CREATOR", "EVENTEE"]),
    }),
}));
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
// EVENTS
const EventSchema = exports.registry.register("Event", zod_1.z.object({
    _id: zod_1.z.string(),
    creatorId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    price: zod_1.z.number(),
    totalTickets: zod_1.z.number(),
    ticketsSold: zod_1.z.number(),
    coverImage: zod_1.z.string().optional(),
    maxTicketsPerPurchase: zod_1.z.number(),
    createdAt: zod_1.z.string().datetime(),
}));
const ShareEventResponseSchema = exports.registry.register("ShareEventResponse", zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    startTime: zod_1.z.string().datetime(),
    location: zod_1.z.string(),
    price: zod_1.z.number(),
    coverImage: zod_1.z.string(),
    shareUrl: zod_1.z.string(),
}));
const CreateEventRequestSchema = exports.registry.register("CreateEventRequest", zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    price: zod_1.z.number(),
    totalTickets: zod_1.z.number(),
    coverImage: zod_1.z.string().optional(),
    maxTicketsPerPurchase: zod_1.z.number().optional(),
}));
const UpdateEventRequestSchema = exports.registry.register("UpdateEventRequest", zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime().optional(),
    endTime: zod_1.z.string().datetime().optional(),
    price: zod_1.z.number().optional(),
    totalTickets: zod_1.z.number().optional(),
    coverImage: zod_1.z.string().optional(),
    maxTicketsPerPurchase: zod_1.z.number().optional(),
}));
const CreatorEventsResponseSchema = exports.registry.register("CreatorEventsResponse", zod_1.z.object({
    CurrentEvents: zod_1.z.object({
        activeEvents: zod_1.z.array(EventSchema),
        pastEvents: zod_1.z.array(EventSchema),
    }),
}));
// TICKETS
const TicketEventSchema = exports.registry.register("TicketEvent", zod_1.z.object({
    _id: zod_1.z.string(),
    title: zod_1.z.string(),
    location: zod_1.z.string(),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    price: zod_1.z.number(),
}));
const PurchasedTicketSchema = exports.registry.register("PurchasedTicket", zod_1.z.object({
    _id: zod_1.z.string(),
    eventId: TicketEventSchema,
    paymentRef: zod_1.z.string(),
    isScanned: zod_1.z.boolean(),
    createdAt: zod_1.z.string().datetime(),
    status: zod_1.z.enum(["UNUSED", "USED"]),
    hasQr: zod_1.z.boolean(),
}));
const ScanTicketRequestSchema = exports.registry.register("ScanTicketRequest", zod_1.z.object({
    qrPayload: zod_1.z.string(),
    eventId: zod_1.z.string(),
}));
const ScanTicketResponseSchema = exports.registry.register("ScanTicketResponse", zod_1.z.object({
    valid: zod_1.z.boolean(),
    status: zod_1.z.enum(["USED", "UNUSED"]),
    message: zod_1.z.string(),
    ticketId: zod_1.z.string(),
    scannedAt: zod_1.z.string().datetime(),
}));
// PAYMENTS
const InitializePaymentRequestSchema = exports.registry.register("InitializePaymentRequest", zod_1.z.object({
    eventId: zod_1.z.string().length(24),
    quantity: zod_1.z.number().min(1),
    email: zod_1.z.string().email(),
}));
const InitializePaymentResponseSchema = exports.registry.register("InitializePaymentResponse", zod_1.z.object({
    authorizationUrl: zod_1.z.string(),
    paymentRef: zod_1.z.string(),
}));
const GuestInitializePaymentRequestSchema = exports.registry.register("GuestInitializePaymentRequest", zod_1.z.object({
    eventId: zod_1.z.string().length(24),
    quantity: zod_1.z.number().min(1),
    email: zod_1.z.string().email(),
}));
const GuestResendRequestSchema = exports.registry.register("GuestResendRequest", zod_1.z.object({
    email: zod_1.z.string().email(),
    reference: zod_1.z.string(),
}));
const PaymentHistoryItemSchema = exports.registry.register("PaymentHistoryItem", zod_1.z.object({
    _id: zod_1.z.string(),
    reference: zod_1.z.string(),
    amount: zod_1.z.number(),
    quantity: zod_1.z.number(),
    status: zod_1.z.enum(["SUCCESS", "PENDING", "FAILED"]),
    paidAt: zod_1.z.string().datetime(),
    event: zod_1.z.object({
        _id: zod_1.z.string(),
        title: zod_1.z.string(),
        location: zod_1.z.string(),
        startTime: zod_1.z.string().datetime(),
    }),
}));
const MessageResponseSchema = exports.registry.register("MessageResponse", zod_1.z.object({ message: zod_1.z.string() }));
// ANALYTICS
const CreatorAllTimeAnalyticsSchema = exports.registry.register("CreatorAllTimeAnalytics", zod_1.z.object({
    totalTicketsSold: zod_1.z.number(),
    totalRevenue: zod_1.z.number(),
    totalAttendees: zod_1.z.number(),
    totalUnusedTickets: zod_1.z.number(),
}));
const CreatorPaymentAnalyticsSchema = exports.registry.register("CreatorPaymentAnalytics", zod_1.z.object({
    totalPayments: zod_1.z.number(),
    successfulPayments: zod_1.z.number(),
    failedPayments: zod_1.z.number(),
    totalRevenue: zod_1.z.number(),
}));
const CreatorEventAnalyticsSchema = exports.registry.register("CreatorEventAnalytics", zod_1.z.object({
    eventId: zod_1.z.string(),
    totalTicketsSold: zod_1.z.number(),
    totalRevenue: zod_1.z.number(),
    totalAttendees: zod_1.z.number(),
    totalUnusedTickets: zod_1.z.number(),
}));
// DASHBOARD
const CreatorDashboardResponseSchema = exports.registry.register("CreatorDashboardResponse", zod_1.z.object({
    totalRevenue: zod_1.z.number(),
    totalTicketsSold: zod_1.z.number(),
    totalEvents: zod_1.z.number(),
    recentActivity: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        amount: zod_1.z.number(),
        quantity: zod_1.z.number(),
        summary: zod_1.z.string(),
        date: zod_1.z.string(),
    })),
}));
const EventeeDashboardResponseSchema = exports.registry.register("EventeeDashboardResponse", zod_1.z.object({
    upcomingEvents: zod_1.z.array(EventSchema),
    recentActivity: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        amount: zod_1.z.number(),
        quantity: zod_1.z.number(),
        summary: zod_1.z.string(),
        date: zod_1.z.string(),
    })),
}));
// NOTIFICATIONS
const CreateReminderRequestSchema = exports.registry.register("CreateReminderRequest", zod_1.z.object({
    eventId: zod_1.z.string(),
    remindAt: zod_1.z.string().datetime(),
}));
const ReminderResponseSchema = exports.registry.register("ReminderResponse", zod_1.z.object({
    id: zod_1.z.string(),
    eventId: zod_1.z.string(),
    remindAt: zod_1.z.string().datetime(),
    createdAt: zod_1.z.string().datetime(),
}));
const CronResponseSchema = exports.registry.register("CronResponse", zod_1.z.object({ message: zod_1.z.string() }));
/**
 * STEP 2 — Register Routes
 */
// ─── AUTH ────────────────────────────────────────────────────────────────────
exports.registry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["Auth"],
    request: {
        body: {
            content: { "application/json": { schema: authValidation_1.registerSchema } },
        },
    },
    responses: {
        201: {
            description: "User registered successfully",
            content: { "application/json": { schema: AuthResponseSchema } },
        },
        400: { description: "Validation error" },
        429: { description: "Too many registration attempts" },
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
            content: { "application/json": { schema: LoginResponseSchema } },
        },
        401: { description: "Invalid credentials" },
        429: { description: "Too many login attempts" },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/refresh",
    tags: ["Auth"],
    description: "Refresh access token using httpOnly refresh cookie",
    responses: {
        200: {
            description: "New access token returned",
            content: { "application/json": { schema: zod_1.z.object({ token: zod_1.z.string() }) } },
        },
        401: { description: "No refresh token or token expired" },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/logout",
    tags: ["Auth"],
    description: "Clear refresh token cookie",
    responses: {
        200: {
            description: "Logged out successfully",
            content: { "application/json": { schema: MessageResponseSchema } },
        },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/change-password",
    tags: ["Auth"],
    description: "Change password for the logged-in user",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        currentPassword: zod_1.z.string(),
                        newPassword: zod_1.z.string().min(6),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Password changed successfully",
            content: { "application/json": { schema: MessageResponseSchema } },
        },
        400: { description: "Current password incorrect or validation error" },
        401: { description: "Unauthorized" },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/reset-password-link",
    tags: ["Auth"],
    description: "Send a password reset link to the user's email",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.object({ email: zod_1.z.string().email() }),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Reset link sent if account exists",
            content: { "application/json": { schema: MessageResponseSchema } },
        },
        429: { description: "Too many requests" },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/auth/reset-password",
    tags: ["Auth"],
    description: "Reset password using the token from the reset link",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        token: zod_1.z.string(),
                        newPassword: zod_1.z.string().min(6),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Password reset successfully",
            content: { "application/json": { schema: MessageResponseSchema } },
        },
        400: { description: "Invalid or expired token" },
        429: { description: "Too many requests" },
    },
});
// ─── EVENTS ──────────────────────────────────────────────────────────────────
exports.registry.registerPath({
    method: "get",
    path: "/events",
    tags: ["Events"],
    description: "Get all events (public)",
    responses: {
        200: {
            description: "List of events",
            content: { "application/json": { schema: zod_1.z.array(EventSchema) } },
        },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/events/today",
    tags: ["Events"],
    description: "Get events happening today — used for guest (walk-in) purchases (public)",
    responses: {
        200: {
            description: "List of today's active events",
            content: { "application/json": { schema: zod_1.z.array(EventSchema) } },
        },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/events/share/{eventId}",
    tags: ["Events"],
    description: "Get shareable event details with cover image and share URL (public)",
    request: {
        params: zod_1.z.object({ eventId: zod_1.z.string().length(24) }),
    },
    responses: {
        200: {
            description: "Event share details",
            content: { "application/json": { schema: ShareEventResponseSchema } },
        },
        404: { description: "Event not found" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/events/{eventId}",
    tags: ["Events"],
    description: "Get a single event by ID (public)",
    request: {
        params: zod_1.z.object({ eventId: zod_1.z.string().length(24) }),
    },
    responses: {
        200: {
            description: "Event details",
            content: { "application/json": { schema: EventSchema } },
        },
        404: { description: "Event not found" },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/events",
    tags: ["Events"],
    security: [{ bearerAuth: [] }],
    description: "Create a new event (Creator only)",
    request: {
        body: {
            content: { "application/json": { schema: CreateEventRequestSchema } },
        },
    },
    responses: {
        201: {
            description: "Event created successfully",
            content: { "application/json": { schema: EventSchema } },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Creator access required" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/events/creator/me",
    tags: ["Events"],
    security: [{ bearerAuth: [] }],
    description: "Get all events created by the logged-in creator",
    responses: {
        200: {
            description: "Creator's events split into active and past",
            content: { "application/json": { schema: CreatorEventsResponseSchema } },
        },
        401: { description: "Unauthorized" },
        403: { description: "Creator access required" },
    },
});
exports.registry.registerPath({
    method: "put",
    path: "/events/{eventId}",
    tags: ["Events"],
    security: [{ bearerAuth: [] }],
    description: "Update an event (Creator only, must own the event)",
    request: {
        params: zod_1.z.object({ eventId: zod_1.z.string().length(24) }),
        body: {
            content: { "application/json": { schema: UpdateEventRequestSchema } },
        },
    },
    responses: {
        200: {
            description: "Event updated successfully",
            content: { "application/json": { schema: EventSchema } },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Creator access required" },
        404: { description: "Event not found" },
    },
});
exports.registry.registerPath({
    method: "delete",
    path: "/events/{eventId}",
    tags: ["Events"],
    security: [{ bearerAuth: [] }],
    description: "Delete an event (Creator only, must own the event)",
    request: {
        params: zod_1.z.object({ eventId: zod_1.z.string().length(24) }),
    },
    responses: {
        200: {
            description: "Event deleted successfully",
            content: { "application/json": { schema: MessageResponseSchema } },
        },
        401: { description: "Unauthorized" },
        403: { description: "Creator access required" },
        404: { description: "Event not found" },
    },
});
// ─── TICKETS ─────────────────────────────────────────────────────────────────
exports.registry.registerPath({
    method: "get",
    path: "/tickets/me",
    tags: ["Tickets"],
    security: [{ bearerAuth: [] }],
    description: "Get all purchased tickets for the logged-in eventee",
    responses: {
        200: {
            description: "Purchased tickets",
            content: { "application/json": { schema: zod_1.z.array(PurchasedTicketSchema) } },
        },
        401: { description: "Unauthorized" },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/tickets/scan",
    tags: ["Tickets"],
    security: [{ bearerAuth: [] }],
    description: "Scan a ticket QR code (Creator only)",
    request: {
        body: {
            content: { "application/json": { schema: ScanTicketRequestSchema } },
        },
    },
    responses: {
        200: {
            description: "Ticket scanned successfully",
            content: { "application/json": { schema: ScanTicketResponseSchema } },
        },
        400: { description: "Invalid or already used ticket" },
        401: { description: "Unauthorized" },
        403: { description: "Only creators can scan tickets" },
        429: { description: "Too many scan attempts" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/tickets/{ticketId}/qr",
    tags: ["Tickets"],
    security: [{ bearerAuth: [] }],
    description: "Retrieve QR payload for a specific ticket (ticket owner only)",
    request: {
        params: zod_1.z.object({ ticketId: zod_1.z.string().length(24) }),
    },
    responses: {
        200: {
            description: "QR payload retrieved successfully",
            content: {
                "application/json": { schema: zod_1.z.object({ qrPayload: zod_1.z.string() }) },
            },
        },
        401: { description: "Unauthorized" },
        404: { description: "Ticket not found" },
        409: { description: "Ticket already used" },
        429: { description: "Too many requests" },
    },
});
// ─── PAYMENTS ────────────────────────────────────────────────────────────────
exports.registry.registerPath({
    method: "post",
    path: "/payments/initialize",
    tags: ["Payments"],
    security: [{ bearerAuth: [] }],
    description: "Initialize a Paystack payment for event tickets (authenticated eventee)",
    request: {
        body: {
            content: { "application/json": { schema: InitializePaymentRequestSchema } },
        },
    },
    responses: {
        200: {
            description: "Payment initialized — redirect user to authorizationUrl",
            content: { "application/json": { schema: InitializePaymentResponseSchema } },
        },
        400: {
            description: "Invalid request (e.g. exceeds maxTicketsPerPurchase, sold out)",
            content: { "application/json": { schema: ErrorResponseSchema } },
        },
        401: { description: "Unauthorized" },
        429: { description: "Too many requests" },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/payments/webhook",
    tags: ["Payments"],
    description: "Paystack webhook — verifies signature and issues tickets on successful payment",
    request: {
        headers: zod_1.z.object({ "x-paystack-signature": zod_1.z.string() }),
    },
    responses: {
        200: { description: "Webhook processed successfully" },
        400: {
            description: "Invalid signature or payload",
            content: { "application/json": { schema: ErrorResponseSchema } },
        },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/payments/resend-ticket/{paymentRef}",
    tags: ["Payments"],
    security: [{ bearerAuth: [] }],
    description: "Resend ticket emails for a completed payment (authenticated, must own the payment)",
    request: {
        params: zod_1.z.object({ paymentRef: zod_1.z.string() }),
    },
    responses: {
        200: {
            description: "Tickets resent successfully",
            content: { "application/json": { schema: MessageResponseSchema } },
        },
        401: { description: "Unauthorized" },
        404: {
            description: "Payment not found",
            content: { "application/json": { schema: ErrorResponseSchema } },
        },
        429: { description: "Too many requests" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/payments/history",
    tags: ["Payments"],
    security: [{ bearerAuth: [] }],
    description: "Get payment history for the logged-in eventee",
    responses: {
        200: {
            description: "Payment history",
            content: { "application/json": { schema: zod_1.z.array(PaymentHistoryItemSchema) } },
        },
        401: { description: "Unauthorized" },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/payments/guest/initialize",
    tags: ["Payments (Guest)"],
    description: "Initialize a payment for unauthenticated (walk-in) attendees. Tickets are emailed after Paystack webhook confirms payment. Rate limited.",
    request: {
        body: {
            content: { "application/json": { schema: GuestInitializePaymentRequestSchema } },
        },
    },
    responses: {
        200: {
            description: "Payment initialized — redirect user to authorizationUrl",
            content: { "application/json": { schema: InitializePaymentResponseSchema } },
        },
        400: {
            description: "Invalid request (e.g. sold out, exceeds limit)",
            content: { "application/json": { schema: ErrorResponseSchema } },
        },
        429: { description: "Too many requests" },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/payments/guest/resend",
    tags: ["Payments (Guest)"],
    description: "Resend tickets to a guest using their email + payment reference. Both must match. Rate limited.",
    request: {
        body: {
            content: { "application/json": { schema: GuestResendRequestSchema } },
        },
    },
    responses: {
        200: {
            description: "Tickets resent to the provided email",
            content: { "application/json": { schema: MessageResponseSchema } },
        },
        400: {
            description: "Email/reference mismatch or payment not found",
            content: { "application/json": { schema: ErrorResponseSchema } },
        },
        429: { description: "Too many requests" },
    },
});
// ─── DASHBOARD ───────────────────────────────────────────────────────────────
exports.registry.registerPath({
    method: "get",
    path: "/creator/dashboard",
    tags: ["Dashboard"],
    security: [{ bearerAuth: [] }],
    description: "Get creator dashboard stats and recent activity (Creator only)",
    responses: {
        200: {
            description: "Creator dashboard data",
            content: { "application/json": { schema: CreatorDashboardResponseSchema } },
        },
        401: { description: "Unauthorized" },
        403: { description: "Creator access required" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/dashboard",
    tags: ["Dashboard"],
    security: [{ bearerAuth: [] }],
    description: "Get eventee dashboard with upcoming events and recent purchases",
    responses: {
        200: {
            description: "Eventee dashboard data",
            content: { "application/json": { schema: EventeeDashboardResponseSchema } },
        },
        401: { description: "Unauthorized" },
    },
});
// ─── ANALYTICS ───────────────────────────────────────────────────────────────
exports.registry.registerPath({
    method: "get",
    path: "/stats/creator",
    tags: ["Analytics"],
    security: [{ bearerAuth: [] }],
    description: "Get all-time aggregate analytics for the logged-in creator",
    responses: {
        200: {
            description: "Creator analytics",
            content: { "application/json": { schema: CreatorAllTimeAnalyticsSchema } },
        },
        401: { description: "Unauthorized" },
        403: { description: "Only creators allowed" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/stats/creator/payments",
    tags: ["Analytics"],
    security: [{ bearerAuth: [] }],
    description: "Get payment analytics for the logged-in creator",
    responses: {
        200: {
            description: "Creator payment analytics",
            content: { "application/json": { schema: CreatorPaymentAnalyticsSchema } },
        },
        401: { description: "Unauthorized" },
        403: { description: "Only creators allowed" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/stats/creator/{eventId}",
    tags: ["Analytics"],
    security: [{ bearerAuth: [] }],
    description: "Get analytics for a specific event (Creator only)",
    request: {
        params: zod_1.z.object({ eventId: zod_1.z.string().length(24) }),
    },
    responses: {
        200: {
            description: "Event analytics",
            content: { "application/json": { schema: CreatorEventAnalyticsSchema } },
        },
        401: { description: "Unauthorized" },
        403: { description: "Only creators allowed" },
        404: {
            description: "Event not found",
            content: { "application/json": { schema: ErrorResponseSchema } },
        },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/stats/eventee/paid",
    tags: ["Analytics"],
    security: [{ bearerAuth: [] }],
    description: "Get events the eventee has paid for",
    responses: {
        200: {
            description: "Paid events",
            content: { "application/json": { schema: zod_1.z.array(EventSchema) } },
        },
        401: { description: "Unauthorized" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/stats/eventee/attended",
    tags: ["Analytics"],
    security: [{ bearerAuth: [] }],
    description: "Get events the eventee has physically attended (ticket scanned)",
    responses: {
        200: {
            description: "Attended events",
            content: { "application/json": { schema: zod_1.z.array(EventSchema) } },
        },
        401: { description: "Unauthorized" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/stats/eventee/unattended",
    tags: ["Analytics"],
    security: [{ bearerAuth: [] }],
    description: "Get paid events the eventee did not attend (ticket unused)",
    responses: {
        200: {
            description: "Unattended events",
            content: { "application/json": { schema: zod_1.z.array(EventSchema) } },
        },
        401: { description: "Unauthorized" },
    },
});
// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
exports.registry.registerPath({
    method: "post",
    path: "/notifications/reminder",
    tags: ["Notifications"],
    security: [{ bearerAuth: [] }],
    description: "Create a reminder for an event",
    request: {
        body: {
            content: { "application/json": { schema: CreateReminderRequestSchema } },
        },
    },
    responses: {
        201: {
            description: "Reminder created successfully",
            content: { "application/json": { schema: ReminderResponseSchema } },
        },
        400: {
            description: "Invalid request",
            content: { "application/json": { schema: ErrorResponseSchema } },
        },
        401: { description: "Unauthorized" },
    },
});
exports.registry.registerPath({
    method: "get",
    path: "/notifications/reminder/me",
    tags: ["Notifications"],
    security: [{ bearerAuth: [] }],
    description: "Get all reminders for the logged-in user",
    responses: {
        200: {
            description: "User reminders",
            content: { "application/json": { schema: zod_1.z.array(ReminderResponseSchema) } },
        },
        401: { description: "Unauthorized" },
    },
});
exports.registry.registerPath({
    method: "post",
    path: "/notifications/internal/run-reminders",
    tags: ["Notifications"],
    description: "Internal cron endpoint — processes and sends due reminders",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Reminders processed",
            content: { "application/json": { schema: CronResponseSchema } },
        },
        401: { description: "Unauthorized" },
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
            title: "Eventify API",
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
