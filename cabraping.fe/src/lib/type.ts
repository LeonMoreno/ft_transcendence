export type Message = {
  text: string;
  isMine: boolean;
};

export type User = {
  chanel: string;
  send: string;
  name: string;
  messages: Message[];
};
