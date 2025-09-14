import { Client, AccountId, Hbar, TransferTransaction, TokenId } from "@hashgraph/sdk";
import type { Link } from "@prisma/client";
import { HashConnect, HashConnectConnectionState } from "hashconnect";
import type { SessionData } from "hashconnect";
import { useRuntimeConfig } from "nuxt/app";
import { ref } from "vue";
import type { Ref } from "vue";

import { LedgerId } from "@hashgraph/sdk";

interface Transfer {
    account: string;
    amount: number;
}

interface TransactionRecord {
    result: string;
    transfers: Transfer[];
    memo: number;
}

interface TransactionData {
    amount: number;
    currency: string;
    memo: string;
    timestamp: string;
}

interface MirrorNodeResponse {
    transactions: TransactionRecord[];
}

export class HederaService {
    private client: Client;
    private network: string;
    private networkUrl: string;
    private usdcTokenId: string;

    private appMetadata = {
        name: "HashFast",
        description: "HashFast Payments",
        icons: ["https://www.hashfast.app/app-icon.svg"],
        url: "https://www.hashfast.app",
    };

    private hashconnect: HashConnect;

    // public state: HashConnectConnectionState = HashConnectConnectionState.Disconnected
    public state: Ref<HashConnectConnectionState> = ref(HashConnectConnectionState.Disconnected);
    public pairingData?: SessionData | null;

    constructor() {
        const config = useRuntimeConfig();

        // Initialize client based on network
        if (config.public.hederaNetwork === "mainnet") {
            this.client = Client.forMainnet();
            this.network = "mainnet";
            this.networkUrl = "https://mainnet.mirrornode.hedera.com";
            this.usdcTokenId = "0.0.456858";
        } else {
            this.client = Client.forTestnet();
            this.network = "testnet";
            this.networkUrl = "https://testnet.mirrornode.hedera.com";
            this.usdcTokenId = "0.0.429274";
        }

        //create the hashconnect instance
        this.hashconnect = new HashConnect(
            LedgerId.TESTNET,
            "b8b1efb6a5dc745fcde127bf04d22506",
            this.appMetadata,
            false,
        );
    }

    async initHashConnect() {
        //register events
        this.setUpHashConnectEvents();

        //initialize
        await this.hashconnect.init();

        //open pairing modal
        this.hashconnect.openPairingModal();
    }

    async disconnectHashConnect() {
        await this.hashconnect.disconnect();
        this.pairingData = null;
        this.state.value = HashConnectConnectionState.Disconnected;
    }

    setUpHashConnectEvents() {
        this.hashconnect.pairingEvent.on((newPairing) => {
            console.log("new pairing:", newPairing);
            this.pairingData = newPairing;
        });

        this.hashconnect.disconnectionEvent.on((data) => {
            this.pairingData = null;
        });

        this.hashconnect.connectionStatusChangeEvent.on((connectionStatus) => {
            this.state.value = connectionStatus;
            console.log("state changed to:", this.state.value);
        });
    }

    // isPaired() {
    //     console.log(this.state);
    //     return this.state === HashConnectConnectionState.Connected || this.state === HashConnectConnectionState.Paired;
    // }

    parseTransactionId(transactionId: string): string {
        const [accountId, timestampPart] = transactionId.split("@");

        if (!accountId || !timestampPart) {
            throw new Error("Invalid Hedera transaction ID");
        }

        // replace the dot between seconds and nanos with a dash
        const timestamp = timestampPart.replace(".", "-");
        return `${accountId}-${timestamp}`;
    }

