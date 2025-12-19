export const ADMIN_CONFIG = {
    authorizedEmails: (import.meta.env.VITE_AUTHORIZED_EMAILS || "").split(",").map(e => e.trim()).filter(e => e),
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    kakaoApiKey: import.meta.env.VITE_KAKAO_API_KEY || "",
    kakaoRestApiKey: import.meta.env.VITE_KAKAO_REST_API_KEY || "",
    kakaoClientSecret: import.meta.env.VITE_KAKAO_CLIENT_SECRET || ""
};
