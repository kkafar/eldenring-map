import { DataStore } from "./data-store";
import { createDrizzleAdapter, DataStoreSqliteImpl } from "./impl";

let DATA_STORE_PROVIDER_INSTANCE: DataStoreProvider | null = null;

export interface DataStoreProvider {
  getDataStore(): DataStore;
}

export function getDataStoreProviderInstance() {
  if (!DATA_STORE_PROVIDER_INSTANCE) {
    DATA_STORE_PROVIDER_INSTANCE = new DataStoreProviderImpl();
  }
  return DATA_STORE_PROVIDER_INSTANCE;
}

class DataStoreProviderImpl implements DataStoreProvider {
  getDataStore(): DataStore {
    return new DataStoreSqliteImpl(createDrizzleAdapter());
  }
}

