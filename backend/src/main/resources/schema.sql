-- SQL Script for User Registration
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- for local/testing if needed
    role ENUM('USER', 'ADMIN', 'TECHNICIAN') DEFAULT 'USER',
    google_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    last_login TIMESTAMP,
    ip_address VARCHAR(100),
    phone_number VARCHAR(20)
);


-- Member 1: Facilities Table
CREATE TABLE IF NOT EXISTS resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    capacity INT,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, OUT_OF_SERVICE
    availability_windows TEXT -- වැඩ කරන වේලාවන් (JSON string එකක් විදිහට)
);

-- Basic Bookings table for Analytics Innovation
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, CANCELLED
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 1. Incident Tickets Table (Category, Priority, and Workflow included)
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT,
    reporter_id BIGINT,
    category VARCHAR(100),
    description TEXT,
    priority VARCHAR(50), -- LOW, MEDIUM, HIGH
    contact_details VARCHAR(255), -- Preferred contact details [cite: 39]
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED [cite: 41]
    rejection_reason TEXT,
    technician_id BIGINT, -- Assigned technician 
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    FOREIGN KEY (reporter_id) REFERENCES users(id)
);

-- 2. Attachments (Up to 3 images per ticket) 
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT,
    image_url VARCHAR(255),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

-- 3. Comments System (Ownership rules applied) 
CREATE TABLE IF NOT EXISTS ticket_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT,
    user_id BIGINT,
    comment_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);