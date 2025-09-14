# Information for Testers

Some helpful notes for anyone testing **HashFast**.

Please feel free to reach out to me if you have any questions.

## Testnet

HashFast currently operates **only** on the **testnet**.

## Wallets

Always ensure that the wallet address used to pay a payment link is **different** from the wallet that will receive the funds.
The receiving wallet is displayed on the payment page.
If the same wallet is used for both sending and receiving, **no funds will be transferred**.

## Receiving USDC

To receive USDC on testnet, the USD Token must be associated with your account.
More information: [Associate tokens to an account](https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service/associate-tokens-to-an-account)

For quick testing, you can change the receiving wallet address under **'Account'** to `0.0.4505361` or `0.0.4915084`. These testnet accounts are already set up to receive USD Tokens.

## Personalized Links (Temporary links)

To some testers the purpose of the personalized links was unclear.

Personalized links are a convenient feature for keeping the **Link Dashboard** clean and organized, whilst adding the possibility to share a payment link that is slightly different to an existing payment link. The temporary/personalized link is not stored in HashFast and received payments show up inside the original Link item.

For example:

-   Offering a specific customer a discount
-   Extending a payment deadline for a particular customer

This feature likely will become more clear and valuable in a real production environment.
