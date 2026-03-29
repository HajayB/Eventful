import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registerSchema } from "../validation/authValidation";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

/**
 * STEP 1 — Define Schemas
 */

const ErrorResponseSchema = registry.register(
  "ErrorResponse",
  z.object({
    message: z.string(),
  })
);

// AUTH
const AuthResponseSchema = registry.register(
  "AuthResponse",
  z.object({
    token: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(["CREATOR", "EVENTEE"]),
    }),
  })
);

const LoginResponseSchema = registry.register(
  "LoginResponse",
  z.object({
    user: z.object({
      _id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(["CREATOR", "EVENTEE"]),
      createdAt: z.string(),
    }),
    token: z.string(),
  })
);

// EVENTS
const EventSchema = registry.register(
  "Event",
  z.object({
    _id: z.string(),
    creatorId: z.string(),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    price: z.number(),
    totalTickets: z.number(),
    ticketsSold: z.number(),
    coverImage: z.string().optional(),
    maxTicketsPerPurchase: z.number(),
    createdAt: z.string().datetime(),
  })
);

const ShareEventResponseSchema = registry.register(
  "ShareEventResponse",
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    startTime: z.string().datetime(),
    location: z.string(),
    price: z.number(),
    coverImage: z.string(),
    shareUrl: z.string(),
  })
);

const CreateEventRequestSchema = registry.register(
  "CreateEventRequest",
  z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    price: z.number(),
    totalTickets: z.number(),
    coverImage: z.string().optional(),
    maxTicketsPerPurchase: z.number().optional(),
  })
);

const UpdateEventRequestSchema = registry.register(
  "UpdateEventRequest",
  z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    price: z.number().optional(),
    totalTickets: z.number().optional(),
    coverImage: z.string().optional(),
    maxTicketsPerPurchase: z.number().optional(),
  })
);

const CreatorEventsResponseSchema = registry.register(
  "CreatorEventsResponse",
  z.object({
    CurrentEvents: z.object({
      activeEvents: z.array(EventSchema),
      pastEvents: z.array(EventSchema),
    }),
  })
);

// TICKETS
const TicketEventSchema = registry.register(
  "TicketEvent",
  z.object({
    _id: z.string(),
    title: z.string(),
    location: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    price: z.number(),
  })
);

const PurchasedTicketSchema = registry.register(
  "PurchasedTicket",
  z.object({
    _id: z.string(),
    eventId: TicketEventSchema,
    paymentRef: z.string(),
    isScanned: z.boolean(),
    createdAt: z.string().datetime(),
    status: z.enum(["UNUSED", "USED"]),
    hasQr: z.boolean(),
  })
);

const ScanTicketRequestSchema = registry.register(
  "ScanTicketRequest",
  z.object({
    qrPayload: z.string(),
    eventId: z.string(),
  })
);

const ScanTicketResponseSchema = registry.register(
  "ScanTicketResponse",
  z.object({
    valid: z.boolean(),
    status: z.enum(["USED", "UNUSED"]),
    message: z.string(),
    ticketId: z.string(),
    scannedAt: z.string().datetime(),
  })
);

// PAYMENTS
const InitializePaymentRequestSchema = registry.register(
  "InitializePaymentRequest",
  z.object({
    eventId: z.string().length(24),
    quantity: z.number().min(1),
    email: z.string().email(),
  })
);

const InitializePaymentResponseSchema = registry.register(
  "InitializePaymentResponse",
  z.object({
    authorizationUrl: z.string(),
    paymentRef: z.string(),
  })
);

const GuestInitializePaymentRequestSchema = registry.register(
  "GuestInitializePaymentRequest",
  z.object({
    eventId: z.string().length(24),
    quantity: z.number().min(1),
    email: z.string().email(),
  })
);

const GuestResendRequestSchema = registry.register(
  "GuestResendRequest",
  z.object({
    email: z.string().email(),
    reference: z.string(),
  })
);

const PaymentHistoryItemSchema = registry.register(
  "PaymentHistoryItem",
  z.object({
    _id: z.string(),
    reference: z.string(),
    amount: z.number(),
    quantity: z.number(),
    status: z.enum(["SUCCESS", "PENDING", "FAILED"]),
    paidAt: z.string().datetime(),
    event: z.object({
      _id: z.string(),
      title: z.string(),
      location: z.string(),
      startTime: z.string().datetime(),
    }),
  })
);

