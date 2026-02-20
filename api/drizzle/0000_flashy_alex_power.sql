DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'USER', 'MODERATOR');
    END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
            ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'USER' NOT NULL;
        END IF;
    ELSE
        CREATE TABLE "users" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            "name" varchar(255) NOT NULL,
            "email" varchar(255) NOT NULL,
            "password" text NOT NULL,
            "phone" text,
            "role" "user_role" DEFAULT 'USER' NOT NULL,
            "trial_ends_at" timestamp with time zone,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL,
            "deleted_at" timestamp,
            CONSTRAINT "users_email_unique" UNIQUE("email")
        );
    END IF;
END $$;
