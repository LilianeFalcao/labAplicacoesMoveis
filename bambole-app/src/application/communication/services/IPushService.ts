export interface IPushService {
    send(tokens: string[], title: string, body: string): Promise<void>;
}
