-- Script para la Base de Datos: Sistema de Reserva de Espacios (MySQL)
-- Puedes ejecutar este script directamente en HeidiSQL

CREATE DATABASE IF NOT EXISTS `reserva_espacios` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `reserva_espacios`;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- Se guardarán las contraseñas en texto claro o hash simple por ahora para facilidad
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `role` ENUM('admin', 'student') NOT NULL DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Encargados
CREATE TABLE IF NOT EXISTS `managers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `aux_name` VARCHAR(100),
  `aux_phone` VARCHAR(20),
  `manager_photo` LONGTEXT, -- Base64 o URL de la foto
  `aux_photo` LONGTEXT,     -- Base64 o URL de la foto del auxiliar
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Espacios (Áreas)
CREATE TABLE IF NOT EXISTS `spaces` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `manager_id` INT,
  `capacity` INT NOT NULL,
  `available_hours` VARCHAR(100) NOT NULL, -- Ej: "08:00 - 18:00"
  `resources` TEXT, -- Ej: "Sillas, Mesas, Proyector"
  `photo` LONGTEXT, -- Base64 o URL de la foto
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`manager_id`) REFERENCES `managers`(`id`) ON DELETE SET NULL
);

-- Tabla de Reservaciones
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `space_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `status` ENUM('pendiente', 'aprobada', 'rechazada') NOT NULL DEFAULT 'pendiente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Insertar un usuario administrador por defecto (password: admin123)
-- Para propósitos de este demo insertamos el password como texto plano de ser necesario en el backend, o usar bcrypt si preferimos, 
-- pero por simplicidad de prueba agregaremos texto plano: 'admin123'
INSERT INTO `users` (`username`, `password`, `email`, `role`) 
VALUES ('admin', 'admin123', 'admin@escuela.edu', 'admin')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Insertar un usuario alumno por defecto (password: alumno123)
INSERT INTO `users` (`username`, `password`, `email`, `role`) 
VALUES ('alumno1', 'alumno123', 'alumno1@escuela.edu', 'student')
ON DUPLICATE KEY UPDATE `username`=`username`;
