import { Prisma } from "@prisma/client";
import { Request } from "express";
import { Multer } from "multer";

export interface ARequest extends Request {
  user: MemberNoPassword;
}

export interface AFRequest extends ARequest {
  file: Multer.File;
}

export type Member = Prisma.MemberGetPayload<{ include: Prisma.MemberInclude }>;
export type MemberNoPassword = Partial<
  Omit<
    Member,
    | "password"
    | "LoginHistory"
    | "OwnedProperties"
    | "Invoices"
    | "InvoiceGenerations"
    | "Payments"
    | "PaymentsVerified"
    | "Documents"
    | "Contacts"
    | "WorkReports"
    | "_count"
  >
>;

export type Property = Prisma.PropertyGetPayload<{
  include: Prisma.PropertyInclude;
}>;

export type UpdateMemberDTO = Partial<
  Omit<
    Member,
    | "LoginHistory"
    | "OwnedProperties"
    | "Invoices"
    | "InvoiceGenerations"
    | "Payments"
    | "PaymentsVerified"
    | "Documents"
    | "Contacts"
    | "WorkReports"
    | "AuditLogsPerformed"
    | "AuditLogsTargeted"
    | "Notes"
    | "NotesPosted"
    | "GalleryPhotos"
    | "ForSalePosts"
    | "PostedTags"
    | "PaymentNotifications"
    | "PaymentNotificationsPosted"
    | "_count"
  >
>;
export type CreatePropertyDTO = Omit<
  Property,
  | "Photos"
  | "OwnedProperties"
  | "Invoices"
  | "WorkReports"
  | "AuditLogs"
  | "GalleryPhotos"
  | "_count"
>;
export type UpdatePropertyDTO = Partial<
  Omit<
    Property,
    | "Photos"
    | "OwnedProperties"
    | "Invoices"
    | "WorkReports"
    | "AuditLogs"
    | "GalleryPhotos"
    | "_count"
  >
>;
