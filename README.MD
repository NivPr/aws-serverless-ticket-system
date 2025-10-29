# AWS CDK – User Authentication & Ticket Management

A serverless backend built with **AWS CDK**, providing user authentication and ticket management APIs.  
All infrastructure is defined as code, including **API Gateway**, **Lambda**, **Cognito**, **DynamoDB**, and IAM roles.

## Features
- **Auth API** – Sign up, log in, and verify users.
- **Ticket API** – Create, edit, delete, search, and retrieve tickets (Cognito-protected).
- **Secure Access** – Ticket routes require a valid JWT from Cognito.
- **Persistent Storage** – Tickets stored in DynamoDB.
- **Infrastructure as Code** – Fully managed via AWS CDK.

## API Endpoints

### Auth API (`/auth`)
| Endpoint           | Method | Auth | Description          |
|--------------------|--------|------|----------------------|
| `/auth/signUp`     | POST   | No   | Register a new user  |
| `/auth/login`      | POST   | No   | Log in a user        |
| `/auth/verifyCode` | POST   | No   | Verify sign-up code  |

### Ticket API (`/tickets`)
| Endpoint                 | Method | Auth | Description             |
|--------------------------|--------|------|-------------------------|
| `/tickets/addTicket`     | POST   | Yes  | Create a new ticket     |
| `/tickets/editTicket`    | PUT    | Yes  | Update an existing ticket |
| `/tickets/delete`        | DELETE | Yes  | Delete a ticket         |
| `/tickets/searchByTitle` | GET    | Yes  | Search tickets by title |
| `/tickets/{id}`          | GET    | Yes  | Get ticket by ID        |

## Tech Stack
- **AWS Lambda** – Business logic for auth and tickets.
- **Amazon API Gateway** – REST APIs with logging and CORS.
- **Amazon Cognito** – Authentication and JWT issuance.
- **Amazon DynamoDB** – Ticket storage.
- **AWS CDK** – Infrastructure as code.

## Deployment
**Prerequisites:** Node.js, AWS CLI, AWS CDK installed and configured.

```bash
npm install
cdk bootstrap
cdk deploy
# aws-serverless-ticket-system
