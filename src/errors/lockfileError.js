export class LockfileError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = "LockfileError"; // (2)
    }
  }