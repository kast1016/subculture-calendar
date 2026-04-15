import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient.js';

const authListeners = new Set();
export const authState = {
  user: null,
  session: null,
  loading: true,
};

function notifyAuthListeners() {
  authListeners.forEach((listener) => listener(authState));
}

export async function initAuth() {
  if (!supabase) {
    authState.loading = false;
    notifyAuthListeners();
    return;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.warn('Supabase auth 초기화 실패', error);
  }

  authState.session = session;
  authState.user = session?.user ?? null;
  authState.loading = false;
  notifyAuthListeners();

  supabase.auth.onAuthStateChange((event, session) => {
    authState.session = session;
    authState.user = session?.user ?? null;
    notifyAuthListeners();
  });
}

export function onAuthStateChange(listener) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase가 구성되지 않았습니다.');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  if (!supabase) throw new Error('Supabase가 구성되지 않았습니다.');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase가 구성되지 않았습니다.');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function deleteAccount() {
  if (!supabase) throw new Error('Supabase가 구성되지 않았습니다.');
  const token = authState.session?.access_token;
  if (!token) throw new Error('로그인이 필요합니다.');

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`계정 삭제 실패: ${message}`);
  }

  authState.user = null;
  authState.session = null;
  notifyAuthListeners();
}
