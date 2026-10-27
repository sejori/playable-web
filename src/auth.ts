export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  credits_remaining: number;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export type AuthListener = (state: AuthState) => void;

const TOKEN_KEY = 'playable_session_jwt';
const LEGACY_TOKEN_KEY = 'playable_token';

const ENV_VARS = (import.meta as unknown as { env?: Record<string, string> }).env || {};
export const API_BASE: string =
  ENV_VARS.VITE_API_BASE_URL || 'https://playable-server-yy32pk5s3q-nw.a.run.app';

export class AuthService {
  private state: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
  };

  private listeners: Set<AuthListener> = new Set();
  private apiBase: string;

  constructor(apiBase: string = API_BASE) {
    this.apiBase = apiBase;
    const storedToken =
      localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
    if (storedToken) {
      this.state.token = storedToken;
      this.state.isAuthenticated = true;
      // Synthesize fallback user until /api/auth/me or /api/ledger responds
      this.state.user = {
        id: 'usr_restored',
        email: 'creator@playable.gg',
        name: 'Creator Pro',
        credits_remaining: 150,
      };
    }
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public get isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  public get token(): string | null {
    return this.state.token;
  }

  public get user(): UserProfile | null {
    return this.state.user;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(currentState);
      } catch (err) {
        console.error('Error in auth listener:', err);
      }
    });
  }

  public async init(onStateChange?: AuthListener): Promise<void> {
    if (onStateChange) {
      this.subscribe(onStateChange);
    }
    if (this.state.token) {
      await this.refreshUser();
    }
  }

  public async loginWithGoogleCredential(idToken: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.apiBase}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!res.ok) {
        throw new Error(`Google SSO failed: ${res.status}`);
      }

      const data = (await res.json()) as { token: string; user: UserProfile };
      this.setSession(data.token, data.user);
      return true;
    } catch (e) {
      console.error('SSO login error:', e);
      return false;
    }
  }

  public async loginAsGuestCreator(
    email: string = 'creator_guest@playable.gg'
  ): Promise<boolean> {
    // Fast-path deterministic mock token for instant creator access & automated tests
    const ok = await this.loginWithGoogleCredential(`mock_${email}`);
    if (!ok) {
      // Offline / standalone fallback if server is unreachable
      const mockUser: UserProfile = {
        id: `mock_creator_${Date.now()}`,
        email,
        name: 'Guest Creator',
        credits_remaining: 150,
      };
      this.setSession(`mock_jwt_${Date.now()}`, mockUser);
      return true;
    }
    return true;
  }

  public async refreshUser(): Promise<UserProfile | null> {
    if (!this.state.token) return null;
    try {
      const res = await fetch(`${this.apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${this.state.token}` },
      });

      if (res.status === 401) {
        this.logout();
        return null;
      }

      if (res.ok) {
        const profile = (await res.json()) as UserProfile;
        this.state.user = profile;
        this.state.isAuthenticated = true;
        this.notify();
        return profile;
      }

      // If /api/auth/me is 404 or unsupported on mock, try fetching /api/ledger
      const ledgerRes = await fetch(`${this.apiBase}/api/ledger`);
      if (ledgerRes.ok) {
        const ledger = (await ledgerRes.json()) as { credits_remaining?: number; plan_tier?: string };
        if (this.state.user) {
          if (typeof ledger.credits_remaining === 'number') {
            this.state.user.credits_remaining = ledger.credits_remaining;
          }
        } else {
          this.state.user = {
            id: 'mock_session_user',
            email: 'creator@playable.gg',
            name: ledger.plan_tier || 'Creator Pro',
            credits_remaining: ledger.credits_remaining ?? 150,
          };
        }
        this.state.isAuthenticated = true;
        this.notify();
        return this.state.user;
      }

      return this.state.user;
    } catch {
      // In offline/mock mode, maintain existing state
      return this.state.user;
    }
  }

  public updateCredits(credits: number): void {
    if (this.state.user) {
      this.state.user.credits_remaining = credits;
      this.notify();
    }
  }

  public getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.state.token) {
      headers['Authorization'] = `Bearer ${this.state.token}`;
    }
    return headers;
  }

  public setSession(token: string, user: UserProfile): void {
    this.state.token = token;
    this.state.user = user;
    this.state.isAuthenticated = true;
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(LEGACY_TOKEN_KEY, token);
    } catch (e) {
      console.warn('Unable to persist token to localStorage', e);
    }
    this.notify();
  }

  public logout(): void {
    this.state.token = null;
    this.state.user = null;
    this.state.isAuthenticated = false;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch (e) {
      console.warn('Unable to remove token from localStorage', e);
    }
    this.notify();
  }
}

export const authService = new AuthService();
