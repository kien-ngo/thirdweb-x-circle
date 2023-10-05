# Mint NFT from a thirdweb collection with Circle Programmable wallet

Workflow:
- When user signup using Supabase, the Supabase Database Webhook will call a POST request to the endpoint @ `/api/webhook_userCreated`, which will perform the following actions:
1. Generate the Circle wallet for that user
2. Update the refId and name of the wallet to that user's (supabase) ID and email
3. <Demo purpose only> Send that user some testnet tokens using thirdweb SDK

   
![image](https://github.com/kien-ngo/thirdweb-x-circle/assets/26052673/86dd7afa-3ab8-4914-8541-046183df1ecb)