    async getAllTransactionData(transactionId: string): Promise<any> {
        let txId = this.parseTransactionId(transactionId);
        const url = `${this.networkUrl}/api/v1/transactions/${txId}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Mirror node fetch failed: ${res.status}`);
        }

        const data: MirrorNodeResponse = await res.json();
        return data.transactions[0];
    }

    async getTransactionData(transactionId: string, receiverId: string): Promise<TransactionData> {
        let paymentData = await this.getAllTransactionData(transactionId);

        let amount = 0;
        let currency = "?";

        let memo = atob(paymentData["memo_base64"]);
        let timestamp = paymentData["consensus_timestamp"];
        let transfers = paymentData["transfers"];
        let tokenTransfers = paymentData["token_transfers"];

        if (tokenTransfers.length > 0) {
            currency = "USDC";
            for (let i = 0; i < tokenTransfers.length; i++) {
                // find the relevant token transfer
                if (tokenTransfers[i]["token_id"] == this.usdcTokenId && tokenTransfers[i]["account"] == receiverId) {
                    amount = tokenTransfers[i]["amount"] / 1e6;
                    break;
                }
            }
        } else if (transfers.length > 0) {
            currency = "HBAR";
            for (let i = 0; i < transfers.length; i++) {
                // find the relevant token transfer
                if (transfers[i]["account"] == receiverId) {
                    amount = Number(transfers[i]["amount"]) / 100_000_000;
                    break;
                }
            }
        }

        return { amount, currency, memo, timestamp };
    }

    async getTotalTransactionAmount(paymentIds: string[], receiverId: string): Promise<number> {
        let amount = 0;

        for (let i = 0; i < paymentIds.length; i++) {
            amount += (await this.getTransactionData(paymentIds[i], receiverId)).amount;
        }

        return parseFloat(amount.toFixed(2));
    }

    async waitForPairing(): Promise<SessionData | null> {
        return new Promise((resolve) => {
            console.log(" waiting for pairing...");
            this.hashconnect.pairingEvent.once((pairingData: SessionData | null) => {
                resolve(pairingData);
            });
        });
    }

    async sendPayment(link: Link) {
        if (!link.accountId) {
            throw new Error("Link does not have an accountId");
        }
        if (!link.amount) {
            throw new Error("Link does not have an amount");
        }
        if (!link.currency) {
            throw new Error("Link does not have a currency");
        }

        const memo = link.memo ? link.memo : "";

        if (this.state.value === HashConnectConnectionState.Disconnected) {
            await this.initHashConnect();

            await this.waitForPairing();
        }

        if (!this.pairingData) return;
        // let accountId = this.pairingData ? this.pairingData.accountIds[0] : "";

        const toAccount = AccountId.fromString(link.accountId);
        const fromAccount = AccountId.fromString(this.pairingData.accountIds[0]);
        const signer = this.hashconnect.getSigner(fromAccount as any);

        if (link.currency == "hbar") {
            const tinybarAmount = Number(link.amount) * 100_000_000;

            const transaction = await new TransferTransaction()
                .addHbarTransfer(fromAccount, Hbar.fromTinybars(-1 * tinybarAmount)) //Sending account
                .addHbarTransfer(toAccount, Hbar.fromTinybars(tinybarAmount)) //Receiving account
                .setTransactionMemo(memo)
                .freezeWithSigner(signer as any);

            return await this.executeTransaction(transaction);
        }

        if (link.currency == "usdc") {
            const scaledAmount = +link.amount * 1e6;
            const usdcAmount = Number(scaledAmount);

            const transaction = await new TransferTransaction()
                .addTokenTransfer(TokenId.fromString(this.usdcTokenId), fromAccount, -usdcAmount) //Sending account
                .addTokenTransfer(TokenId.fromString(this.usdcTokenId), toAccount, usdcAmount) //Receiving account
                .setTransactionMemo(memo)
                .freezeWithSigner(signer as any);

            return await this.executeTransaction(transaction);
        }

        return { transactionId: null, receipt: null }; // failed, unknown currency
    }

    async executeTransaction(transaction: TransferTransaction) {
        if (!this.pairingData) return;

        const fromAccount = AccountId.fromString(this.pairingData.accountIds[0]); // assumes paired and takes first paired account id
        const signer = this.hashconnect.getSigner(fromAccount as any);

        try {
            const response = await transaction.executeWithSigner(signer as any);
            const transactionId = response.transactionId.toString();
            const receipt = await response.getReceiptWithSigner(signer as any);
            return { transactionId, receipt };
        } catch (e) {
            console.log(e);

            return { transactionId: null, receipt: null };
        }
    }
}
