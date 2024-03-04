import { GraphQLBoolean, GraphQLEnumType, GraphQLFloat, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { Context, prismaClient } from "./dataLoader.js";
import { User } from "./types/user.js";
import { Member } from "./types/memberType.js";
import { UUIDType } from "./types/uuid.js";
import { Post } from "./types/post.js";
import { Profile } from "./types/profile.js";

export const UserType: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: UUIDType },
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
        posts: {
            type: new GraphQLList(PostType),
            resolve: async ({ id }: User) =>
              await prismaClient.post.findMany({ where: { authorId: id } }),
          },
        profile: {
            type: ProfileType,
            resolve: async ({ id }: User) => await prismaClient.profile.findFirst({ where: { userId: id } })
        },
        subscribedToUser: {
            type: new GraphQLList(UserType),
            resolve: async ({ id }: User) => {
                const results = await prismaClient.subscribersOnAuthors.findMany({
                  where: { authorId: id },
                  select: { subscriber: true },
                });

                return results.map((result) => result.subscriber);
              }
        },
        userSubscribedTo: {
            type: new GraphQLList(UserType),
            resolve: async({ id }: User) => {
                const results = await prismaClient.subscribersOnAuthors.findMany({
                  where: { subscriberId: id },
                  select: { author: true },
                });

                return results.map((result) => result.author);
              }
        },
    })
});

export const MemberTypeId: GraphQLEnumType = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
        basic: { value: 'basic' },
        business: { value: 'business' },
    }
});

export const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: UUIDType },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        authorId: { type: UUIDType },
    })
});

export const ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: { type: UUIDType },
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLFloat },
        userId: { type: UUIDType },
        memberTypeId: { type: MemberTypeId },
        memberType: {
          type: MemberType,
          resolve: async ({ memberTypeId }: Profile) =>
            await prismaClient.memberType.findFirst({ where: { id: memberTypeId } }),
        }
    })
});

export const MemberTypeIdNonNull = new GraphQLNonNull(MemberTypeId);

export const MemberType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
        id: { type: MemberTypeId },
        discount: { type: GraphQLFloat },
        postsLimitPerMonth: { type: GraphQLFloat },
    })
});

export const UserQueries = {
    user: {
        type: UserType,
        args: { id: { type: UUIDType }},
        resolve: async(_, { id }: User) => {
            const res = await prismaClient.user.findFirst({ where: { id } });
            console.log('RES', res, id);
            return res;
        }
    },
    users: {
        type: new GraphQLList(UserType),
        resolve: async (_obj, _args) => await prismaClient.user.findMany(),
    },
};

export const MemberTypesQueries = {
    memberType: {
        type: MemberType,
        args: { id: { type: MemberTypeIdNonNull }},
        resolve: async (_, { id }: Member, { loaders }: Context) => await loaders.memberType.load(id)
    },
    memberTypes: {
        type: new GraphQLList(MemberType),
        resolve: async (_obj, _args, { db }: Context) => {
            return db.memberType.findMany();
        }
    }
};

export const PostsQueries = {
    post: {
        type: PostType,
        args: { id: { type: new GraphQLNonNull(UUIDType) }},
        resolve: async (_, { id }: Post) => await prismaClient.post.findFirst({ where: { id } })
    },
    posts: {
        type: new GraphQLList(PostType),
        resolve: async (_, _args, { db }: Context) => {
            return db.post.findMany();
        }
    },
};

export const ProfilesQueries = {
    profile: {
        type: ProfileType,
        args: { id: { type: UUIDType }},
        resolve: async (_, { id }: Profile) => await prismaClient.profile.findFirst({ where: { id } })
    },
    profiles: {
        type: new GraphQLList(ProfileType),
        resolve: async (_obj, _args, { db }: Context) => {
            return db.profile.findMany();
        }
    },
};

export const RootQuery = new GraphQLObjectType({
    name: 'Queries',
    fields: {
        ...UserQueries,
        ...MemberTypesQueries,
        ...PostsQueries,
        ...ProfilesQueries,
    }
});
