import path from 'path';
import fs from 'fs';
import { DeployService } from './deploy.service';
import { Account } from '@tonclient/appkit';
import { globals } from '../config/globals'

export class DeployTrueNftService {
    private deployService : DeployService;

    constructor() {
        this.deployService = new DeployService();
    }
    
    async deployTrueNft(pathWithContracts : string) : Promise<void> {
        
        let indexBasisContract = fs.readFileSync(path.resolve(pathWithContracts, "IndexBasis.sol")).toString();
        let dataContract = fs.readFileSync(path.resolve(pathWithContracts, "Data.sol")).toString();
        let indexContract = fs.readFileSync(path.resolve(pathWithContracts, "Index.sol")).toString();
        let rootNftContract = fs.readFileSync(path.resolve(pathWithContracts, "NftRoot.sol")).toString();
        
        let dataAccount = await this.deployService.createContractAccount(dataContract, pathWithContracts);
        let indexAccount = await this.deployService.createContractAccount(indexContract, pathWithContracts);
        let rootNftAccount = await this.deployService.createContractAccount(rootNftContract, pathWithContracts);
        let indexBasisAccount = await this.deployService.createContractAccount(indexBasisContract, pathWithContracts);
        
        await this.deployRootNft(rootNftAccount, indexAccount, dataAccount);
        await this.deployBasis(rootNftAccount, indexBasisAccount);
    }
    
    private async deployRootNft(rootNftAccount: Account, indexAccount: Account, dataAccount: Account) : Promise<void> {
        try {
            await this.deployService.deploy(
                rootNftAccount,
                {
                    codeIndex: (await this.deployService.getDecodeTVC(indexAccount)).code,
                    codeData: (await this.deployService.getDecodeTVC(dataAccount)).code  
                }
            );
        } catch(err) {
            console.log(err);
        }
    }
    
    private async deployBasis(rootNftAccount: Account, indexBasisAccount: Account) : Promise<void> {
        let body = await this.getBody(rootNftAccount, indexBasisAccount);
        let walletAcc = await this.getWalletAcc(rootNftAccount);
        let rootNftAddress = await rootNftAccount.getAddress();
        let transaction = await this.getTransaction(walletAcc, rootNftAddress, body);
        const result = await this.getResult(rootNftAccount, rootNftAddress, transaction)
        console.log(result);
    }

    private async getBody(rootNftAccount: Account, indexBasisAccount: Account) : Promise<string> {
        let { body } = await rootNftAccount.client.abi.encode_message_body({
            abi: rootNftAccount.abi,
            signer: rootNftAccount.signer,
            is_internal: true,
            call_set: {
                function_name: "deployBasis",
                input: {
                    codeIndexBasis: (await this.deployService.getDecodeTVC(indexBasisAccount)).code
                }
            },
        });
        return body;
    }

    private async getTransaction(walletAcc: Account, rootNftAddress: string, body: string) : Promise<any> {
        let { transaction } = await walletAcc.run(
            "sendTransaction",
            {
                dest: rootNftAddress,
                value: 600_000_000,
                flags: 3,
                bounce: true,
                payload: body,
            }
        );
        return transaction;
    }

    private async getResult(rootNftAccount: Account, rootNftAddress: string, transaction: any) {
        let { result } = await rootNftAccount.client.net.wait_for_collection({
            collection: "transactions",
            filter: {
                account_addr: { eq: rootNftAddress },
                now: { ge: transaction.now },
                aborted: { eq: false },
            },
            result: "now aborted",
            timeout: 10000,
        });
        return result;
    }

    // This is a SafeMultisig Wallet contract for testing purposes.
    // In TON OS SE this contract is predeployed at 0:d5f5cfc4b52d2eb1bd9d3a8e51707872c7ce0c174facddd0e06ae5ffd17d2fcd 
    // address with one single custodian and its initial balance is about 1 million tokens.
    private async getWalletAcc(rootNftAccount: Account) : Promise<Account> {
        let walletAbi = await JSON.parse(fs.readFileSync(path.resolve(globals.BASE_PATH, "src", "sample-data", "safeMultisigWallet", "SafeMultisigWallet.abi.json")).toString());
        let walletTvc = fs.readFileSync(path.resolve(globals.BASE_PATH, "src", "sample-data", "safeMultisigWallet", "SafeMultisigWallet.tvc"), {encoding: 'base64'});
        const walletAcc = new Account(
            {
                abi: walletAbi, 
                tvc: walletTvc
            },
            {
                client: rootNftAccount.client,
                address: "0:d5f5cfc4b52d2eb1bd9d3a8e51707872c7ce0c174facddd0e06ae5ffd17d2fcd",
                signer: {
                    type: "Keys",
                    keys: {
                        public: "99c84f920c299b5d80e4fcce2d2054b05466ec9df19532a688c10eb6dd8d6b33",
                        secret: "73b60dc6a5b1d30a56a81ea85e0e453f6957dbfbeefb57325ca9f7be96d3fe1a"
                    }
                }
            }
        );
        return walletAcc;
    }
}