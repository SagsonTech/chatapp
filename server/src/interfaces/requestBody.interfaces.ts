export interface ISignupBody {
  username: string;
  password: string;
  email: string;
}

export interface ILoginBody {
  email: string;
  password: string;
}

export interface IMessageBody {
  messageText: string;
  attachmentImage: string;
}
