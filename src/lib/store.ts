import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { Issue, User } from "./types";

interface StoreData {
  issues: Issue[];
  users: User[];
}

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "store.json");

function ensureStore(): StoreData {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  if (!existsSync(STORE_PATH)) {
    const initial: StoreData = { issues: [], users: [] };
    writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }

  const raw = readFileSync(STORE_PATH, "utf-8");
  return JSON.parse(raw) as StoreData;
}

function save(data: StoreData): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

export function getStore(): StoreData {
  return ensureStore();
}

export function getIssues(): Issue[] {
  return getStore().issues.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getIssue(id: string): Issue | undefined {
  return getStore().issues.find((i) => i.id === id);
}

export function saveIssue(issue: Issue): Issue {
  const store = getStore();
  const idx = store.issues.findIndex((i) => i.id === issue.id);
  if (idx >= 0) store.issues[idx] = issue;
  else store.issues.push(issue);
  save(store);
  return issue;
}

export function getUsers(): User[] {
  return getStore().users.sort((a, b) => b.points - a.points);
}

export function getUser(id: string): User | undefined {
  return getStore().users.find((u) => u.id === id);
}

export function saveUser(user: User): User {
  const store = getStore();
  const idx = store.users.findIndex((u) => u.id === user.id);
  if (idx >= 0) store.users[idx] = user;
  else store.users.push(user);
  save(store);
  return user;
}

export function getOrCreateDemoUser(): User {
  const store = getStore();
  let user = store.users.find((u) => u.id === "demo-user");
  if (!user) {
    user = {
      id: "demo-user",
      name: "Community Citizen",
      email: "citizen@community.local",
      points: 0,
      level: 1,
      badges: [],
      reportsCount: 0,
      verificationsCount: 0,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    save(store);
  }
  return user;
}

export function replaceStore(data: StoreData): void {
  save(data);
}
