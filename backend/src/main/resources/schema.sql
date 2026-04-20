-- SQL Script for User Registration
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- for local/testing if needed
    role ENUM('USER', 'ADMIN', 'TECHNICIAN') DEFAULT 'USER',
    google_id VARCHAR(255) UNIQUE
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
