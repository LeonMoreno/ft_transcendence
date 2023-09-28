export type Message = {
  text: string;
  isMine: boolean;
};

export type User = {
  name: string;
  messages: Message[];
};
