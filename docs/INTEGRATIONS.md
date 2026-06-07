# Connecting your IDE to Libro Hive Mind

You can instantly connect any modern AI code editor to your central Libro Hive Mind. 

First, ensure you have generated a **Libro API Key** and a **User/Project ID** from your account dashboard. Then, follow the instructions for your specific editor below.

---

## 1. Claude Desktop
1. Open your Claude Desktop configuration file. On macOS, you can quickly open it by running this in your terminal:
   `open -a TextEdit ~/Library/Application\ Support/Claude/claude_desktop_config.json`
2. Add the following to your `"mcpServers"` object:

```json
{
  "mcpServers": {
    "libro": {
      "command": "npx",
      "args": [
        "-y",
        "libro-mcp-server"
      ],
      "env": {
        "LIBRO_API_KEY": "YOUR_API_KEY_HERE",
        "LIBRO_USER_ID": "YOUR_PROJECT_ID_HERE"
      }
    }
  }
}
```
3. Save the file and completely **restart** Claude Desktop.

---

## 2. Cursor IDE
1. Open Cursor Settings.
2. Go to **Features** > **MCP**.
3. Click **Add New MCP Server**.
4. Set the Type to **command**.
5. Set the Name to `libro`.
6. Set the Command to: 
   `npx -y libro-mcp-server`
7. In the environment variables section, add `LIBRO_API_KEY` and `LIBRO_USER_ID` with your respective keys.
8. Click **Save** and wait for Cursor to initialize the connection.

---

## 3. Claude Code (CLI)
You can directly add Libro to Claude Code by running this command in your terminal:

```bash
LIBRO_API_KEY="YOUR_API_KEY_HERE" LIBRO_USER_ID="YOUR_PROJECT_ID_HERE" claude mcp add libro -- npx -y libro-mcp-server
```

---

## 4. Antigravity IDE
1. Open the UI Connectors menu (the paperclip icon in the chat).
2. Go to **Manage Connectors** -> **Add Custom Connector**.
3. Enter `libro` as the name.
4. Set the command to `npx -y libro-mcp-server`.
5. Enter your `LIBRO_API_KEY` and `LIBRO_USER_ID` in the environment variables fields.
6. Click **Save**.

### Self-Hosted Custom URLs
If you are running your own private instance of the Libro backend, you can simply add `"LIBRO_BASE_URL": "https://your-domain.com"` to the `env` configuration block in any of the editors above.
