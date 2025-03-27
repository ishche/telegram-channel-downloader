import { Api } from "telegram";
import { TotalList } from "telegram/Helpers";

export interface MessageStorage {
    saveMessages(messages: TotalList<Api.Message>): void;
    checkMediaExist(message: Api.Message): boolean;
}

export { FileStorage } from "./file-storage";