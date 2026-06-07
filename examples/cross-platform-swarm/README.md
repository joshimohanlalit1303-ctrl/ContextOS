# Cross-Platform "Swarm Brain" Example 🧠

This example demonstrates the core power of **Libro**: decoupling AI memory from the browser and teleporting it to a local execution environment.

It shows a common Swarm Architecture:
1. **The Web UI (Node.js/JS):** A user brainstorms architecture with an AI on a Next.js web application.
2. **The Execution Agent (Python):** A local Python script pulls that memory down and autonomously executes actions on the user's computer based on the web UI's conclusions.

Libro acts as the **Shared Neural Pathway** between these two entirely different stacks.

## Folder Structure
- `/node-frontend`: A simulated web server using the JS SDK (`libro-sdk`).
- `/python-agent`: A simulated local autonomous agent using the Python SDK (`libro-sdk-python`).

## How to Run It

### Step 1: Start your local Libro API Server & Get API Key
1. Ensure your main Libro/ContextOS API server is running (`npm run dev` in the root).
2. Create an API Key in your dashboard.
3. In both `/node-frontend` and `/python-agent` directories, copy `.env.example` to `.env` and paste your API key inside.

### Step 2: Run the Web Handoff (JS)
Open a terminal and run the Node script. This simulates a user finishing a chat on a web dashboard and clicking "Send to Local IDE".

```bash
cd node-frontend
npm install
node index.js
```
*You will see the JS script save the Context Passport to the cloud.*

### Step 3: Run the Local Execution Agent (Python)
Open a **new** terminal and run the Python script. This simulates a local AI agent waking up, downloading the web context, and writing code locally.

```bash
cd python-agent
pip install -r requirements.txt
python3 agent.py
```
*You will see the Python script instantly download the memory that was created by the JS script just seconds ago, and "execute" the task.*

## Why This Matters
You just passed complex AI state between a JavaScript runtime and a Python runtime without writing a single custom API route, database schema, or JSON parser. Libro handles the entire memory layer for you.