const MessageResponseSchema = registry.register(
  "MessageResponse",
  z.object({ message: z.string() })
);

// ANALYTICS
const CreatorAllTimeAnalyticsSchema = registry.register(
  "CreatorAllTimeAnalytics",
  z.object({
    totalTicketsSold: z.number(),
    totalRevenue: z.number(),
    totalAttendees: z.number(),
    totalUnusedTickets: z.number(),
  })
);

const CreatorPaymentAnalyticsSchema = registry.register(
  "CreatorPaymentAnalytics",
  z.object({
    totalPayments: z.number(),
    successfulPayments: z.number(),
    failedPayments: z.number(),
    totalRevenue: z.number(),
  })
);

const CreatorEventAnalyticsSchema = registry.register(
  "CreatorEventAnalytics",
  z.object({
    eventId: z.string(),
    totalTicketsSold: z.number(),
    totalRevenue: z.number(),
    totalAttendees: z.number(),
    totalUnusedTickets: z.number(),
  })
);

// DASHBOARD
const CreatorDashboardResponseSchema = registry.register(
  "CreatorDashboardResponse",
  z.object({
    totalRevenue: z.number(),
    totalTicketsSold: z.number(),
    totalEvents: z.number(),
    recentActivity: z.array(
      z.object({
        title: z.string(),
        amount: z.number(),
        quantity: z.number(),
        summary: z.string(),
        date: z.string(),
      })
    ),
  })
);

const EventeeDashboardResponseSchema = registry.register(
  "EventeeDashboardResponse",
  z.object({
    upcomingEvents: z.array(EventSchema),
    recentActivity: z.array(
      z.object({
        title: z.string(),
        amount: z.number(),
        quantity: z.number(),
        summary: z.string(),
        date: z.string(),
      })
    ),
  })
);

// NOTIFICATIONS
const CreateReminderRequestSchema = registry.register(
  "CreateReminderRequest",
  z.object({
    eventId: z.string(),
    remindAt: z.string().datetime(),
  })
);

const ReminderResponseSchema = registry.register(
  "ReminderResponse",
  z.object({
    id: z.string(),
    eventId: z.string(),
    remindAt: z.string().datetime(),
    createdAt: z.string().datetime(),
  })
);

const CronResponseSchema = registry.register(
  "CronResponse",
  z.object({ message: z.string() })
);


/**
 * STEP 2 — Register Routes
 */

// ─── AUTH ────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: registerSchema } },
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

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
            password: z.string().min(6),
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

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  description: "Refresh access token using httpOnly refresh cookie",
  responses: {
    200: {
      description: "New access token returned",
      content: { "application/json": { schema: z.object({ token: z.string() }) } },
    },
    401: { description: "No refresh token or token expired" },
  },
});

