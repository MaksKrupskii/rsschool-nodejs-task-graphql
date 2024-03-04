export type User = {
    id: string;
    name: string;
    balance: number;
};

export type CreateUser = {
    dto: {
        name: string;
        balance: number;
      }
};

export type ChangeUser = {
    id: string;
    dto: {
        name: string;
        balance: number;
      }
};

export interface UserSubscribedTo {
    userId: string;
    authorId: string;
  }
