export type Message = {
  text: string;
  isMine: boolean;
  name: string;
};

export type Channel = {
  chanel: string;
  send: string;
  name: string;
  messages: Message[];
};
