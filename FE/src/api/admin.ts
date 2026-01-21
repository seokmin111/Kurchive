// FE/src/api/admin.ts
import client from "./client";

export type AdminLoginResponse = {
  access_token: string;
  token_type: "bearer" | string;
};

export type MemberInfo = {
  id: number;
  userid: string;
  nickname: string;
  role: string; // 'staff' | 'member'
  is_admin: boolean;
};

export type MemberStatus = {
  userid: string;
  role: "staff" | "member";
};

export type UpdateMembersStatusRequest = {
  members: MemberStatus[];
};

/**
 * 관리자 자동 로그인
 * - /admin 진입 시 authCode 없이 호출 (body: {})
 */
export const adminLogin = () => {
  return client.post<AdminLoginResponse>("/admin/login", {}).then((r) => r.data);
};

/** 전체 회원 목록 조회 */
export const getAllMembers = () =>
  client.get<MemberInfo[]>("/admin/members").then((r) => r.data);

/**
 * 다수 회원 role 일괄 변경 (임원진 승급/하락)
 * - 관리자를 member로 내리려 하면 BE가 403으로 차단(=관리자 탈퇴/강등 불가 정책)
 */
export const updateMembersStatus = (payload: UpdateMembersStatusRequest) =>
  client.patch<void>("/admin/members/status", payload).then((r) => r.data);

/**
 * 관리자 위임(추가 지정)
 * - 관리자는 최대 2명까지만 가능 (BE가 400으로 차단)
 */
export const delegateAdminRole = (userid: string) =>
  client
    .put<MemberInfo>(`/admin/delegate/${encodeURIComponent(userid)}`)
    .then((r) => r.data);