registry.registerPath({
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

registry.registerPath({
  method: "post",
  path: "/auth/change-password",
  tags: ["Auth"],
  description: "Change password for the logged-in user",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            currentPassword: z.string(),
            newPassword: z.string().min(6),
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

registry.registerPath({
  method: "post",
  path: "/auth/reset-password-link",
  tags: ["Auth"],
  description: "Send a password reset link to the user's email",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ email: z.string().email() }),
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

registry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["Auth"],
  description: "Reset password using the token from the reset link",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            token: z.string(),
            newPassword: z.string().min(6),
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

registry.registerPath({
  method: "get",
  path: "/events",
  tags: ["Events"],
  description: "Get all events (public)",
  responses: {
    200: {
      description: "List of events",
      content: { "application/json": { schema: z.array(EventSchema) } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/events/today",
  tags: ["Events"],
  description: "Get events happening today — used for guest (walk-in) purchases (public)",
  responses: {
    200: {
      description: "List of today's active events",
      content: { "application/json": { schema: z.array(EventSchema) } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/events/share/{eventId}",
  tags: ["Events"],
  description: "Get shareable event details with cover image and share URL (public)",
  request: {
    params: z.object({ eventId: z.string().length(24) }),
  },
  responses: {
    200: {
      description: "Event share details",
      content: { "application/json": { schema: ShareEventResponseSchema } },
    },
    404: { description: "Event not found" },
  },
});

registry.registerPath({
  method: "get",
  path: "/events/{eventId}",
  tags: ["Events"],
  description: "Get a single event by ID (public)",
  request: {
    params: z.object({ eventId: z.string().length(24) }),
  },
  responses: {
    200: {
      description: "Event details",
      content: { "application/json": { schema: EventSchema } },
    },
    404: { description: "Event not found" },
  },
});

registry.registerPath({
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

registry.registerPath({
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

registry.registerPath({
  method: "put",
  path: "/events/{eventId}",
  tags: ["Events"],
  security: [{ bearerAuth: [] }],
  description: "Update an event (Creator only, must own the event)",
  request: {
    params: z.object({ eventId: z.string().length(24) }),
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

registry.registerPath({
  method: "delete",
  path: "/events/{eventId}",
  tags: ["Events"],
  security: [{ bearerAuth: [] }],
  description: "Delete an event (Creator only, must own the event)",
  request: {
    params: z.object({ eventId: z.string().length(24) }),
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

registry.registerPath({
  method: "get",
  path: "/tickets/me",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  description: "Get all purchased tickets for the logged-in eventee",
  responses: {
    200: {
      description: "Purchased tickets",
      content: { "application/json": { schema: z.array(PurchasedTicketSchema) } },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
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

registry.registerPath({
  method: "get",
  path: "/tickets/{ticketId}/qr",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  description: "Retrieve QR payload for a specific ticket (ticket owner only)",
  request: {
    params: z.object({ ticketId: z.string().length(24) }),
  },
  responses: {
    200: {
      description: "QR payload retrieved successfully",
      content: {
        "application/json": { schema: z.object({ qrPayload: z.string() }) },
      },
    },
    401: { description: "Unauthorized" },
    404: { description: "Ticket not found" },
    409: { description: "Ticket already used" },
    429: { description: "Too many requests" },
  },
});

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

registry.registerPath({
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

registry.registerPath({
  method: "post",
  path: "/payments/webhook",
  tags: ["Payments"],
  description: "Paystack webhook — verifies signature and issues tickets on successful payment",
  request: {
    headers: z.object({ "x-paystack-signature": z.string() }),
  },
  responses: {
    200: { description: "Webhook processed successfully" },
    400: {
      description: "Invalid signature or payload",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/payments/resend-ticket/{paymentRef}",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  description: "Resend ticket emails for a completed payment (authenticated, must own the payment)",
  request: {
    params: z.object({ paymentRef: z.string() }),
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

registry.registerPath({
  method: "get",
  path: "/payments/history",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  description: "Get payment history for the logged-in eventee",
  responses: {
    200: {
      description: "Payment history",
      content: { "application/json": { schema: z.array(PaymentHistoryItemSchema) } },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
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

registry.registerPath({
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

registry.registerPath({
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

registry.registerPath({
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

registry.registerPath({
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

registry.registerPath({
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

registry.registerPath({
  method: "get",
  path: "/stats/creator/{eventId}",
  tags: ["Analytics"],
  security: [{ bearerAuth: [] }],
  description: "Get analytics for a specific event (Creator only)",
  request: {
    params: z.object({ eventId: z.string().length(24) }),
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

registry.registerPath({
  method: "get",
  path: "/stats/eventee/paid",
  tags: ["Analytics"],
  security: [{ bearerAuth: [] }],
  description: "Get events the eventee has paid for",
  responses: {
    200: {
      description: "Paid events",
      content: { "application/json": { schema: z.array(EventSchema) } },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/stats/eventee/attended",
  tags: ["Analytics"],
  security: [{ bearerAuth: [] }],
  description: "Get events the eventee has physically attended (ticket scanned)",
  responses: {
    200: {
      description: "Attended events",
      content: { "application/json": { schema: z.array(EventSchema) } },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/stats/eventee/unattended",
  tags: ["Analytics"],
  security: [{ bearerAuth: [] }],
  description: "Get paid events the eventee did not attend (ticket unused)",
  responses: {
    200: {
      description: "Unattended events",
      content: { "application/json": { schema: z.array(EventSchema) } },
    },
    401: { description: "Unauthorized" },
  },
});

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

registry.registerPath({
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

registry.registerPath({
  method: "get",
  path: "/notifications/reminder/me",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  description: "Get all reminders for the logged-in user",
  responses: {
    200: {
      description: "User reminders",
      content: { "application/json": { schema: z.array(ReminderResponseSchema) } },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
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

export const generateOpenAPIDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

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
