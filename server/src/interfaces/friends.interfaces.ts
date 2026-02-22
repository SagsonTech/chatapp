import { IUserDataPayload } from "./auth.interfaces";

export interface IFriendProfilePayload extends IUserDataPayload {
  isBlocked: boolean;
  friendsFrom: Date;
}
