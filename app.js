import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';
import { generateCharacterResponse, rephraseMessage } from './openai-handler.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { id, type, data, member } = req.body;

  // Helper to get username
  const getUsername = () => {
    if (member && member.user) {
      return member.user.global_name || member.user.username || member.user.id;
    }
    return 'UnknownUser';
  };

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle context menu command (MESSAGE)
   */
  if (
    type === InteractionType.APPLICATION_COMMAND &&
    data.type === 3 &&
    data.name === 'Respond as Character'
  ) {
    console.log(`[CTX] User ${getUsername()} triggered Respond as Character on message ${data.target_id}`);
    // Show a modal to ask for the character name and language
    return res.send({
      type: InteractionResponseType.MODAL,
      data: {
        custom_id: `respond_modal_${data.target_id}`,
        title: 'Respond as Character',
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.INPUT_TEXT,
                custom_id: 'character_name',
                style: 1,
                label: 'Character Name',
                placeholder: 'e.g. Yoda, Gandalf, etc.',
                required: true,
              },
            ],
          },
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.INPUT_TEXT,
                custom_id: 'language',
                style: 1,
                label: 'Language (optional)',
                placeholder: 'e.g. English, Hindi, French, etc.',
                required: false,
              },
            ],
          },
        ],
      },
    });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              // Fetches a random emoji to send from a helper function
              content: `hello world ${getRandomEmoji()}`
            }
          ]
        },
      });
    }

    // "rephrase" command
    if (name === 'rephrase') {
      const { options } = data;
      const message = options.find(opt => opt.name === 'message')?.value;
      const character = options.find(opt => opt.name === 'character')?.value;
      const username = getUsername();
      console.log(`[REPHRASE] User: ${username} | Character: ${character} | Input: ${message}`);

      if (!message || !character) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Please provide both a message and a character name!"
          }
        });
      }

      const rephrased = await rephraseMessage(message, character);
      console.log(`[REPHRASE] User: ${username} | Output: ${rephrased}`);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: rephrased
        }
      });
    }

    console.error(`[ERROR] Unknown slash command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  // Handle modal submission
  if (
    type === InteractionType.MODAL_SUBMIT &&
    data.custom_id.startsWith('respond_modal_')
  ) {
    const messageId = data.custom_id.replace('respond_modal_', '');
    const channelId = req.body.channel_id;
    const character = data.components[0].components[0].value;
    const language = data.components[1]?.components[0]?.value?.trim() || 'English';
    const username = getUsername();

    console.log(`[RESPOND] User: ${username} | Character: ${character} | Fetching message: ${channelId} ${messageId}`);
    try {
      const message = await DiscordRequest(
        `channels/${channelId}/messages/${messageId}`,
        { method: 'GET' }
      );
      console.log(`[RESPOND] Message ID: ${message.id} | Author: ${message.author?.username || message.author?.id} | Content: ${message.content}`);
      let targetContent = message.content;
      if ((!targetContent || targetContent === '') && message.referenced_message && message.referenced_message.content) {
        targetContent = message.referenced_message.content;
        console.log(`[RESPOND] Used referenced_message.content for reply.`);
      }
      if ((!targetContent || targetContent === '') && message.embeds && message.embeds.length > 0) {
        targetContent = message.embeds.map(e => e.description || e.title || '').join(' ');
        console.log(`[RESPOND] Used embed content for reply.`);
      }
      if ((!targetContent || targetContent === '') && message.attachments && message.attachments.length > 0) {
        targetContent = '[Attachment]';
        console.log(`[RESPOND] Used attachment placeholder for reply.`);
      }
      if (!targetContent || targetContent === '') {
        console.log(`[RESPOND] Could not find message content to respond to.`);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "Could not find the message to respond to!" },
        });
      }
      console.log(`[RESPOND] User: ${username} | Input: ${targetContent}`);
      const response = await generateCharacterResponse(targetContent, character, language);
      console.log(`[RESPOND] User: ${username} | Output: ${response}`);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `**[${character}]** ${response}`,
          message_reference: {
            message_id: messageId,
            channel_id: channelId,
            guild_id: req.body.guild_id
          },
        },
      });
    } catch (err) {
      console.error('[RESPOND] Error fetching message:', err);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: "Discord API error: Could not fetch the message. (Maybe permissions or message too old?)" },
      });
    }
  }

  console.error(`[ERROR] Unknown interaction type: ${type}`);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

const RESPOND_CONTEXT_COMMAND = {
  name: 'Respond as Character',
  type: 3, // MESSAGE context menu
};

