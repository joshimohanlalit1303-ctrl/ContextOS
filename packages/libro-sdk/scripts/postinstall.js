#!/usr/bin/env node

const reset = "\x1b[0m";
const bold = "\x1b[1m";
const cyan = "\x1b[36m";
const green = "\x1b[32m";
const blue = "\x1b[34m";

const banner = `
${cyan}${bold}
 _     _ _               
| |   (_) |__  _ __ ___  
| |   | | '_ \\| '__/ _ \\ 
| |___| | |_) | | | (_) |
|_____|_|_.__/|_|  \\___/ 
${reset}
${green}✔ Libro SDK successfully installed!${reset}
${blue}Documentation:${reset} https://github.com/joshimohanlalit1303-ctrl/Libro
${blue}Happy coding! 🚀${reset}
`;

const fs = require('fs');
try {
  // Attempt to write directly to the terminal device to bypass NPM's log suppression
  const fd = fs.openSync('/dev/tty', 'w');
  fs.writeSync(fd, banner + '\n');
  fs.closeSync(fd);
} catch (e) {
  // Fallback if not a TTY environment
  console.log(banner);
}
