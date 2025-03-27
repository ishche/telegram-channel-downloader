import { TelegramClient } from "telegram";
import { initAuth } from "../modules/auth";

import {
  getMessages,
  downloadMessageMedia,
  getMessageDetail,
} from "../modules/messages";
import { getMediaPath, getMediaType, checkFileExist, wait } from "../utils/helper";
import {
  updateLastSelection,
  getLastSelection,
} from "../utils/file-helper";
import logger from "../utils/logger";
import { getDialogName, getAllDialogs } from "../modules/dialoges";
import { selectInput, downloadOptionInput } from "../utils/input-helper";
import { MessageStorage, FileStorage } from "../storage";

const MAX_PARALLEL_DOWNLOAD = 5;
const MESSAGE_LIMIT = 30;


/**
 * Handles downloading media from a Telegram channel
 */
export default class DownloadChannel {
  static description() {
    return "Download all media from a channel";
  }
  
  downloadableFiles: undefined | { all: any };

  constructor() {
    this.downloadableFiles = null;
  }

  /**
   * Checks if a message contains media
   * @param {Object} message The Telegram message object
   */
  hasMedia(message) {
    return Boolean(message.media);
  }

  /**
   * Determines if a message's media should be downloaded
   * @param {Object} message The Telegram message object
   */
  canDownload(message): boolean {
    if (!this.hasMedia(message)) return false;
    // const mediaType = getMediaType(message);
    // const mediaPath = getMediaPath(message, this.outputFolder);
    // const fileExists = checkFileExist(message, this.outputFolder);
    // const extension = path.extname(mediaPath).toLowerCase().replace(".", "");
    // const allowed = 
      // this.downloadableFiles?.[mediaType] ||
      // this.downloadableFiles?.[extension] ||
      // this.downloadableFiles?.all;
    // return allowed && !fileExists;
    return false;
  }

  /**
   * Recursively fetches and downloads all available media from the channel
   * @param client The Telegram client instance
   * @param channelId The channel ID
   * @param offsetMsgId The message offset
   */
  async downloadChannel(
    client: TelegramClient,
    channelId: number,
    offsetMsgId: number = 0
  ) {
    try {
      let messageStorage: MessageStorage = new FileStorage(channelId);
      while (true) {
        logger.info(`New iteration offsetMsgId: ${offsetMsgId}`);
        const messages = await getMessages(
          client,
          channelId,
          MESSAGE_LIMIT,
          offsetMsgId
        );
        if (!messages.length) {
          logger.info("No more messages to download");
          return;
        }
        const ids = messages.map((m) => m.id);

        const details = await getMessageDetail(client, channelId, ids);
        // function async downloadMessages()
        {
          // const downloadQueue: Promise<boolean>[] = [];
          // for (const msg of details) {
            // if (this.canDownload(msg)) {
            //   logger.info(`Downloading ${msg.id}`);
            //   const resultPromise = downloadMessageMedia(
            //     client,
            //     msg,
            //     getMediaPath(msg, this.outputFolder)
            //   );
            //   downloadQueue.push(resultPromise);
            // } else {
            //   // logger.info(`No media to download for ${msg.id}`);
            // }
            // if (downloadQueue.length >= MAX_PARALLEL_DOWNLOAD) {
            //   logger.info(`Processing ${MAX_PARALLEL_DOWNLOAD} downloads`);
            //   await Promise.all(downloadQueue);
            //   downloadQueue.length = 0;
            //   await wait(3);
            // }
          // }

          // await Promise.all(downloadQueue);
          messageStorage.saveMessages(details);
          // const delay = Math.random() * 1 + 1;
          // logger.info(`Rest for ${delay} seconds`);
          // await wait(delay);
        }
        
        updateLastSelection({
          messageOffsetId: messages[messages.length - 1].id,
          channelId: "" + channelId
        });

        await wait(1);
        offsetMsgId = messages[messages.length - 1].id;
      }
    } catch (err) {
      logger.error("An error occurred:");
      console.error(err);
    }
  }

  async configureDownload(options, client) {
    let channelId = options.channelId;
    let downloadableFiles = options.downloadableFiles;
    if (!channelId) {
      logger.info("Please select a channel to download media from");
      const allChannels = await getAllDialogs(client);
      const options = allChannels.map((d) => ({
        name: d.name,
        value: d.id,
      }));

      const selectedChannel = await selectInput(
        "Please select a channel",
        options
      );
      channelId = selectedChannel;
    }
    if (!downloadableFiles) {
      downloadableFiles = await downloadOptionInput();
    }

    this.downloadableFiles = downloadableFiles;

    const lastSelection = getLastSelection(channelId);
    let messageOffsetId = lastSelection.messageOffsetId || 0;

    if (Number(lastSelection.channelId) !== Number(channelId)) {
      messageOffsetId = 0;
    }
    updateLastSelection({ messageOffsetId, channelId });
    return { channelId, messageOffsetId };
  }

  /**
   * Main entry point: initializes auth, sets up output folder, and starts download
   */
  async handle(options = {}) {
    let client: TelegramClient;
    try {
      client = await initAuth();
      const { channelId, messageOffsetId } = await this.configureDownload(
        options,
        client
      );

      const dialogName = await getDialogName(client, channelId);
      logger.info(`Downloading media from channel ${dialogName}`);
      await this.downloadChannel(client, channelId, messageOffsetId);
    } catch (err) {
      logger.error("An error occurred:" + err);
    } finally {
      if (client) await client.disconnect();
      process.exit(0);
    }
  }
}
