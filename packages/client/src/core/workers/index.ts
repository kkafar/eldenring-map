class ConcreteTaskWorkerPool {
  pool: Worker[]

  constructor(modulePath: string, poolSize: number = 4) {
    this.pool = new Array<Worker>(poolSize);
    for (let i = 0; i < poolSize; i++) {
      this.pool[i] = new Worker(modulePath);
    }
  }
}
