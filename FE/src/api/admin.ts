// FE/src/api/admin.ts
import client from "./client";

/** ------------------ 로그인 ------------------ */
export type AdminLoginRequest = {
  userid: string;
  password: string;
};

export type AdminLoginResponse = {
  message: string;
  access_token: string;
  token_type: string;
};

export const adminLogin = (payload: AdminLoginRequest) =>
  client.post<AdminLoginResponse>("/admin/login", payload).then((r) => r.data);


/** ------------------ 회원 조회 ------------------ */
export type MemberInfo = {
  id: number;
  userid: string;
  nickname: string;
  role: "staff" | "member";
  is_admin: boolean;
};

export const getAllMembers = () =>
  client.get<MemberInfo[]>("/admin/members").then((r) => r.data);


/** ------------------ 권한 변경 ------------------ */
export type MemberStatus = {
  userid: string;
  role: "staff" | "member";
};

export type UpdateMembersStatusRequest = {
  members: MemberStatus[];
};

export type UpdateMembersStatusResponse = {
  message: string;
  updated: string[];
};

export const updateMembersStatus = (payload: UpdateMembersStatusRequest) =>
  client
    .patch<UpdateMembersStatusResponse>("/admin/members/status", payload)
    .then((r) => r.data);


/** ------------------ 관리자 위임 ------------------ */
export const delegateAdminRole = (userid: string) =>
  client
    .put<MemberInfo>(`/admin/delegate/${encodeURIComponent(userid)}`)
    .then((r) => r.data);


/** -------------- 회원 이름으로 검색 --------------*/

export const searchMembers = (name: string) =>
  client.get<MemberInfo[]>("/admin/members/search", { params: { name } }).then((r) => r.data);


/** -------------- 회원 강제 탈퇴 -------------- */
export const forceWithdrawMember = (userid: string) =>
  client.delete<void>(`/admin/members/${encodeURIComponent(userid)}`).then((r) => r.data);
