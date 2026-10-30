document.addEventListener("DOMContentLoaded", function () {
  const terminal = document.getElementById("terminal");
  const fakeInput = document.getElementById("line");
  const realInput = document.getElementById("inp");
  const sect = document.getElementById("sect");

  const fakeUser = document.getElementById("fakeUser");
  const fakePass = document.getElementById("fakePass");

  let user = ""
  let password = ""

  let loginCount = 0

  let input_enabled = true;

  function printToTerminal(text) {
    const line = document.createElement("div");
    line.className = "terminal-line";
    line.innerHTML = text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
    sect.scrollTop = sect.scrollHeight;
    realInput.focus();
  }

  const logins = {
    admin: {
        user: "Administrator",
        password: "AdminAccessGLOBAL"
    },
    fmccarty: {
        user: "F.McCarty",
        password: "apateonas"
    }
  }

  function attemptLogin() {
    if (user == "" || user == null) {
        printToTerminal("[system-info]: Login failed.");
        printToTerminal("[err]: Username credential not found.")
    }
    else if (password == "" || password == null) {
        printToTerminal("[system-info]: Login failed.");
        printToTerminal("[err]: Password credential not found.")
    }
    else {
        if (logins[user]) {
        printToTerminal("[system-info]: Username validated.");
        if (logins[user].password == password) {
                printToTerminal("[system-info]: Password validated.");
                login();
        }
        else {
            printToTerminal("[system-info]: Login failed.");
            printToTerminal("[err]: Invalid password.")
        }
        }
        else {
            printToTerminal("[system-info]: Login failed.");
            printToTerminal("[err]: Invalid username.")
        }
    }
  }

  function login() {
    printToTerminal("[system-info]: Logging in...")
    localStorage.setItem("loggedInUser", user);
    localStorage.setItem("loggedInPassword", password);
    
    setTimeout(() => {
        window.location.replace("sys");
    }, 1000);
  }

  function manageUser(switchTo) {
    user = switchTo;
    fakeUser.value = user;
  }

  function managePassword(switchTo) {
    password = switchTo;
    fakePass.value = password;
  }

    const cmds = {
        user: {
            action: manageUser
        },
        username: {
            action: manageUser
        },
        login: {
            action: attemptLogin
        },
        password: {
            action: managePassword
        },
        default: {
            response: "The term <cmd> is not recognized as the name of a command, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again."
        }
    }; 
    const help_responses = {
        login: {
            response: "Initate login with current credentials.",
        },
        user: {
            response: "Set current user for login.",
        },
        password: {
            response: "Input password for login.",
        },
        default: {
            response: "[err]: No help information found for this command."
        }
    };
      const errs = {
        unknown_command: {
          response: "The term <cmd> is not recognized as the name of a command, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.",
          id: "0x0001"
        },
        file_not_found: {
          response: "The term <arg> is not recognized as the name of a file or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.",
          id: "0x0002"
        },
        too_many_args: {
          response: "Too many arguments (<inp>) entered for this command. The command <cmd> requires <req> arguments.",
          id: "0x0003"
        },
        too_few_args: {
          response: "Too few arguments (<inp>) entered for this command. The command <cmd> requires <req> arguments.",
          id: "0x0004"
        },
        unknown_arg: {
          response: "The argument <arg> is not applicable for this command (<cmd>).",
          id: "0x0005"
        },
        access_denied: {
          response: "Access is denied.",
          id: "0x0006"
        },
        invalid_access: {
          response: "The access key provided (<key>) is invalid.",
          id: "0x0007"
        },
        invalid_data: {
          response: "The data provided (<dat>) is invalid.",
          id: "0x0008"
        },
        busy: {
          response: "The terminal is busy. Please try again later.",
          id: "0x0009"
        },
        default: {
          response: "Unknown error. Please contact your administrator or VarNet Certified Technician for assistance.",
          id: "0x0000"
        }
      };

      initLogin();
      fakeInput.textContent = "_VNetAA _sys:\\login.dll>" + realInput.value;

      function initLogin() {       
        enableInput();
        function respond(input) {
          const sort = input.split(" ");
          let cmd = sort[0].toLowerCase().trim();
          if (cmd == "interlope") {
            cmd = "INTERLOPE";
          }
          if (cmds[cmd]) {
            
            if (sort[1] == "-h") {
              if (help_responses[cmd]) {
                printToTerminal("[system-info]: " + help_responses[cmd].response);
              }
              else {
                printToTerminal(help_responses.default.response);
              }
            }
            else {
              if (cmds[cmd].response) {
                printToTerminal("> " + cmds[cmd].response);
              }
              if (cmds[cmd].action) {
                if (cmds[cmd].action.length == 1) {
                  if (sort[1] == " " || sort[1] == "" || sort[1] == null) {
                    
                      printToTerminal("[err]: " + "<span style=\"color: orangered;\">" +errs.too_few_args.response.replace("<cmd>", "'" + cmd + "'").replace("<inp>", 0).replace("<req>", 1) + "</span>");
                    
                  }
                  else {
                    cmds[cmd].action(sort[1]);
                  }
                }
                else {
                  cmds[cmd].action();
                }
              }
            }
          } else {
            printToTerminal("[err]: " + "<span style=\"color: orangered;\">" +cmds.default.response.replace("<cmd>", "'" + cmd + "'") + "</span>");
          }
          window.scrollTo(0, terminal.scrollHeight);
        }

        realInput.addEventListener("input", () => {
          if (input_enabled) {
                if (!realInput.value.indexOf("password ")) {
                    let numDots = realInput.value.substring(realInput.value.indexOf("password")+9).length
                    let censored = "•".repeat(numDots)
                    fakeInput.textContent = "_VNetAA _sys:\\login.dll>password " + censored;
                }
                else {
                    fakeInput.textContent = "_VNetAA _sys:\\login.dll>" + realInput.value;
                }
            }
        });

        realInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            const input = realInput.value.trim();
            if (input !== "") {
              if (!realInput.value.indexOf("password ")) {
                    let numDots = realInput.value.substring(realInput.value.indexOf("password")+9).length
                    let censored = "•".repeat(numDots)
                    printToTerminal("> password " + censored)
              }
              else {
                printToTerminal("> " + input);
              }
              respond(input);
              realInput.value = "";
              if (input_enabled) {
                fakeInput.textContent = "_VNetAA _sys:\\login.dll>" + realInput.value;
              }
              terminal.scrollTop = terminal.scrollHeight;
              window.scrollTo(0, terminal.scrollHeight);
            }
          }
        });
    }

    function enableInput() {
      input_enabled = true;
      fakeInput.innerHTML = "_VNetAA _sys:\\login.dll>" + realInput.value;
      realInput.disabled = false;
      realInput.focus();
    }

    function disableInput() {
      input_enabled = false;
      fakeInput.innerHTML = "";
      realInput.disabled = true;
    }
});


