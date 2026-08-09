CREATE TABLE `changes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`control_id` integer NOT NULL,
	`type` text NOT NULL,
	`summary` text NOT NULL,
	`diff_text` text,
	`source_url` text,
	`discovered_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`reviewed` integer DEFAULT false NOT NULL,
	`published_at` integer,
	FOREIGN KEY (`control_id`) REFERENCES `controls`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `changes_control_idx` ON `changes` (`control_id`);--> statement-breakpoint
CREATE TABLE `controls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`framework_id` integer NOT NULL,
	`control_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`domain` text,
	`version` text DEFAULT '1.0' NOT NULL,
	`valid_from` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`valid_to` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`framework_id`) REFERENCES `frameworks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `controls_framework_idx` ON `controls` (`framework_id`);--> statement-breakpoint
CREATE TABLE `frameworks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`issuer` text NOT NULL,
	`source_url` text,
	`last_updated` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `frameworks_slug_unique` ON `frameworks` (`slug`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`type` text NOT NULL,
	`framework_id` integer,
	`last_checked_at` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`framework_id`) REFERENCES `frameworks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`framework_ids` text DEFAULT '[]',
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);