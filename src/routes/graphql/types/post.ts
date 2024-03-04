export type Post = {
    id: string;
    title: string;
    content: string;
    authorId: string;
};

export type CreatePost = {
    dto: {
        title: string;
        content: string;
        authorId: string;
      }
};

export type ChangePost = {
    id: string;
    dto: {
        title: string;
        content: string;
      }
};