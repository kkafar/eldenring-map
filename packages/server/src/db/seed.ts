// class MockDataSource implements

import { SeedingDataSource } from "./data-source";
import { DataStore } from "./data-store";

class SeedingCoordinator {
  dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
  }

  seedFromDataSources(dataSources: [SeedingDataSource]) {
    for (const dataSource of dataSources) {
      this.seedFromDataSource(dataSource);
    }
  }

  seedFromDataSource(dataSource: SeedingDataSource) {
    const users = dataSource.getUsers();

    for (const user of users) {
      const userProfiles = dataSource.getProfilesForUser(user);
      this.dataStore.createUser(user);
      // this.dataStore.
    }
  }
}
