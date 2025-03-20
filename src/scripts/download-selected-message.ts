import { initAuth } from "../modules/auth";
import * as path from "path";
import { downloadMessageMedia } from "../modules/messages";
const { getMessageDetail } = require("../modules/messages");
const { logMessage, getMediaPath } = require("../utils/helper");
const { textInput } = require("../utils/input-helper");

export default class DownloadMessage {
  // -------------------------------
  // Accepts the following parameters:
  // - Channel ID
  // - Message ID(s) (separated by comma)
  // -------------------------------
  static description() {
    return "Download media from a messages";
  }

  async downloadMessage(client, channelId, messageIds) {
    const outputFolder = path.join(process.cwd(), "export", channelId.toString());
    const messageArr = await getMessageDetail(client, channelId, messageIds);
    for (const message of messageArr) {
      downloadMessageMedia(
        client,
        message,
        getMediaPath(message, outputFolder)
      );
    }
    logMessage.success("Done with downloading messages");
  }

  async handle() {
    let client;
    try {
      client = await initAuth();
      const channelId = textInput("Please Enter Channel ID: ");
      const messageIdsText = textInput(
        "Please Enter Message Id(s) (separated by comma): "
      );
      const messageIds = messageIdsText.split(",").map(Number);

      await this.downloadMessage(client, channelId, messageIds);
    } catch (error) {
      logMessage.error("An error occurred:", error);
    } finally {
      if (client) {
        await client.disconnect();
      }

      process.exit(0);
    }
  }
}
