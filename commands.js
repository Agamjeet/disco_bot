import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const REPHRASE_COMMAND = {
  name: 'rephrase',
  description: 'Rephrase a message in a character\'s style',
  options: [
    {
      type: 3, // STRING type
      name: 'message',
      description: 'The message to rephrase',
      required: true
    },
    {
      type: 3, // STRING type
      name: 'character',
      description: 'The character to rephrase as',
      required: true
    }
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2]
};

const RESPOND_CONTEXT_COMMAND = {
  name: 'Respond as Character',
  type: 3 // MESSAGE context menu
};

const ALL_COMMANDS = [TEST_COMMAND, REPHRASE_COMMAND, RESPOND_CONTEXT_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
