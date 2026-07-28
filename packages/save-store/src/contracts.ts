import type { GameSession } from "@brass-ledger/shared";

export interface SaveStore {
  create(session: GameSession): Promise<void>;
  read(sessionId: string): Promise<GameSession>;
  write(session: GameSession, expectedRevision?: number): Promise<void>;
  delete(sessionId: string): Promise<void>;
  list(): Promise<GameSession[]>;
}

export class InvalidSessionIdError extends Error {
  constructor(readonly sessionId: string) {
    super(`That is not a valid campaign id: ${sessionId}`);
    this.name = "InvalidSessionIdError";
  }
}

export class SessionNotFoundError extends Error {
  constructor(readonly sessionId: string) {
    super(`No saved campaign with the id ${sessionId}. It may have been deleted.`);
    this.name = "SessionNotFoundError";
  }
}

export class SessionExistsError extends Error {
  constructor(readonly sessionId: string) {
    super(`A saved campaign with the id ${sessionId} already exists.`);
    this.name = "SessionExistsError";
  }
}

export class RevisionMismatchError extends Error {
  constructor(
    readonly expectedRevision: number,
    readonly currentRevision: number,
  ) {
    super(
      "This campaign has changed since you loaded it, so your change was not applied. "
      + "Reload the campaign and try again. "
      + `(revision mismatch: expected ${expectedRevision}, current ${currentRevision})`,
    );
    this.name = "RevisionMismatchError";
  }
}

export class LockTimeoutError extends Error {
  constructor(readonly sessionId: string) {
    super(`Gave up waiting to save campaign ${sessionId}. Another change to it is still in progress.`);
    this.name = "LockTimeoutError";
  }
}

export class SaveStoreCorruptError extends Error {
  constructor(
    readonly sessionId: string | null,
    message = sessionId
      ? `The saved file for campaign ${sessionId} cannot be read.`
      : "The save store contains a file that cannot be read.",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SaveStoreCorruptError";
  }
}

export class SaveStoreIOError extends Error {
  constructor(
    readonly operation: string,
    readonly sessionId: string | null,
    options?: ErrorOptions,
  ) {
    super(
      sessionId
        ? `Could not ${operation} the saved campaign ${sessionId}.`
        : `Could not ${operation} the save store.`,
      options,
    );
    this.name = "SaveStoreIOError";
  }
}
