import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { User } from './types/user.js';
import { Member } from './types/memberType.js';
import { Post } from './types/post.js';
import { Profile } from './types/profile.js';

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type DataLoaderType = DataLoader<string, unknown | undefined>;

export interface Loaders {
    user: DataLoaderType;
    memberType: DataLoaderType;
    post: DataLoaderType;
    profile: DataLoaderType;
}

export interface Context {
    db: PrismaClient;
    loaders: Loaders;
}
export const prismaClient = new PrismaClient();
export const dataLoaders = (db: PrismaClient): Loaders => {
    return {
        user: userDataLoader(db),
        memberType: memberTypeDataLoader(db),
        post: postDataLoader(db),
        profile: profileDataLoader(db),
    };
};

const userDataLoader = (db: PrismaClient) => {
    return new DataLoader<string, User | undefined>(async (keys: readonly string[]) => {
        return await db.user.findMany({
            where: { id: { in: keys as string[] } },
        })
    })
};

const memberTypeDataLoader = (db: PrismaClient) => {
    return new DataLoader<string, Member | undefined>(async (keys: readonly string[]) => {
        return await db.memberType.findMany({
            where: { id: { in: keys as string[] } },
        })
    })
};

const postDataLoader = (db: PrismaClient) => {
    return new DataLoader<string, Post | undefined>(async (keys: readonly string[]) => {
        return await db.post.findMany({
            where: { id: { in: keys as string[] } },
        })
    })
};

const profileDataLoader = (db: PrismaClient) => {
    return new DataLoader<string, Profile | undefined>(async (keys: readonly string[]) => {
        return await db.profile.findMany({
            where: { id: { in: keys as string[] } },
        })
    })
};