import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { Firestore } from "@google-cloud/firestore";
import type { Issue, User } from "./types";

export interface StoreData {
  issues: Issue[];
  users: User[];
}

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "store.json");

let dbInstance: Firestore | null = null;
function getDb(): Firestore | null {
  if (process.env.USE_FIRESTORE !== "true") return null;
  if (!dbInstance) {
    dbInstance = new Firestore();
  }
  return dbInstance;
}

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

export async function getStore(): Promise<StoreData> {
  const db = getDb();
  if (db) {
    const issuesSnap = await db.collection("issues").get();
    const usersSnap = await db.collection("users").get();
    
    const issues: Issue[] = [];
    issuesSnap.forEach(doc => {
      issues.push(doc.data() as Issue);
    });
    
    const users: User[] = [];
    usersSnap.forEach(doc => {
      users.push(doc.data() as User);
    });
    
    return { issues, users };
  } else {
    return ensureStore();
  }
}

export async function getIssues(): Promise<Issue[]> {
  const db = getDb();
  if (db) {
    const issuesSnap = await db.collection("issues").get();
    const issues: Issue[] = [];
    issuesSnap.forEach(doc => {
      issues.push(doc.data() as Issue);
    });
    return issues.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else {
    return ensureStore().issues.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export async function getIssue(id: string): Promise<Issue | undefined> {
  const db = getDb();
  if (db) {
    const doc = await db.collection("issues").doc(id).get();
    return doc.exists ? (doc.data() as Issue) : undefined;
  } else {
    return ensureStore().issues.find((i) => i.id === id);
  }
}

export async function saveIssue(issue: Issue): Promise<Issue> {
  const db = getDb();
  if (db) {
    await db.collection("issues").doc(issue.id).set(issue);
    return issue;
  } else {
    const store = ensureStore();
    const idx = store.issues.findIndex((i) => i.id === issue.id);
    if (idx >= 0) store.issues[idx] = issue;
    else store.issues.push(issue);
    save(store);
    return issue;
  }
}

export async function getUsers(): Promise<User[]> {
  const db = getDb();
  if (db) {
    const usersSnap = await db.collection("users").get();
    const users: User[] = [];
    usersSnap.forEach(doc => {
      users.push(doc.data() as User);
    });
    return users.sort((a, b) => b.points - a.points);
  } else {
    return ensureStore().users.sort((a, b) => b.points - a.points);
  }
}

export async function getUser(id: string): Promise<User | undefined> {
  const db = getDb();
  if (db) {
    const doc = await db.collection("users").doc(id).get();
    return doc.exists ? (doc.data() as User) : undefined;
  } else {
    return ensureStore().users.find((u) => u.id === id);
  }
}

export async function saveUser(user: User): Promise<User> {
  const db = getDb();
  if (db) {
    await db.collection("users").doc(user.id).set(user);
    return user;
  } else {
    const store = ensureStore();
    const idx = store.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) store.users[idx] = user;
    else store.users.push(user);
    save(store);
    return user;
  }
}

export async function getOrCreateDemoUser(): Promise<User> {
  const db = getDb();
  if (db) {
    const doc = await db.collection("users").doc("demo-user").get();
    if (doc.exists) {
      return doc.data() as User;
    }
    const user: User = {
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
    await db.collection("users").doc("demo-user").set(user);
    return user;
  } else {
    const store = ensureStore();
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
}

export async function replaceStore(data: StoreData): Promise<void> {
  const db = getDb();
  if (db) {
    const batch = db.batch();
    
    // Delete existing issues
    const issuesSnap = await db.collection("issues").get();
    issuesSnap.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete existing users
    const usersSnap = await db.collection("users").get();
    usersSnap.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Write new issues
    for (const issue of data.issues) {
      const docRef = db.collection("issues").doc(issue.id);
      batch.set(docRef, issue);
    }
    
    // Write new users
    for (const user of data.users) {
      const docRef = db.collection("users").doc(user.id);
      batch.set(docRef, user);
    }
    
    await batch.commit();
  } else {
    save(data);
  }
}
