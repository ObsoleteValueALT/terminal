document.addEventListener("DOMContentLoaded", function () {
  const terminal = document.getElementById("terminal");
  const fakeInput = document.getElementById("line");
  const realInput = document.getElementById("inp");
  const sect = document.getElementById("sect");

  const logoTemplate = document.getElementById("logo-template").textContent;

  document.getElementById("logo-template").remove();

  const randHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

  let user = localStorage.getItem("loggedInUser");
  let pass = localStorage.getItem("loggedInPassword");

  let systemID = "_VNetAA:" + randHex(4) + "-" + randHex(4);
  let serverPort = Math.floor(Math.random() * 40000) + 10000;
  let server = Math.floor(Math.random() * 23) + 1

  let scanning = false;
  let demo = false;
  let input_enabled = true;

  let availUpdates = 0;

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
              name: "Administrator",
              password: "AdminAccessGLOBAL"
          },
          fmccarty: {
              name: "F. McCarty",
              password: "apateonas"
          }
        }

  const bootLines = [
            {
                  line: "SYSTEM INITIALIZING",
                  delay: 250
            },
            {
                  line: "INTERFACE INITIALIZING",
                  delay: 250
            },
            {
                  line: "CORE COMMANDS INITIALIZING",
                  delay: 250
            },
            {
                  line: "CORE COMMANDS INITIALIZED",
                  delay: 50
            },
            {
                  line: "SUBSYSTEM COMMANDS INITIALIZING",
                  delay: 250
            },
            {
                  line: "SUBSYSTEM COMMANDS INITIALIZED",
                  delay: 50
            },
            {
                  line: "ESTABLISHING CONNECTION TO VNET",
                  delay: 500
            },
            {
                  line: "ESTABLISHED CONNECTION TO VNET",
                  delay: 50
            },
            {
                  line: "CONNECTED TO VNET SERVER ENDPOINT, PORT:" + serverPort,
                  delay: 10
            },
            {
                  line: "REGISTERING SYSTEM '" + systemID + "' TO SERVER " + server,
                  delay: 55
            },
            {
                  line: "SYSTEM REGISTERED TO SERVER " + server,
                  delay: 150
            },
            {
                  line: "LOGGING SYSTEM ACCESS TO SERVER " + server,
                  delay: 15
            },
            {
                  line: "RECIEVING FILES",
                  delay: 2550
            },
            {
                  line: "RECIEVED FILES",
                  delay: 150
            },
            {
                  line: "TERMINAL FULLY INITIALIZED",
                  delay: 250
            },
      ];

      let i = 0;
      const bootContainer = document.createElement("div");
      terminal.appendChild(bootContainer);

      function typeBootLine() {
        if (!logins[user]) {
          window.location.replace("invalidLogin");
        }
        else if (logins[user].password != pass) {
          window.location.replace("invalidLogin");
        }
        if (i < bootLines.length) {
          if (bootLines[i].line) {
            const line = document.createElement("div");
            line.parentElement = fakeInput;
            line.textContent = bootLines[i].line;
            bootContainer.appendChild(line);
            i++;
            setTimeout(typeBootLine, bootLines[i-1].delay);
          }
        } else {
          bootContainer.remove();
          const complete = document.createElement("div");
          terminal.appendChild(complete);
          const line = document.createElement("div");
          line.parentElement = fakeInput;
          line.textContent = "TERMINAL INITIALIZATION COMPLETE";
          complete.appendChild(line);
          setTimeout(() => {
            document.getElementById("container").style.display = "flex";
            realInput.focus();
            fakeInput.textContent = "_VNet _sys:\\Users\\" + user +">"
            initTerminal();
            complete.remove();
          }, 550);
        }
      }
      const cmds = {
          reboot: {
            response: "Attempting system reboot.",
            action: reboot
          },
          logout: {
            action: cmd_logout
          },
          cmds: {
            action: listCmds
          },
          help: {
            action: cmd_help
          },
          update: {
            action: cmd_update
          },
          errs: {
            action: cmd_errs
          },
          scan: {
            response: "Initiating threat scan.",
            action: remoteScan
          },
          get: {
            action: cmd_get
          },
          params: {
            response: "Testing.",
            action: printParam
          },
          INTERLOPE: {
            response: "\"Unknown Command: INTERLOPE\"",
            action: function() {demo = true;}
          },
          default: {
            response: "The term <cmd> is not recognized as the name of a command, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again."
          }
        }; 
      const help_responses = {
          reboot: {
            response: "Attempt system reboot of terminal. System cannot be rebooted if terminal is being accessed remotely.",
          },
          logout: {
            response: "Log out of this terminal.",
          },
          cmds: {
            response: "List every command available to this terminal."
          },
          help: {
            response: "Provides some basic helpful information for using the AdminAccess interface as well as common useful commands."
          },
          update: {
            response: "Check for and initiate updates on this terminal."
          },
          errs: {
            response: "Lists all system error codes and their description."
          },
          scan: {
            response: "Activate VarNet Virus and Threat Protection subsystem on this terminal.",
          },
          get: {
            response: "Pull a file, operable program, or outside command from the VarNet System or an outside server socket.",
          },
          params: {
            response: "Developer command. Used to test command parameters.",
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

      function initTerminal() {
        

        setInterval(() => {
          if (Math.random() > 0.6) {
            if (Math.random() > 0.4) {
              availUpdates++;
              printToTerminal("[system-info]: system-manager has identified 1 new update! Update terminal using 'update all'.");
            }
            else {
              let num = Math.floor(Math.random() * 3) + 2;
              availUpdates+= num;
              printToTerminal("[system-info]: system-manager has identified " + num +" new update! Update terminal using 'update all'.");
            }
          }
        }, 60000);

        setInterval(() => {
          if (!scanning) {
            remoteScan(true)
          }
        }, 120000);

        

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
            fakeInput.textContent = "_VNet _sys:\\Users\\" + user +">" + realInput.value;
          }
        });

        realInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            const input = realInput.value.trim();
            if (input !== "") {
              printToTerminal("> " + input);
              respond(input);
              realInput.value = "";
              if (input_enabled) {
                fakeInput.textContent = "_VNet _sys:\\Users\\" + user +">" + realInput.value;
              }
              terminal.scrollTop = terminal.scrollHeight;
              window.scrollTo(0, terminal.scrollHeight);
            }
          }
        });
        printLogo();
        printToTerminal("<strong>Welcome, " + logins[user].name + ".</strong>");
        printToTerminal("<strong><u>Please input a command</u>.</strong>");
    }

    typeBootLine();

    function remoteScan(isPassive = false) {
      disableInput();
      scanning = true;
      if (isPassive) {
        printToTerminal("[system-remote]: " + "Initiating passive system quick scan.");
      }
      else {
        printToTerminal("[system-remote]: " + "Initiating system threat scan.");
      }

      const passiveScanMessages = [
        "Passive scan complete. System stability nominal.",
        "Passive scan complete. Security intellegence is up to date.",
        "System quick scan complete.",
        "Passive scan complete. No anomalies."
      ];
      
      if (Math.random() > 0.1) {
        setTimeout(() => {
          if (isPassive) {
            let msg = passiveScanMessages[Math.floor(Math.random() * passiveScanMessages.length)];
            printToTerminal("[system-remote]: " + msg);
          }
          else {
            printToTerminal("[system-remote]: " + "System threat scan complete. No new threats found.");
          }
        }, 200)
      }
      else {
        setTimeout(() => {
          let threats = Math.floor(Math.random() * 5) + 1
          printToTerminal("[system-remote]: " + "<span style=\"color: orangered;\">WARNING: System scan identified " + threats + " system threats.");
          let threatsList = new Array(threats);
          for (let i = 0; i < threats; i++) {
            threatsList[i] = randomFiles[Math.floor(Math.random() * randomFiles.length)];
          };
          threatRemoval(threatsList);
        }, 300)
      }
      window.scrollTo(0, terminal.scrollHeight);
      realInput.focus();
      scanning = false;
      enableInput();
    }

    let randomFiles = [
      "notes.docx",
      "NumRand",
      "a3004216463_10.avif",
      "jar_single.wav",
      "IDRand",
      "HexRand",
      "Git-2.55.0.4-64-bit.exe",
      "MfeAVSvc.exe",
      "fd72c21550ecfcd36da4bbc972051c039251476e_full.jpg",
      "versailles-1st-version-scaled.jpg",
      "flstudio_win64_25.2.5.5319.exe",
      "VehicleProjectTemp-20260502T181545Z-3-001.zip",
      "a1ocgf2gncge1.png",
      "2026-10-12 20-23-34.mkv"
    ]

    const extensions = [
      ".docx",
      ".avif",
      ".jxl",
      ".js",
      ".exe",
      ".dll",
      ".bat",
      ".scr",
      ".cmd",
      ".zip",
      ".7z",
      ".jpg"
    ]

    async function threatRemoval(threatList) {
      disableInput();
      scanning = true;
      printToTerminal("[system-vnet-vatproc]: " + "Initiating threat removal.");
      for (const threat of threatList) {
        let fileSize = Math.floor(Math.random() * 5000);
        if (threat == "NumRand") {
          await removeFile(Math.floor(Math.random() * 5000) + extensions[Math.floor(Math.random() * extensions.length)], fileSize);
        }
        else if (threat == "IDRand") {
          await removeFile(randHex(6) + "-" + randHex(12) + "-" + randHex(8) + extensions[Math.floor(Math.random() * extensions.length)], fileSize)
        }
        else if (threat == "HexRand") {
          await removeFile(randHex(Math.floor(Math.random() * 12)), fileSize)
        }
        else {
          await removeFile(threat, fileSize);
        }
      }
      printToTerminal("[system-vnet-vatproc]: " + "Threat removal process complete.");
      printToTerminal("[system-vnet-vatproc]: " + "Initiating auxiliary system scan.")
      remoteScan(false);
    }

    async function removeFile(file, fileSize) {
      printToTerminal("[system-manager]: " + "Removing file \"" + file + "\" from system.");
      
      const essentialFiles = [
        "_sys\\Users",
        "_sys\Users",
        "_sys\\main",
        "_sys\main",
        "_sys\\VarNet",
        "_sys\VarNet"
      ]
      if (!essentialFiles.includes(file)) {
        return new Promise(resolve => { 
          setTimeout(() => {
            printToTerminal("[system-manager]: " + "Removed file \"" + file + "\" from system.");
            resolve();
          }, fileSize)
        });
      }
      else {
        printToTerminal("[system-manager]: " + "<span style=\"color: orangered;\">WARNING: This file is essential and cannot be removed.");
      }
    }

    function reboot() {
      disableInput();
      printToTerminal("[system-manager]: Rebooting system...")
      let attempts = Math.floor(Math.random() * 17);
      setTimeout(() => {
        printToTerminal("[system-manager]: <span style=\"color: orangered;\">Reboot failed after " + attempts + " attempts.</span>");
        printToTerminal("[err]: <span style=\"color: orangered;\">AdminAccess Terminal cannot be rebooted remotely.</span>");
        enableInput();
      }, attempts*100);
    };

    function cmd_get(src) {
      if (demo && src == "s.interlope.pull:27015") {
        printToTerminal("[]: getting socket for s.interlope.pull...")
        printToTerminal("[]: extracting data from terminal")
        printToTerminal("[]: submitting envelope")
        setTimeout(() => {
          printToTerminal("[]: recieved")
          printToTerminal("[]: request from archive submitted")
          const startDate = new Date(2006, 2, 30); 
          const endDate = new Date(2024, 1, 6); 
          printToTerminal("[]: message from server administrator : COMMITTED " + new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())).toLocaleDateString());
        }, 1037);
        
        setTimeout(() => {
          (function(){function c(){return"#"+Math.floor(16777215*Math.random()).toString(16)}function r(e){return Math.floor(Math.random()*e)+1}function l(e){e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.msRequestFullscreen&&e.msRequestFullscreen()}var d=document;d.head.innerHTML="<style>*{margin:0; overflow:hidden; padding:0;overflow:hidden;} div{  transform-origin: 50% 50%; width:100%; height:1px; position:relative; z-index:1;} </style>",d.body.innerHTML="";var w=window.screen.availHeight;for(d.body.addEventListener("click",function(){l(d.documentElement)}),i=0;w>=i;i++){var z=d.createElement("div");z.id="b"+i,z.style.backgroundColor=c(),d.body.appendChild(z)}setInterval(function(){for(var e=0;10>e;e++)d.getElementById("b"+r(w)).style.backgroundColor=c(),d.getElementById("b"+r(w)).style.height=r(4)+"px",d.body.style.backgroundColor=c(),d.body.style.transform=r(256)>128?"scale(3) rotate("+r(35)+"deg)":"rotate(0deg) scale(1)";window.scrollTo(0,document.body.scrollHeight)},10),setInterval(function(){window.scrollTo(0,0)},50);})()
          window.location.reload();
        }, 2700);
      }
      else {
        printToTerminal("[err]: " + "<span style=\"color: orangered;\">" +errs.file_not_found.response.replace("<arg>", "'" + src + "'") + "</span>");
      }
    }

    function cmd_help() {
      printToTerminal("[system-info]: Thank you for using the VarNet AdminAccess Remote Terminal System.");
      printToTerminal("[system-info]: Below are some helpful commands and a brief description regarding their function:");
      printToTerminal("• " + "help" + ": " + help_responses["help"].response);
      printToTerminal("• " + "cmds" + ": " + help_responses["cmds"].response);
      printToTerminal("• " + "errs" + ": " + help_responses["errs"].response);
      printToTerminal("• " + "update" + ": " + help_responses["update"].response);
      printToTerminal("• " + "scan" + ": " + help_responses["scan"].response);
      printToTerminal("• " + "logout" + ": " + help_responses["logout"].response);
      printToTerminal("• " + "reboot" + ": " + help_responses["reboot"].response);
      printToTerminal("[system-info]: Furthermore, to learn more information about any other command, input '-h' as the argument in your input.")
    }

    function cmd_logout() {
      disableInput();
       printToTerminal("[system-info]: Logging out...");
       localStorage.clear();
       setTimeout(() => {
          terminal.replaceChildren();
          printToTerminal("[system-info]: Logged out.");
          printToTerminal("[system-info]: Thank you for using the VarNet AdminAccess Remote Terminal System.");
          setTimeout(() => {
            window.location.replace("..")
          }, 15000);
        }, 5700);
    }

    function cmd_update(cmd) {
      if (cmd == "check" || cmd == "scan" || cmd == "get") {
        update_check();
      }
      else if (cmd == "fetch") {
        update_fetch(availUpdates);
      }
      else if (cmd == "all") {
        update_fetch(update_check());
      }
      else {
        printToTerminal("[err]: " + errs["unknown_arg"].response.replace("<arg>", cmd).replace("<cmd>", "update"))
      }
    }

    let systemDirectories = [
      "_sys\\VarNet\\",
      "_sys\\VarNet\\System\\",
      "_sys\\VarNet\\SystemResources\\",
      "_sys\\VarNet\\Resources\\",
      "_sys\\VarNet\\Firmware\\"
    ]

    let systemFiles = [
      "_sys\\VarNet\\bootstat.dat",
      "_sys\\VarNet\\vnet.ini",
      "_sys\\VarNet\\regedit.exe",
      "C_RandNum",
      "NumRand",
      "HexRand",
      "C_RandHex",
      "FullRand",
      "_sys\\VarNet\\System\\desk.cpl",
      "_sys\\VarNet\\System\\devobj.dll",
      "_sys\\VarNet\\System\\devmgr.dll",
      "_sys\\VarNet\\System\\devinv.dll"
    ]

    let rndCmdPre = [
      "Desk",
      "Desktop",
      "Dev",
      "Display",
      "Control",
      "Diag",
      "Config",
      "Disk",
      "Admin",
      "Term",
      "Terminal",
      "VarNet",
      "vnet",
      "admin",
      "config",
      "diag",
      "app",
      "Application",
      "ip",
      "Media",
      "MDM",
      "Net",
      "net",
      "reg",
      "sys",
      "Auth",
      "System"
    ]

    let rndCmdMid = [
      "Service",
      "Host",
      "Config",
      "help",
      "api",
      "Frame",
      "Control",
      "Client",
      "Manifest",
      "Access",
      "boot",
      "edit",
      "ui",
      "props",
      "Context",
      "Access",
      "Cred",
      "Input",
      "Output",
      "Core",
      "Sub",
      "base",
      "Base",
      "Shell",
      "prov",
      "diag"
    ]

    let rndCmdEnd = [
      "Manager",
      "Handler",
      "Utils",
      "Core",
      "Decoder",
      "Assistant",
      "Prov",
      "Proxy",
      "ControlPanel",
      "Panel",
      "Settings",
      "Cache",
      "Backup",
      "Broker",
      "Deploy",
      "Indexer",
      "Encoder",
      "Host",
      "Compat",
      "Shell"
    ]

    function update_check() {
      printToTerminal("[system-manager]: Checking for updates.")
      if (availUpdates < 0) {
        printToTerminal("[system-manager]: No updates found.")
        return 0
      }
      else {
        printToTerminal("[system-manager]: "+availUpdates+" updates found.")
        return availUpdates
      }
    }

    async function update_fetch(up) {
      scanning = true;
      if (up == 0) {
        printToTerminal("[system-manager]: System failed to update.")
        printToTerminal("[err]: No updates identified by system-manager.")
      }
      else {
        printToTerminal("[system-manager]: Identified " +up+ " updates.")
        
        for (let i = 1; i <= up; i++) {
          printToTerminal("[system-manager]: Initiating update " + i+"/" +up+ ".")
          let numFiles = 1 + Math.floor(Math.random() * 15);
          printToTerminal("[system-manager]: Enumerating " +numFiles+ " files.")
          printToTerminal("[system-manager]: Enumerated " +numFiles+ " files.")
          let updateList = new Array(numFiles);
            for (let i = 0; i < numFiles; i++) {
              updateList[i] = systemFiles[Math.floor(Math.random() * randomFiles.length)];
          };
          printToTerminal("[system-manager]: Estimated wait time of " + (numFiles * Math.random() * 5 )+ " seconds.")
          printToTerminal("[system-manager]: Updating...")
          disableInput();
          for (const file of updateList) {
            let directory = ""

            if ((Math.floor(Math.random() * 10) < 7)) {
              directory= systemDirectories[1];
            }
            else {
              directory= systemDirectories[Math.floor(Math.random() * systemDirectories.length)]
            }

            let fileSize = Math.floor(Math.random() * 5000);
            if (file == "NumRand") {
              await updateFile(directory + Math.floor(Math.random() * 5000) + ".dll", fileSize);
            }
            else if (file == "C_RandNum") {
              await updateFile(directory + "C_" + Math.floor(Math.random() * 5000) + ".dll", fileSize);
            }
            else if (file == "HexRand") {
              await updateFile(directory + randHex(4 + Math.floor(Math.random() * 6)) + ".dll", fileSize)
            }
            else if (file == "C_RandHex") {
              await updateFile(directory + "C_" + randHex(8) + ".dll", fileSize)
            }
            else if (file == "FullRand") {
              await updateFile(directory + genRandFile() + ".dll", fileSize);
            }
            else {
              if (file != undefined) {
                await updateFile(file, fileSize);
              }
              else {
                await updateFile(directory + genRandFile() + ".dll", fileSize);
              }
            }
          }
          printToTerminal("[system-manager]: Successfully updated " + numFiles + " files.")
          printToTerminal("[system-manager]: Update " + i +"/" + up + " complete.")
          availUpdates--;
        }
        enableInput();
      }
      scanning = false;
    }

    function genRandFile() {
      let generatedFile = ""
      let pre = rndCmdPre[Math.floor(Math.random() * rndCmdPre.length)];
      let mid = rndCmdMid[Math.floor(Math.random() * rndCmdMid.length)];
      let end = rndCmdEnd[Math.floor(Math.random() * rndCmdEnd.length)];

      if (mid.toLowerCase().trim() == pre.toLowerCase().trim() || mid.toLowerCase().trim() == end.toLowerCase().trim()) {
        mid = ""
      }
      if (end.toLowerCase().trim() == pre.toLowerCase().trim() || end.toLowerCase().trim() == mid.toLowerCase().trim()) {
        end = ""
      }
      generatedFile = pre+mid+end;
      return generatedFile;
    }

    async function updateFile(file, fileSize) {
      printToTerminal("[system-manager]: " + "Updating file \"" + file + "\".");
      return new Promise(resolve => { 
        setTimeout(() => {
          printToTerminal("[system-manager]: " + "Updated file \"" + file + "\" after " + fileSize/1000 + " seconds.");
          resolve();
        }, fileSize)
      });

    }

    function cmd_errs(spec = "none") {
      if (spec == "none") {
        printToTerminal("[system-info]: System error codes:")
        for (const err in errs) {
          printToTerminal("• " + err + " (" + errs[err].id + "): " + errs[err].response);
        };
      }
      else {
        if (errs[spec] || errs.find((id) => id == spec)) {
          printToTerminal("[system-info]: " + errs[spec] + " (" + errs[spec].id + "): " + errs[spec].response);
        }
        else {
          printToTerminal("[system-info]: Could not identify provided error.")
          printToTerminal("[err]: Please specify a valid error name or ID.")
        }
      }
    }

    async function pullFile(file) {
      const response = await fetch(file, {
        method: "get",
      });
      const line = document.createElement("div");
      line.className = "printed-file";
      line.innerHTML = text;
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
      sect.scrollTop = sect.scrollHeight;
      realInput.focus();
    }

    function listCmds() {
      printToTerminal("[system-info]: Available Commands:")
      for (const cmd in cmds) {
        if (cmd != cmds.default) {
          if (help_responses[cmd] && help_responses[cmd] != help_responses.default) {
            printToTerminal("• " + cmd + ": " + help_responses[cmd].response);
          }
          else if (cmd != "INTERLOPE" && cmd != "default") {
            printToTerminal("• " + cmd)
          }
        }
      };
    }

    function printLogo() {
        const logo = document.createElement("pre");
        logo.className = "terminal-logo";
        logo.innerHTML = logoTemplate;
        terminal.appendChild(logo);
        terminal.scrollTop = terminal.scrollHeight;              
    }

    function enableInput() {
      input_enabled = true;
      fakeInput.innerHTML = "_VNet _sys:\\Users\\" + user +">" + realInput.value;
      realInput.disabled = false;
      realInput.focus();
    }

    function disableInput() {
      input_enabled = false;
      fakeInput.innerHTML = "";
      realInput.disabled = true;
    }

    function printParam(param) {
      printToTerminal("The parameter is " + param);
    }
});


