Eventful API 

A scalable event management and ticketing REST API built with Node.js, Express, MongoDB, and Paystack integration.

Eventful allows users to create events, purchase tickets, receive reminders, process payments, and manage attendance using QR-based validation.


#Overview

Eventful is a backend-first event ticketing system designed with:

Clean route structure

Strong validation rules

Role-based access control

Background reminder workers

Secure payment verification (Paystack)

QR-based ticket generation

Modular architecture

Production-ready API design

This project emphasizes:

Data integrity

Security

Strict request validation

Separation of concerns

Real-world scalability considerations


#Tech Stack

Node.js

Express.js

MongoDB + Mongoose

TypeScript

Paystack (Payment Gateway)

Node-Cron (Worker Jobs)

QR Code Generation

JWT-based authentication

Role-based middleware



#Requirements

Before running the project, ensure you have:

Node.js (v18+ recommended)

MongoDB (local or cloud e.g., Atlas)

Paystack test keys

LocalTunnel (for webhook testing)

npm or yarn


#Create a .env file in the root:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
PAYSTACK_SECRET_KEY=your_paystack_secret
PAYSTACK_CALLBACK_URL=http://localhost:4000/paystack/callback
FRONTEND_URL=http://localhost:4000
JWT_SECRET=Jwt_secret
JWT_EXPIRES_IN=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=email_adress
EMAIL_FROM=email_name
EMAIL_PASS=yourEmailPass
REDIS_URL=redis://localhost:6379

#LocalTunnel Requirement (Webhook Important)

Paystack needs a publicly accessible URL to send webhook events.

You must expose port 4000 specifically for the payment webhook.

Start your server on port 4000 and run:

lt --port 4000

Use the generated public URL as your Paystack webhook URL:

https://your-url.loca.lt/payments/webhook

Without this, Paystack verification will fail locally.

#API Route Structure

All routes are prefixed logically by domain responsibility:
/auth
/events
/tickets
/payments
/analytics
/notifications

#Authentication Routes (/auth)
Method	Route	        Description
POST	/auth/register	Register new user
POST	/auth/login	    Login user
POST	/auth/logout	Logout user

Authentication is JWT-based.

#Event Routes (/events)
Method	Route	    Description
POST	/events	    Create event (Creator only)
GET	    /events	    Get all available events
GET	    /events/:id	Get single event
PUT	    /events/:id	Update event (Creator only)
DELETE	/events/:id	Delete event (Creator only)

Includes:

Ticket limits

Date validation

Ownership enforcement

#Ticket Routes (/tickets)
Method	Route	                Description
GET	    /tickets/me	            Get user's tickets
GET	    /tickets/:ticketId/qr	Get ticket qrPayload 
POST	/tickets/scan	        Scan ticket (Mark as used)(CREATOR)

Features:

QR code generation
Duplicate prevention
Scan validation
Attendance tracking
isScanned filtering


#Payment Routes (/payments)
Method	    Route	                            Description
POST	    /payments/initialize	            Initialize Paystack payment
POST	    /payments/webhook	                Paystack webhook endpoint
GET	        /payments/resend-ticket/:paymentRef	Resend purchased ticket manually

Payment Flow:
User selects ticket quantity
Payment initialized
User pays via Paystack
Paystack sends webhook
Webhook verifies signature
Ticket is created only after successful verification
QR code generated

Security Measures:
Signature verification
Reference validation
Payment status enforcement
Idempotent handling

#Analytics Routes (/analytics)
Method	 Route	                            Description
GET	    /analytics/creator/:eventId	        Single Event performance
GET	    /analytics/creator	                Creator Alltime stats
GET     /analytics/creator/payments         Total verfied Payments
GET     /analytics/eventee/paid             Total event payments
GET     /analytics/eventee/attended         Total event attended
GET     /analytics/eventee/unattended       Total event paid for but unattended
Includes:
Ticket sales count
Revenue tracking
Attendance rate
Scanned vs unscanned ratio


#Notification Routes (/notifications)
Method	 Route	                            Description
POST    /notifications/reminder             Users create a reminder for an event
GET     /notifications/reminder/me          Users get all sent reminders 

Used internally by worker jobs.
Includes:
Event reminders
Email scheduling
Background processing


#Background Workers
Implemented using node-cron.
Worker checks every minute for:
Upcoming reminders set
Unsent notifications

Important:
Workers must have database access.
They can be hosted separately from the main API if needed.


#Validation Philosophy (Very Important)
Validation is strict and intentional.

POST requests:
Fully validated
All required fields enforced
Type checking applied
Business logic validation included

PUT:
Allows partial updates
Still validates field types
Prevents invalid state mutations

Additional Validation Layers:
Role-based access checks
Ownership checks
Date sanity checks
Ticket quantity
Payment verification checks
Scan status verification
Duplicate transaction prevention
No route trusts client input blindly.


#Role-Based Access
Two roles:
User (Eventee)
Creator

Middleware ensures:
Only creators can create events
Only ticket owners can view only their tickets
Only event creators can see event ticket lists
Only event creators can scan tickets


#Architectural Design Decisions
Modular folder structure
Controller-service separation
Middleware-based validation
Environment-driven configuration
Clean REST semantics
Resource-based routing
Background task isolation
Webhook security-first approach


#Testing Considerations
Use Postman or Thunder Client
Use Paystack test keys
Use LocalTunnel for webhook testing
Test duplicate payment attempts
Test scan edge cases
Test expired events


#Future Improvements

Pagination for:
Viewing tickets
Viewing events
Attended events

Caching layer (Redis)

Event search & filtering

File/image uploads for events

Full frontend integration


Running Locally

Install dependencies:

npm install


Run development server:

npm run dev


For webhook testing:
npm run dev
lt --port 4000 in a seperate terminal
copy given url and paste in paystack dashboard (example:https://your-url.loca.lt/payments/webhook)


Author conclusion
Built as a backend-focused production-style event system demonstrating:
API architecture
Payment integration
Secure webhook handling
Background processing
Real-world business logic enforcement