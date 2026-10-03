CREATE TABLE `tender_clarifications` (
	`clar_id` int AUTO_INCREMENT NOT NULL,
	`tender_id` int NOT NULL,
	`vendor_id` int NOT NULL,
	`clar_question` text NOT NULL,
	`clar_answer` text,
	`clar_answered_by` int,
	`clar_answered_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tender_clarifications_clar_id` PRIMARY KEY(`clar_id`)
);
--> statement-breakpoint
ALTER TABLE `tender_clarifications` ADD CONSTRAINT `tender_clarifications_tender_id_tenders_tender_id_fk` FOREIGN KEY (`tender_id`) REFERENCES `tenders`(`tender_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tender_clarifications` ADD CONSTRAINT `tender_clarifications_vendor_id_vendor_profiles_vendor_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles`(`vendor_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tender_clarifications` ADD CONSTRAINT `tender_clarifications_clar_answered_by_users_user_id_fk` FOREIGN KEY (`clar_answered_by`) REFERENCES `users`(`user_id`) ON DELETE set null ON UPDATE no action;