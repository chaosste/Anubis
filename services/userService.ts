import { User, StoredSession } from '../types';

const STORAGE_KEY_USERS = 'anubis_users';
const STORAGE_KEY_CURRENT_USER = 'anubis_current_user';
const DB_NAME = 'AnubisDB';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions';

// --- IndexedDB Helpers for Audio Storage ---
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        // Create an object store with 'id' as key
        db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Helper for simple hashing
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const userService = {
  async register(username: string, password: string): Promise<User | null> {
    if (!username || !password) throw new Error('Username and password are required');
    
    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    if (users.find(u => u.username === username)) {
      throw new Error('Username already exists');
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = { username, passwordHash };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    this.login(username, password); // Auto login
    
    return newUser;
  },

  async login(username: string, password: string): Promise<User> {
    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.username === username);
    if (!user) throw new Error('User not found');

    const inputHash = await hashPassword(password);
    if (inputHash !== user.passwordHash) throw new Error('Invalid password');

    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!userStr) return null;
    
    try {
      const currentUser = JSON.parse(userStr);
      
      // Integrity check: Ensure user still exists in DB
      const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      const isValid = users.some(u => u.username === currentUser.username && u.passwordHash === currentUser.passwordHash);
      
      if (!isValid) {
          this.logout();
          return null;
      }
      
      return currentUser;
    } catch (e) {
      this.logout();
      return null;
    }
  },

  // --- Session Management ---

  async saveSession(username: string, session: StoredSession): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SESSIONS, 'readwrite');
      const store = tx.objectStore(STORE_SESSIONS);
      
      // We add the username to the session object for filtering later
      const sessionWithUser = { ...session, username };
      
      const request = store.put(sessionWithUser);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getUserSessions(username: string): Promise<StoredSession[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SESSIONS, 'readonly');
      const store = tx.objectStore(STORE_SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        const allSessions = request.result as (StoredSession & { username: string })[];
        // Filter in memory (simple for now, ideally use an index)
        const userSessions = allSessions
          .filter(s => s.username === username)
          .sort((a, b) => b.timestamp - a.timestamp); // Newest first
        resolve(userSessions);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async deleteSession(sessionId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SESSIONS, 'readwrite');
      const store = tx.objectStore(STORE_SESSIONS);
      const request = store.delete(sessionId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

export const fileService = {
  async saveTranscript(username: string, transcripts: any[]) {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Anubis_Interview_${username}_${date}.txt`;
    
    const content = transcripts.map(t => 
      `[${t.role.toUpperCase()}]\n${t.text}\n`
    ).join('\n');

    await this.saveFile(content, filename, 'text/plain', ['txt']);
  },

  async saveAudio(username: string, audioBlob: Blob) {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
    const filename = `Anubis_Session_${username}_${date}.${ext}`;
    
    await this.saveFile(audioBlob, filename, audioBlob.type, [ext]);
  },

  async saveFile(content: string | Blob, filename: string, mimeType: string, extensions: string[]) {
    // Try File System Access API
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Anubis File',
            accept: { [mimeType]: ['.' + extensions[0]] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; 
        console.warn('File System Access API failed, falling back to download', err);
      }
    }

    // Fallback
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};