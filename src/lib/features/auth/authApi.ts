import {
  ChangePasswordDocument,
  CreateUserDocument,
  LoginDocument,
  LogoutAllDocument,
  LogoutDocument,
  MeDocument,
  RequestPasswordResetDocument,
  ResendVerificationEmailDocument,
  ResetPasswordDocument,
  UpdateProfileDocument,
  VerifyEmailDocument,
  type ChangePasswordInput,
  type ChangePasswordMutation,
  type CreateUserDto,
  type CreateUserMutation,
  type LoginMutation,
  type LogoutAllMutation,
  type LogoutMutation,
  type MeQuery,
  type RequestPasswordResetMutation,
  type ResendVerificationEmailMutation,
  type ResetPasswordInput,
  type ResetPasswordMutation,
  type UpdateProfileMutation,
  type VerifyEmailInput,
  type VerifyEmailMutation,
} from "@/gql/graphql";
import { api } from "@/lib/api";
import { clearSession, getRefreshToken, setSession } from "@/lib/auth/session";
import { sessionCleared, sessionRestored } from "./authSlice";
import type { LoginAccountPayload } from "./authTypes";

export type ProfileInput = {
  birthdate?: string;
  lastName?: string;
  name?: string;
  profilePicture?: string | null;
};

export const authApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: build => ({
    loginUser: build.mutation<LoginMutation["login"], LoginAccountPayload>({
      query: ({ identifier, password }: LoginAccountPayload) => ({
        auth: "public",
        document: LoginDocument,
        variables: {
          input: {
            identifier,
            password,
          },
        },
      }),
      transformResponse: (result: LoginMutation) => result.login,
      async onQueryStarted(_argument, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.user.status === "ACTIVE") {
            setSession(data);
          } else {
            clearSession();
          }
          dispatch(sessionRestored(data.user));
        } catch {
          clearSession();
        }
      },
      invalidatesTags: ["user"],
    }),
    registerUser: build.mutation<CreateUserMutation["createUser"], CreateUserDto>({
      query: input => ({
        auth: "public",
        document: CreateUserDocument,
        variables: { input },
      }),
      transformResponse: (result: CreateUserMutation) => result.createUser,
    }),
    verifyEmail: build.mutation<VerifyEmailMutation["verifyEmail"], VerifyEmailInput>({
      query: input => ({
        auth: "public",
        document: VerifyEmailDocument,
        variables: { input },
      }),
      transformResponse: (result: VerifyEmailMutation) => result.verifyEmail,
    }),
    resendVerification: build.mutation<
      ResendVerificationEmailMutation["resendVerificationEmail"],
      string
    >({
      query: email => ({
        auth: "public",
        document: ResendVerificationEmailDocument,
        variables: { input: { email } },
      }),
      transformResponse: (result: ResendVerificationEmailMutation) =>
        result.resendVerificationEmail,
    }),
    requestPasswordReset: build.mutation<
      RequestPasswordResetMutation["requestPasswordReset"],
      string
    >({
      query: email => ({
        auth: "public",
        document: RequestPasswordResetDocument,
        variables: { input: { email } },
      }),
      transformResponse: (result: RequestPasswordResetMutation) =>
        result.requestPasswordReset,
    }),
    resetPassword: build.mutation<
      ResetPasswordMutation["resetPassword"],
      ResetPasswordInput
    >({
      query: input => ({
        auth: "public",
        document: ResetPasswordDocument,
        variables: { input },
      }),
      transformResponse: (result: ResetPasswordMutation) => result.resetPassword,
    }),
    userProfile: build.query<MeQuery["me"], void>({
      query: () => ({
        document: MeDocument,
      }),
      transformResponse: (result: MeQuery) => result.me,
      providesTags: ["user"],
    }),
    updateProfile: build.mutation<
      UpdateProfileMutation["updateProfile"],
      ProfileInput
    >({
      query: input => ({
        document: UpdateProfileDocument,
        variables: { input },
      }),
      transformResponse: (result: UpdateProfileMutation) => result.updateProfile,
      invalidatesTags: ["user"],
    }),
    changePassword: build.mutation<
      ChangePasswordMutation["changePassword"],
      ChangePasswordInput
    >({
      query: input => ({
        document: ChangePasswordDocument,
        variables: { input },
      }),
      transformResponse: (result: ChangePasswordMutation) => result.changePassword,
      async onQueryStarted(_argument, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          clearSession();
          dispatch(sessionCleared());
          dispatch(api.util.resetApiState());
        } catch {
          // Keep the current session when the password was not changed.
        }
      },
    }),
    logout: build.mutation<LogoutMutation["logout"] | null, void>({
      query: () => ({
        document: LogoutDocument,
        variables: { refreshToken: getRefreshToken() ?? "" },
      }),
      transformResponse: (result: LogoutMutation) => result.logout,
      async onQueryStarted(_argument, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Local logout must complete even if the server is unavailable.
        } finally {
          clearSession();
          dispatch(sessionCleared());
          dispatch(api.util.resetApiState());
        }
      },
    }),
    logoutAll: build.mutation<LogoutAllMutation["logoutAll"], void>({
      query: () => ({ document: LogoutAllDocument }),
      transformResponse: (result: LogoutAllMutation) => result.logoutAll,
      async onQueryStarted(_argument, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Local logout must complete even if the server is unavailable.
        } finally {
          clearSession();
          dispatch(sessionCleared());
          dispatch(api.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useChangePasswordMutation,
  useLoginUserMutation,
  useLogoutAllMutation,
  useLogoutMutation,
  useRegisterUserMutation,
  useRequestPasswordResetMutation,
  useResendVerificationMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useUserProfileQuery,
  useVerifyEmailMutation,
} = authApi;
