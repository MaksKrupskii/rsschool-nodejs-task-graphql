export type Profile = {
    id: string;
    isMale: boolean;
    yearOfBirth: number;
    userId: string;
    memberTypeId: string;
};

export type CreateProfile = {
    dto: {
        isMale: boolean;
        yearOfBirth: number;
        userId: string;
        memberTypeId: string;
      }
};

export type ChangeProfile = {
    id: string;
    dto: {
        isMale: boolean;
        yearOfBirth: number;
        memberTypeId: string;
      }
};