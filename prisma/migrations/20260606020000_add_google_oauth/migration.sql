-- Migration: add_google_oauth
-- Makes password nullable and adds a unique googleId column

ALTER TABLE `User` MODIFY COLUMN `password` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `googleId` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `User_googleId_key` ON `User`(`googleId`);
