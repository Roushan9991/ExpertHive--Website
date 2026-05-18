CREATE DATABASE IF NOT EXISTS agriexpert_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agriexpert_connect;

CREATE TABLE IF NOT EXISTS `students` (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(32) NOT NULL DEFAULT 'student',
  registeredAt VARCHAR(255) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'active',
  lastUpdated VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `experts` (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  experience VARCHAR(255) NOT NULL,
  fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  location VARCHAR(255) NOT NULL,
  expertEmail VARCHAR(255) NOT NULL UNIQUE,
  ownerEmail VARCHAR(255) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  imageUrl LONGTEXT,
  availableSlots TEXT,
  description TEXT,
  createdAt VARCHAR(255) NOT NULL,
  approvedAt VARCHAR(255),
  rejectedAt VARCHAR(255),
  deletedAt VARCHAR(255),
  lastUpdated VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
