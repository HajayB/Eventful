Eventful API

A production-style event management and ticketing REST API built with Node.js, Express, MongoDB, and Paystack.

Eventful enables event creation, secure ticket purchasing, QR-based validation, analytics tracking, and automated reminders — designed with real-world scalability and security considerations.

#Overview

Eventful is a backend-first event ticketing system focused on:

Secure payment processing (Paystack + webhook verification)

Role-based access control (Creator / Eventee)

QR-based ticket generation and scan validation

Background reminder processing (cron workers)

Strict validation and business rule enforcement

Idempotent webhook handling

Modular, production-ready architecture

This project emphasizes real-world backend engineering practices:

Data integrity

Security-first design

Clean REST semantics

Separation of concerns

Environment-driven configuration

#Architecture

#Route Domains
All routes are logically separated by responsibility:

/auth
/events
/tickets
/payments
/analytics
/notifications


Controller-service separation is enforced to keep business logic isolated from transport logic.
Background workers are isolated from the main API process and require database access.

#Tech Stack

Node.js (v18+)

Express.js

TypeScript

MongoDB + Mongoose

JWT Authentication

Paystack (Payment Gateway)

Node-Cron (Background Jobs)

QR Code generation

Role-based Middleware

Environment Variables

Create a .env file in the root directory:

PORT=4000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret
JWT_EXPIRES_IN=30d

PAYSTACK_SECRET_KEY=your_paystack_secret
PAYSTACK_CALLBACK_URL=http://localhost:4000/payments/webhook

RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_verified_sender_email

CRON_SECRET=your_internal_worker_secret

#Payment Flow (Secure & Idempotent)

User selects ticket quantity

/payments/initialize creates a Paystack transaction

User completes payment

Paystack sends a webhook to /payments/webhook

Webhook signature is verified

Payment status is confirmed

Ticket is created only after successful verification

QR code payload is generated

#Security measures:

Signature verification

Reference validation

Payment status enforcement

Duplicate transaction prevention

Idempotent webhook handling (duplicate callbacks do not generate duplicate tickets)

#Authentication & Authorization
JWT-based authentication.

Two roles:

User (Eventee)

Creator

Role enforcement ensures:

Only creators can create/update/delete events

Only ticket owners can view their tickets

Only event creators can scan tickets

Ownership checks are enforced at route level

No route trusts client input blindly.

#Validation Philosophy
POST Requests

Fully validated

Required fields enforced

Type checking applied

Business logic rules validated

PUT Requests

Partial updates allowed

Field types validated

Invalid state transitions prevented

Additional validation layers include:

Date sanity checks

Ticket quantity enforcement

Scan state validation

Duplicate transaction prevention

Role and ownership checks

#Core Features
#Events

Create, update, delete (Creator only)

Ticket limits

Date validation

Ownership enforcement

#Tickets

QR payload generation

Duplicate prevention

Attendance tracking

Scan validation

isScanned filtering

#Payments

Secure Paystack integration

Webhook verification

Manual ticket resend endpoint

#Analytics

Event performance metrics

Revenue tracking

Attendance rate calculation

Creator lifetime stats

Eventee participation stats

#Notifications

Event reminder scheduling

Background reminder processing

Manual worker trigger endpoint

Internal reminder endpoint requires:

x-cron-secret: <CRON_SECRET>


Requests without this header are rejected.

#Background Workers

Implemented using node-cron.

Worker checks every minute for:

Upcoming reminders

Unsent notifications

Workers can be deployed separately (e.g., background service on Render, Railway, etc.) as long as they share database access.

#Webhook Testing (Local Development)

Paystack requires a public URL to deliver webhooks.

Expose your server:

lt --port 4000


Use the generated URL:

https://your-url.loca.lt/payments/webhook


Add this to your Paystack dashboard.

Without a public webhook endpoint, payment verification will fail locally.

#Testing Strategy

Recommended tools:

Postman / Thunder Client

Paystack test keys

LocalTunnel for webhook simulation

Edge cases to test:

Duplicate webhook calls

Expired events

Scan attempts on used tickets

Invalid signature attempts

Partial update validation

#Future Improvements

Pagination for events and tickets

Search & filtering

Image uploads for events

Caching layer

Full frontend integration

#Running Locally

Install dependencies:

npm install


Start development server:

npm run dev

#Project Focus

This project demonstrates:

RESTful API architecture

Secure payment integration

Webhook verification best practices

Role-based access control

Background task processing

Real-world business logic enforcement