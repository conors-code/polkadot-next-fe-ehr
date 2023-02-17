// database.config.ts
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import Dexie, {Table} from "dexie";

export interface HCProvider {
    id: number,
    account: InjectedAccountWithMeta;
    name: string;
    specialty: string;
    location: string;
    publicKey: Uint8Array;
    secretKey: Uint8Array;
}



export class EHRSubClassedDexie extends Dexie {
    // 'friends' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    hcProvider!: Table<HCProvider>;

    constructor() {
      super("TestEHRDB");
      this.version(1).stores({
        hcProvider: '++id, account, name, specialty, location, publicKey, secretKey'
      });
    }
  }

export const db = new EHRSubClassedDexie();