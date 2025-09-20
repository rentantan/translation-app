import axios from "axios";

const API_URL = "http://localhost:8000";

// レスポンスの型を定義
export interface UserResponse {
  id: number;
  username: string;
}

export const registerUser = async (username: string, password: string): Promise<UserResponse> => {
  const res = await axios.post<UserResponse>(`${API_URL}/register`, { username, password });
  return res.data;
};


export const loginUser = async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
  
    const res = await axios.post(`${API_URL}/login`, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data; // { access_token: "...", token_type: "bearer" }
  };
  
