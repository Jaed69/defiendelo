import type { Account, Assignment } from "@/domain/types";
import type { AssignmentStore } from "@/ports/assignment-store";

const globalForStore = globalThis as unknown as { __assignments?: Map<string, Assignment>; __accounts?: Map<string, Account> };

/** Process-local store for development. Data is lost on restart and is not shared across serverless instances. */
export class MemoryAssignmentStore implements AssignmentStore {
  private readonly items = (globalForStore.__assignments ??= new Map());
  private readonly accounts = (globalForStore.__accounts ??= new Map());

  async get(id: string): Promise<Assignment | null> {
    const item = this.items.get(id);
    return item ? structuredClone(item) : null;
  }

  async save(assignment: Assignment): Promise<void> {
    this.items.set(assignment.id, structuredClone(assignment));
  }

  async getAccount(code: string): Promise<Account | null> {
    const item = this.accounts.get(code);
    return item ? structuredClone(item) : null;
  }

  async saveAccount(account: Account): Promise<void> {
    this.accounts.set(account.code, structuredClone(account));
  }
}
