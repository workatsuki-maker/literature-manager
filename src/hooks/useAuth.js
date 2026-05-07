import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let initialResolved = false

    // onAuthStateChange を先に登録。INITIAL_SESSION がセッション確定（URLハッシュ処理含む）を知らせる。
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'INITIAL_SESSION') {
        initialResolved = true
        setAuthLoading(false)
      }
    })

    // フォールバック: 環境変数未設定・ネットワーク障害などで INITIAL_SESSION が発火しない場合に
    // ローディング状態を必ず解除してログイン画面を表示する。
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!initialResolved) {
          setUser(session?.user ?? null)
          setAuthLoading(false)
        }
      })
      .catch(() => {
        if (!initialResolved) setAuthLoading(false)
      })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setAuthError(error.message)
  }

  const signOut = () => supabase.auth.signOut()

  return { user, authLoading, authError, signInWithGoogle, signOut }
}
