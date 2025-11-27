import api from "../api";

//내 가계부 요약본 등록
export const createSnapshot = async (data) => {
  const response = await api.post("/summaries/snapshot/", data);
  return response.data;
};

//내 가계부 세부 프로필 수정
export const updateSnapshot = async (data) => {
  const response = await api.put("/summaries/snapshot/", data);
  return response.data;
};

//내 가계부 세부 프로필 조회
export const getSnapshot = async () => {
  const response = await api.get("/summaries/snapshot/");
  return response.data;
};

//내 가계부 요약본 비용 조회
export const getLedgerSummary = async () => {
  const response = await api.get("/summaries/ledger-summary/");
  return response.data;
};

//네 가계부 요약본 생성 여부 확인
export const getHasSnapshot = async () => {
  const response = await api.get("/summaries/has-snapshot/");
  return response.data;
};

//내 가계부 요약본 게시물 id 조회
export const getLatestSnapshot = async () => {
  const response = await api.get("/summaries/latest-snapshot/");
  return response.data;
};