import axios from "axios";

// Use local proxy in development, production URL otherwise
const API_URL =
  process.env.NODE_ENV === "development"
    ? "/api"
    : "https://blundrbot-backend.onrender.com";

// Make a request to get the bot's worst move
export const makeBlunderMove = async (fen, recent_moves = []) => {
  try {
    const response = await axios.post(
      `${API_URL}/worst-move`,
      { fen, recent_moves },
      { timeout: 10000 } // 10 second timeout
    );
    return response;
  } catch (error) {
    console.error("Failed to get bot move:", error.message);
    throw error;
  }
};
