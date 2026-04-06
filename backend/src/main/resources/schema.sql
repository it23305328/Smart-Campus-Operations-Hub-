-- SQL Script for User Registration
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- for local/testing if needed
    role ENUM('USER', 'ADMIN', 'TECHNICIAN') DEFAULT 'USER',
    google_id VARCHAR(255) UNIQUE
);
