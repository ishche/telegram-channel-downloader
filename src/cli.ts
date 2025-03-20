"use strict";
// example command script
// - node cli script-name --option1=value1 --option2=value2
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import DownloadChannel from "./scripts/download-channel";
import ListenChannel from "./scripts/listen-channel";
import DownloadMessage from "./scripts/download-selected-message";

const logger = require("./utils/logger");

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    `Unhandled Rejection: ${reason instanceof Error ? reason.message : reason}`
  );
  logger.error(`Promise: ${promise}`);
  if (reason instanceof Error) {
    logger.error(reason.stack);
  }
  process.exit(1);
});

function initCommands(): {[key: string]: CommandDesc} {
  const commands: CommandDesc[] = [
    {
      signature: "download-channel",
      description: DownloadChannel.description(),
      handle: o => new DownloadChannel().handle(o),
      help: ""
    },
    {
      signature: "download-selected-message",
      description: DownloadMessage.description(),
      handle: _ => new DownloadMessage().handle(),
      help: ""
    },
    {
      signature: "listen-channel",
      description: ListenChannel.description(),
      handle: o => new ListenChannel().handle(o),
      help: ""
    }
  ];
  const result = {};
  commands.forEach(c => result[c.signature] = c);
  return result;
}

/**
 * Logs the available commands to the console.
 * It iterates over the keys of the `availableCommands` object and logs each command signature.
 */
function logAvailableCommands() {
  logger.success("Available commands:");
  const allCommands = Object.values(initCommands()).map(
    (command) => ({
      signature: command.signature,
      description: command.description,
    })
  );

  logger.table(allCommands);
}

/**
 * Parses command-line arguments into a script signature and options object.
 *
 * @param {string[]} argv - The array of command-line arguments.
 * @returns {Object} An object containing the script signature and options.
 * @returns {string} return.scriptSignature - The script signature (usually the command to run).
 * @returns {Object} return.options - An object containing key-value pairs of options.
 */
function parseArguments(argv) {
  const scriptSignature = argv[2];
  const args = argv.slice(3);
  const options = {};

  args.forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=", 2);
      options[key] = value === undefined ? true : value;
    }
  });

  return { scriptSignature, options };
}

/**
 * Executes a command script located at the given path with the specified options.
 *
 * @param commandPath - The path to the command script to execute.
 * @param options - The options to pass to the command script.
 * @returns A promise that resolves when the command execution is complete.
 */
async function runCommand(command: CommandDesc, options: Object): Promise<void> {
  logger.info(`${command.signature} - ${command.description}`);

  if ((options as any).help) {
    if (command.help) {
      logger.info(command.help);
    } else {
      logger.info("No help available for this command");
    }
    return;
  }
// const Command = require(commandPath);
  await command.handle(options);
}

/**
 * Parses the command line arguments and extracts the script signature and options.
 *
 * @param {string[]} process.argv - The array of command line arguments passed to the script.
 * @returns {{ scriptSignature: string, options: object }} An object containing the script signature and options.
 */

(async () => {
  if (!fs.existsSync("./export")) {
    fs.mkdirSync("./export");
  }

  const availableCommands = initCommands();
  const { scriptSignature, options } = parseArguments(process.argv);

  if (scriptSignature) {
    const commandDetail = availableCommands[scriptSignature];
    if (commandDetail) {
      await runCommand(commandDetail, options);
    }
  } else {
    logAvailableCommands();
  }
})();
