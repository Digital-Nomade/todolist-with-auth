import { api } from '@/lib/api';
import { LoginAccountPayload, LoginResponse } from './authTypes';

export const authApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: build => ({
    loginUser: build.mutation({
      query: ({ email, password }: LoginAccountPayload) => ({
        url: '/login',
        method: 'POST',
        body: {
          username: email,
          password,
        },
        // headers: {
        //   'content-type': 'application/json'
        // }
      }),
      transformResponse: (result: LoginResponse) => result,
      invalidatesTags: ['user']
    }),
    userProfile: build.query<unknown, void>({
      query: () => ({
        url: '/profile',
        method: 'GET',
      })
    })
  })
})

export const {
  useLoginUserMutation,
  useUserProfileQuery,
} = authApi
