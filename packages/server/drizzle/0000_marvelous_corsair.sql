CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parent_id` integer,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`color` text,
	`done_verb` text DEFAULT 'done' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_parent_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE TABLE `maps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`tile_size` integer NOT NULL,
	`min_zoom` integer NOT NULL,
	`max_zoom` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `marker_progress` (
	`profile_id` integer NOT NULL,
	`marker_id` integer NOT NULL,
	`done_at` integer NOT NULL,
	PRIMARY KEY(`profile_id`, `marker_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`marker_id`) REFERENCES `markers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `marker_progress_marker_idx` ON `marker_progress` (`marker_id`);--> statement-breakpoint
CREATE TABLE `markers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`map_id` text NOT NULL,
	`category_id` integer NOT NULL,
	`subcategory_id` integer,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`image` text,
	`icon` text,
	`x` real NOT NULL,
	`y` real NOT NULL,
	`source` text NOT NULL,
	`source_id` text,
	`source_x` real,
	`source_y` real,
	`wiki_url` text,
	`owner_user_id` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subcategory_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `markers_source_idx` ON `markers` (`source`,`source_id`);--> statement-breakpoint
CREATE INDEX `markers_map_category_idx` ON `markers` (`map_id`,`category_id`);--> statement-breakpoint
CREATE TABLE `notes` (
	`profile_id` integer NOT NULL,
	`marker_id` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`profile_id`, `marker_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`marker_id`) REFERENCES `markers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_name_idx` ON `profiles` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);