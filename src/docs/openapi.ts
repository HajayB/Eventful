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

//REGISTER 
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
//LOGIN
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
//GET ALL EVENTS  
const EventResponseSchema = registry.register(
    "EventListResponse",
    z.object({
        _id: z.string(),
        creatorId: z.string(),
        title: z.string(),
    description: z.string(),
    location: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    price: z.number(),
    totalTickets: z.number(),
    ticketsSold: z.number(),
    createdAt: z.date(),
    })
)
//GET SINGLE EVENT
const SingleEventResponseSchema = registry.register(
    "SingleEventResponse",
    z.object({
        _id: z.string(),
        creatorId: z.string(),
        title: z.string(),
    description: z.string(),
    location: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    price: z.number(),
    totalTickets: z.number(),
    ticketsSold: z.number(),
    createdAt: z.date(),
    })
)
//GET EVENT SHARE LINK
const shareEventResponseSchema = registry.register(
    "ShareEventResponse",
    z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        startTime: z.date(),
        location: z.string(),
        price: z.number(),
        coverImage: z.string(),
        shareUrl: z.string(),
    })
)
//(CREATOR) CREATE EVENT

const createEventRequestSchema = registry.register(
  "CreateEventRequest",
  z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    price: z.number(),
    totalTickets: z.number(),
  })
)
const createEventResponseSchema = registry.register(
    "CreateEventResponse",
    z.object({
      message:z.string(),
      id: z.string(),
      creatorId: z.string(),
      title: z.string(),
      description: z.string(),
      location: z.string(),
      startTime: z.date(),
      endTime: z.date(),
      price: z.number(),
      totalTickets: z.number(),
      ticketsSold: z.number(),
      createdAt: z.string(),
    })
)
//(CREATOR)EDITS EVENT
const EditEventRequestSchema = registry.register(
  "CreateEventRequest",
  z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    price: z.number(),
    totalTickets: z.number(),
  })
)
const EditEventResponseSchema = registry.register(
  "CreateEventResponse",
  z.object({
    message:z.string(),
    id: z.string(),
    creatorId: z.string(),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    price: z.number(),
    totalTickets: z.number(),
    ticketsSold: z.number(),
    createdAt: z.string(),
  })
)
//(CREATOR)DELETE EVENT
const DeleteEventResponseSchema = registry.register(
  "CreateEventResponse",
  z.object({
    message:z.string(),
  })
)  

//(CREATOR)GET ALL CREATED EVENTS
const CreatedEventsResponseSchema = registry.register(
  "CreatedEventResponse",
  z.object({
    _id: z.string(),
    creatorId: z.string(),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    price: z.number(),
    totalTickets: z.number(),
    ticketsSold: z.number(),
    createdAt: z.string(),
  })
)
//EVENTID SCHEMA
const TicketEventSchema = registry.register(
  "TicketEvent",
  z.object({
    _id: z.string(),
    title: z.string(),
    location: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    price: z.number(),
  })
);

//(EVENTEE)GET ALL PURCHASED TICKETS
const PurchasedTicketsResponseSchema = registry.register(
  "PurchasedTicketsResponse",
  z.object({
    _id: z.string(),
    eventId: TicketEventSchema,
    paymentRef: z.string(),
    isScanned: z.boolean(),
    createdAt: z.string().datetime(),
    status: z.enum(["UNUSED", "USED"]),
    hasQr: z.boolean(),
  })
)
//(CREATOR)SCAN PURCHASED TICKETS
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
const ScanTicketRequestSchema = registry.register(
  "ScanTicketRequest",
  z.object({
    qrPayload: z.string(),
    eventId:z.string()
  })
);

//(EVENTEE)PAYMENT
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
//(EVENTEE) RESEND TICKET TO EMAIL
const ResendTicketResponseSchema = registry.register(
  "ResendTicketResponse",
  z.object({
    message: z.string(),
  })
);
//(CREATOR) ANALYTICS ALL TIME 
const CreatorAllTimeAnalyticsSchema = registry.register(
  "CreatorAllTimeAnalytics",
  z.object({
    totalTicketsSold: z.number(),
    totalRevenue: z.number(),
    totalAttendees: z.number(),
    totalUnusedTickets: z.number(),
  })
);

