import { IUserDataPayload } from "./auth.interfaces";

export type RequestStatusType =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled";

export interface IRequestResponsePayload {
  requestId: string;
  toUser: IUserDataPayload;
  status: RequestStatusType;
  sentTime: Date;
}
