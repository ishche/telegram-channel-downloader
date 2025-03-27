import * as fs from "fs";
import * as path from "path";

import { circularStringify, logMessage } from "../utils/helper";
import { Api } from "telegram";
import { TotalList } from "telegram/Helpers";
import { MessageStorage } from ".";

export class FileStorage implements MessageStorage {
    private outputFolder: string;
  
    constructor(channelId: number) {
      this.outputFolder = path.join(
        process.cwd(),
        "export",
        channelId.toString()
      );
  
      if (!fs.existsSync(this.outputFolder)) {
        fs.mkdirSync(this.outputFolder, { recursive: true });
      }
    }
    saveMessages(messages: TotalList<Api.Message>): void {
      const filePath = path.join(this.outputFolder, "all_message.json");
      if (!fs.existsSync(this.outputFolder)) {
        fs.mkdirSync(this.outputFolder, { recursive: true });
      }
      const data = [];
      for (const msg of messages) {
        data.push({
          id: msg.id,
          message: msg.message,
          date: msg.date,
          out: msg.out,
          hasMedia: !!msg.media,
          fromId: msg.fromId,
          peerId: msg.peerId,
          // mediaType: this.hasMedia(msg) ? getMediaType(msg) : undefined,
          // mediaPath: this.hasMedia(msg)
          //   ? getMediaPath(msg, this.outputFolder)
          //   : undefined,
          // mediaName: this.hasMedia(msg)
          //   ? path.basename(getMediaPath(msg, this.outputFolder))
          //   : undefined,
        });
      }
      appendToJSONArrayFile(filePath, data);
    }
    checkMediaExist(message: Api.Message): boolean {
      return true;
    }
  }
  
  // Append data to a JSON array file
  const appendToJSONArrayFile = (filePath, dataToAppend) => {
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, circularStringify(dataToAppend, 2));
      } else {
        const data = fs.readFileSync(filePath);
        const json = JSON.parse(data.toLocaleString());
        json.push(dataToAppend);
        fs.writeFileSync(filePath, circularStringify(json, 2));
      }
    } catch (e) {
      logMessage.error(`Error appending to JSON Array file ${filePath}`);
      console.error(e);
    }
  };
  