document.addEventListener("DOMContentLoaded", function () {
      const terminal = document.getElementById("terminal");
      const fakeInput = document.getElementById("line");
      const realInput = document.getElementById("inp");

      const bootLines = [
        "BOOTING UP...",
        "LOADING INTERFACE...",
        "INITIALIZING CORE..."
      ];


      let i = 0;
      const delay = 1000;

      function typeBootLine() {
        if (i < bootLines.length) {
          const line = document.createElement("div");
          line.parentElement = fakeInput;
          line.textContent = bootLines[i];
          line.classList.add("glitch");
          terminal.appendChild(line);
          i++;
          setTimeout(typeBootLine, delay);
        } else {
          setTimeout(() => {
            document.getElementById("container").style.display = "flex";
            realInput.focus();
            initTerminal();
          }, 1500);
        }
      }

      function initTerminal() {
        const genericResponses = {
          reboot: "System cannot be rebooted at this time. Please try again.",
          default: "This term is not recognized as the name of a command, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again."
        };

        const idleWhispers = [
          "System is stable...",
          "Awaiting next command...",
          "Silence detected. Remaining on standby.",
          "Passive scan complete. No anomalies."
        ];

        setInterval(() => {
          const whisper = idleWhispers[Math.floor(Math.random() * idleWhispers.length)];
          printToTerminal("[system-whisper] " + whisper);
        }, 30000);

        function printToTerminal(text) {
          const line = document.createElement("div");
          line.className = "terminal-line";
          line.textContent = text;
          terminal.appendChild(line);
          terminal.scrollTop = terminal.scrollHeight;
        }

        function respond(input) {
          const cmd = input.toLowerCase().trim();
          if (genericResponses[cmd]) {
            printToTerminal("> " + genericResponses[cmd]);
          } else {
            printToTerminal("> " + genericResponses.default);
          }
        }

        realInput.addEventListener("input", () => {
          fakeInput.textContent = realInput.value;
        });

        realInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            const input = realInput.value.trim();
            if (input !== "") {
              printToTerminal("> " + input);
              respond(input);
              realInput.value = "";
              fakeInput.textContent = "";
              terminal.scrollTop = terminal.scrollHeight;
            }
          }
        });

        printToTerminal("Varnet AdminAccess");
        printToTerminal("AdminAccess Booted without error.");
        printToTerminal("Please input a command.");
    }

      typeBootLine();
    });