export interface IAuthTokenPayload {
  userId: string;
}

export interface IUserDataPayload extends IAuthTokenPayload {
  username: string;
  email: string;
  profilePicture: string;
}

export interface ICookieTokenPayload extends IAuthTokenPayload {
  iat: number;
  exp: number;
}
