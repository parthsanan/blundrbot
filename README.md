# [BlundrBot🔗](https://blundrbot.vercel.app/)
A unique chess application that flips traditional chess on its head. Instead of playing to win, you'll face off against an AI that makes the worst possible moves, challenging you to capitalize on its mistakes and secure victory.

## Features

### Play Against BlundrBot

Test your chess skills against an AI that intentionally makes suboptimal moves. Can you maintain your composure and win against an opponent that's trying to lose?

### Puzzle Mode

Sharpen your tactical awareness by solving chess puzzles where the goal is to find the worst possible move in a given position. Each puzzle includes detailed explanations of why specific moves are particularly bad, helping you understand common chess mistakes.

## Getting Started

### Prerequisites

- Node.js
- Python 3.7+
- npm or yarn

### Installation

1. Clone the repository

2. Install frontend dependencies:

   ```bash
   cd client
   npm install
   ```

3. Set up the backend:

   ```bash
   cd ../server
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend server:

   ```bash
   cd server
   uvicorn main:app --reload
   ```

2. Start the frontend development server:

   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `/client` - Frontend React application
- `/server` - FastAPI backend service

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
