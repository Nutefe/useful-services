-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth_service";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "mind_max_service";

-- CreateTable
CREATE TABLE "auth_service"."users" (
    "id" BIGSERIAL NOT NULL,
    "firsname" VARCHAR(50),
    "lastname" VARCHAR(100),
    "username" VARCHAR(50),
    "email" TEXT,
    "password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_service"."services" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_service"."roles" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "service_id" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_service"."permissions" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_service"."role_permissions" (
    "id" BIGSERIAL NOT NULL,
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_service"."user_role_services" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    "service_id" BIGINT NOT NULL,

    CONSTRAINT "user_role_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_service"."refresh_tokens" (
    "id" BIGSERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mind_max_service"."preparateurs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "specialite" VARCHAR(100),
    "agence" VARCHAR(100),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preparateurs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "auth_service"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "auth_service"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "auth_service"."services"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_service_id_key" ON "auth_service"."roles"("name", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "auth_service"."permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "auth_service"."role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_services_user_id_role_id_service_id_key" ON "auth_service"."user_role_services"("user_id", "role_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "auth_service"."refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "preparateurs_user_id_key" ON "mind_max_service"."preparateurs"("user_id");

-- AddForeignKey
ALTER TABLE "auth_service"."roles" ADD CONSTRAINT "roles_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "auth_service"."services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_service"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "auth_service"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_service"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "auth_service"."permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_service"."user_role_services" ADD CONSTRAINT "user_role_services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_service"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_service"."user_role_services" ADD CONSTRAINT "user_role_services_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "auth_service"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_service"."user_role_services" ADD CONSTRAINT "user_role_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "auth_service"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_service"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_service"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mind_max_service"."preparateurs" ADD CONSTRAINT "preparateurs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_service"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
