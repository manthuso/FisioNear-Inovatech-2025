import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const API_BASE = import.meta.env.VITE_API_URL || ''

  async function onSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      if (!res.ok) {
        const msg = await safeMessage(res)
        throw new Error(msg || 'Falha no login')
      }
      const data = await res.json().catch(() => ({}))
      if (data?.token) localStorage.setItem('auth_token', data.token)
      navigate('/')
    } catch (err) {
      setErro(err.message || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="hero-section" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="feature-item animate" style={{ width: 360 }}>
        <h3>Entrar</h3>
        <form onSubmit={onSubmit} style={{ width: '100%', display: 'grid', gap: 12 }}>
          <label style={{ color: '#fff', fontSize: 14 }}>
            E-mail
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginTop: 6, padding: 12, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
            />
          </label>
          <label style={{ color: '#fff', fontSize: 14 }}>
            Senha
            <input
              type="password"
              placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{ marginTop: 6, padding: 12, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
            />
          </label>

          {erro && <div style={{ color: '#ffb3b3', fontSize: 13 }}>{erro}</div>}

          <button className="cta-button" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Acessar'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <a href="#" style={{ color: 'var(--primary)' }}>Esqueci minha senha</a>
            <a href="#" style={{ color: 'var(--primary)' }}>Criar conta</a>
          </div>
        </form>

        {/* Botão voltar para Home */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/" className="cta-button outline">Voltar</Link>
        </div>
      </div>
    </section>
  )
}

async function safeMessage(res) {
  try {
    const data = await res.json()
    return data?.message || data?.error || ''
  } catch {
    try {
      return await res.text()
    } catch {
      return ''
    }
  }
}