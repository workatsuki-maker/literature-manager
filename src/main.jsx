import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LoginPage from './components/LoginPage.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import { useAuth } from './hooks/useAuth.js'
import { configError } from './utils/supabase.js'
import './index.css'

function Root() {
  const { user, authLoading, authError, signInWithGoogle, signOut } = useAuth()

  // 環境変数未設定の場合は原因をログイン画面に表示（ログインボタンは無効化）
  if (configError) {
    return <LoginPage onSignIn={signInWithGoogle} error={configError} disabled />
  }

  if (authLoading) return <LoadingSpinner />
  if (!user) return <LoginPage onSignIn={signInWithGoogle} error={authError} />
  return <App user={user} onSignOut={signOut} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
