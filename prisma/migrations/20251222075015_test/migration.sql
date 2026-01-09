-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WidgetPosition" ADD VALUE 'LEFT_CENTER';
ALTER TYPE "WidgetPosition" ADD VALUE 'RIGHT_CENTER';
ALTER TYPE "WidgetPosition" ADD VALUE 'CENTER_LEFT';
ALTER TYPE "WidgetPosition" ADD VALUE 'CENTER_RIGHT';
ALTER TYPE "WidgetPosition" ADD VALUE 'FLOATING_TOP';
ALTER TYPE "WidgetPosition" ADD VALUE 'FLOATING_BOTTOM';
ALTER TYPE "WidgetPosition" ADD VALUE 'FLOATING_CENTER';
