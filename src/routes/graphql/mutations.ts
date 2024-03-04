/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLBoolean, GraphQLFloat, GraphQLInputObjectType, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { ChangeUser, CreateUser, User, UserSubscribedTo } from "./types/user.js";
import { UUIDType } from "./types/uuid.js";
import { MemberTypeId, PostType, ProfileType, UserType } from "./queries.js";
import { Context, prismaClient } from "./dataLoader.js";
import { ChangePost, CreatePost, Post } from "./types/post.js";
import { ChangeProfile, CreateProfile, Profile } from "./types/profile.js";

export const CreateUserType = new GraphQLInputObjectType({
    name: 'CreateUserType',
    fields: () => ({
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
    })
});

export const ChangeUserType = new GraphQLInputObjectType({
    name: 'ChangeUserType',
    fields: () => ({
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
    })
});

export const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostType',
  fields: () => ({
    authorId: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const ChangePostType = new GraphQLInputObjectType({
  name: 'ChangePostType',
  fields: () => ({
    authorId: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

export const CreateProfileType = new GraphQLInputObjectType({
    name: 'CreateProfileType',
    fields: () => ({
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLFloat) },
        userId: { type: new GraphQLNonNull(UUIDType) },
        memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
    })
});

export const ChangeProfileType = new GraphQLInputObjectType({
    name: 'ChangeProfileType',
    fields: () => ({
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLFloat },
        memberTypeId: { type: MemberTypeId },
    })
});

export const UserMutations = {
    createUser: {
        type: UserType,
        args: { dto: { type: CreateUserType }},
        resolve: async (_, { dto }: CreateUser) => await prismaClient.user.create({ data: dto })
    },
    changeUser: {
        type: UserType,
        args: { id: { type: UUIDType }, dto: { type: ChangeUserType }},
        resolve: async (_, { id, dto }: ChangeUser) => await prismaClient.user.update({ where: { id: id }, data: dto })
    },
    deleteUser: {
        type: GraphQLBoolean,
        args: { id: { type: UUIDType }},
        resolve: async (_, { id }: User) => {
            try {
              await prismaClient.user.delete({ where: { id: id } });
            } catch (err) {
              return false;
            }
    
            return true;
          },
    },

    subscribeTo: {
        type: UserType,
        args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
        resolve: async (_, { userId, authorId }: UserSubscribedTo) => {
          await prismaClient.subscribersOnAuthors.create({
            data: { subscriberId: userId, authorId: authorId },
          });
  
          return await prismaClient.user.findFirst({ where: { id: userId } });
        },
      },

      unsubscribeFrom: {
        type: GraphQLBoolean,
        args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
        resolve: async (_, { userId, authorId }: UserSubscribedTo) => {
          try {
            await prismaClient.subscribersOnAuthors.deleteMany({
              where: { subscriberId: userId, authorId: authorId },
            });
          } catch {
            return false;
          }
  
          return true;
        },
    }
};

export const PostsMutations = {
    createPost: {
      type: PostType,
      args: { dto: { type: CreatePostInputType } },
      resolve: async (_, { dto } : CreatePost) =>{
        console.log(111, dto)
        return await prismaClient.post.create({ data: dto })},
    },
    changePost: {
        type: PostType,
        args: { id: { type: UUIDType }, dto: { type: ChangePostType }},
        resolve: async (_, { id, dto }: ChangePost) => await prismaClient.post.update({ where: { id: id }, data: dto })
    },
    deletePost: {
        type: GraphQLBoolean,
        args: { id: { type: UUIDType }},
        resolve: async (_, { id }: Post) => {
            try {
              await prismaClient.post.delete({ where: { id: id } });
            } catch (err) {
              return false;
            }
    
            return true;
          },
    },
};

export const ProfilesMutations = {
    createProfile: {
        type: ProfileType,
        args: { dto: { type: CreateProfileType }},
        resolve: async(_, { dto }: CreateProfile) => await prismaClient.profile.create({ data: dto})
    },
    changeProfile: {
        type: ProfileType,
        args: { id: { type: UUIDType }, dto: { type: ChangeProfileType }},
        resolve: async(_, { id, dto }: ChangeProfile, { db }: Context) => await db.profile.update({ where: { id: id }, data: dto })
    },
    deleteProfile: {
        type: GraphQLBoolean,
        args: { id: { type: UUIDType }},
        resolve: async(_, { id }: Profile, { db }: Context) => {
            try {
              await db.profile.delete({ where: { id: id } });
            } catch (err) {
              return false;
            }
    
            return true;
          },
    },
};

export const RootMutations = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      ...UserMutations,
      ...PostsMutations,
      ...ProfilesMutations,
    },
});