//(CREATOR) PAYMENT ANALYTICS ALL TIME 
const CreatorPaymentAnalyticsSchema = registry.register(
  "CreatorPaymentAnalytics",
  z.object({
    totalPayments: z.number(),
    successfulPayments: z.number(),
    failedPayments: z.number(),
    totalRevenue: z.number(),
  })
);

//(CREATOR) SINGLE EVENT ANALYTICS
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

//NOTIFICATIONS SCHEMA 

const createReminderSchema = registry.register(
  "ReminderRequest",
  z.object({
    eventId:z.string(),
    remindAt:z.date()
  })
)
const ReminderResponseSchema = registry.register(
  "ReminderResponse",
  z.object({
    id: z.string(),
    eventId: z.string(),
    remindAt: z.date(),
    createdAt: z.date(),
  })
);

const cronResponseSchema = registry.register(
  "cronResponse",
  z.object({
    message:z.string(),
  })
);

/**
 * STEP 2 — Register Routes
 */
//AUTH
registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
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
  registry.registerPath({
    method: "get",
    path: "/events",
    tags: ["Events"],
    responses: {
      200: {
        description: "List of events",
        content: {
          "application/json": {
            schema: z.array(EventResponseSchema),
          },
        },
      },
    },
  });
  registry.registerPath({
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

  registry.registerPath({
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


  registry.registerPath({
    method: "post",
    path: "/events",
    tags: ["Events"],
    security: [{ bearerAuth: [] }],  // 🔐 requires login
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
  
  registry.registerPath({
    method: "put",
    path: "/events/{eventId}",
    tags: ["Events"],
    security: [{ bearerAuth: [] }],  // 🔐 requires login
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
  registry.registerPath({
    method: "delete",
    path: "/events/{eventId}",
    tags: ["Events"],
    security: [{ bearerAuth: [] }],  // 🔐 requires login
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
  registry.registerPath({
    method: "get",
    path: "/events/creator/me",
    tags: ["Events"],
    security: [{ bearerAuth: [] }],  // 🔐 requires login
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
registry.registerPath({
  method: "get",
  path: "/tickets/me",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],  // 🔐 requires login
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

registry.registerPath({
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

registry.registerPath({
  method: "get",
  path: "/tickets/{ticketId}/qr",
  tags: ["Tickets"],
  description: "Retrieve QR payload for a specific ticket",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      ticketId: z.string().length(24),
    }),
  },
  responses: {
    200: {
      description: "QR payload retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            qrPayload: z.string(),
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

registry.registerPath({
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

registry.registerPath({
  method: "post",
  path: "/payments/webhook",
  tags: ["Payments"],
  description: "Paystack webhook endpoint",
  request: {
    headers: z.object({
      "x-paystack-signature": z.string(),
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


registry.registerPath({
  method: "post",
  path: "/payments/resend-ticket/{paymentRef}",
  tags: ["Payments"],
  description: "Resend ticket email using payment reference",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      paymentRef: z.string(),
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
registry.registerPath({
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

registry.registerPath({
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

registry.registerPath({
  method: "get",
  path: "/analytics/creator/{eventId}",
  tags: ["Analytics"],
  description: "Get analytics for a specific event",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      eventId: z.string().length(24),
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
registry.registerPath({
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
          schema: z.array(SingleEventResponseSchema),
        },
      },
    },
    401: { description: "Unauthorized" },
  },
});


registry.registerPath({
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
          schema: z.array(SingleEventResponseSchema),
        },
      },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
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
          schema: z.array(SingleEventResponseSchema),
        },
      },
    },
    401: { description: "Unauthorized" },
  },
});


//NOTIFICATIONS 
registry.registerPath({
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

registry.registerPath({
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
          schema: z.array(ReminderResponseSchema),
        },
      },
    },
    401: {
      description: "Unauthorized",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/notifications/internal/run-reminders",
  tags: ["Notifications"],
  description: "Run worker for reminders",
  security: [{ bearerAuth: [] }, {xCronSecret:[]}],
  responses: {
    200: {
      description: "Reminders processed",
      content: {
        "application/json": {
          schema: z.array(cronResponseSchema),
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

export const generateOpenAPIDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

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
