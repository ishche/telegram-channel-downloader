import { Api } from "telegram";
import { TotalList } from "telegram/Helpers";
import { MessageStorage } from ".";

import { Client } from 'pg'

export class PgSqlStorage implements MessageStorage {
    private client: Client;
    constructor() {
        this.client = new Client()
    }
    saveMessages(messages: TotalList<Api.Message>): void {
        this.connect();
        throw new Error("Method not implemented.");
    }
    checkMediaExist(message: Api.Message): boolean {
        this.connect();
        throw new Error("Method not implemented.");
    }

    private async connect() {
        await this.client.connect()
    }
}