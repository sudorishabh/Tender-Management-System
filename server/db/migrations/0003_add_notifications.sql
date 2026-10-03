CREATE TABLE `notifications` (
	`notif_id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`notif_title` varchar(100) NOT NULL,
	`notif_message` text NOT NULL,
	`notif_is_read` boolean NOT NULL DEFAULT false,
	`notif_type` enum('bid_status','tender_update','account','clarification','system') NOT NULL,
	`notif_link` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_notif_id` PRIMARY KEY(`notif_id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;