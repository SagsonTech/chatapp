import { IUserDataPayload } from "./auth.interfaces";

export type RequestStatusType =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled";

export interface IRequestResponsePayload {
  toUser: IUserDataPayload;
  status: RequestStatusType;
  sentTime: Date;
}
