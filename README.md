# CostPerDemo

CostPerDemo is a web application designed to provide clients with a secure platform to view and analyze the statistics of various marketing campaigns run on their behalf. It integrates user authentication, an admin panel for user management, and leverages the SmartLead API for fetching detailed campaign statistics.

## Overview

The application is built on a Node.js backend using the Express framework, with MongoDB as the database and Mongoose ORM for data modeling. The frontend utilizes EJS for templating, Bootstrap for styling, and vanilla JavaScript. The architecture is divided into a backend responsible for authentication, user management, and API communication, a frontend providing user interfaces, and a database storing user data and campaign IDs.

## Features

- **User Authentication**: Secure login mechanism with password change capabilities.
- **Admin Panel**: Admin control for user account management and campaign ID association.
- **Campaign Statistics Viewing**: Enables users to select campaigns and view their statistics in table and graph formats.

## Getting started

### Requirements

- Node.js
- MongoDB
- A SmartLead API key

### Quickstart

1. Clone the repository to your local machine.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and fill in your database URL, session secret, and SmartLead API key.
4. Start the application with `npm start`. The server will run on the port specified in your `.env` file.

### License

Copyright (c) 2024.# cpdadmin
