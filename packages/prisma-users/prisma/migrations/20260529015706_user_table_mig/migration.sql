-- CreateEnum
CREATE TYPE "SessionDuration" AS ENUM ('temporary', 'persistent');

-- CreateTable
CREATE TABLE "User" (
    "userID" TEXT NOT NULL,
    "profilePicURI" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Card" (
    "cardId" TEXT NOT NULL,
    "userID" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("cardId")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "userSessionID" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "rememberMe" BOOLEAN NOT NULL DEFAULT false,
    "userIPAddress" TEXT NOT NULL,
    "userDeviceName" TEXT NOT NULL,
    "userDeviceType" TEXT NOT NULL,
    "userDeviceBrowser" TEXT NOT NULL,
    "userDeviceOS" TEXT NOT NULL,
    "sessionDuration" "SessionDuration" NOT NULL,
    "userID" TEXT NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("userSessionID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
