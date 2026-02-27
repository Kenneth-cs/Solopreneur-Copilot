-- DropForeignKey
ALTER TABLE `Project` DROP FOREIGN KEY `Project_ideaId_fkey`;

-- AlterTable
ALTER TABLE `Project` MODIFY `ideaId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_ideaId_fkey` FOREIGN KEY (`ideaId`) REFERENCES `Idea`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
