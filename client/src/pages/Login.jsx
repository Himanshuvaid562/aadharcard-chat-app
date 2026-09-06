import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const { login } = useAuth()
  const nav = useNavigate()
  const [aadhaar,setAadhaar]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  const submit=async(e)=>{
    e.preventDefault(); setErr('')
    if(!/^[0-9]{12}$/.test(aadhaar)) return setErr('Aadhaar must be exactly 12 digits')
    setLoading(true)
    try{ await login(aadhaar,password); nav('/chat') }catch(e){ setErr(e.response?.data?.message||'Login failed') }finally{setLoading(false)}
  }
  return (
    <div className="min-h-screen bg-[#080c1a] relative overflow-hidden flex items-center justify-center p-6">
      {/* mesh aurora */}
      <div className="absolute inset-0">
        <div className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-30" style={{background:'radial-gradient(circle, #FF9933 0%, transparent 70%)'}}/>
        <div className="absolute -bottom-[20%] -right-[20%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-25" style={{background:'radial-gradient(circle, #138808 0%, transparent 70%)'}}/>
        <div className="absolute top-[20%] right-[15%] w-[50%] h-[50%] rounded-full blur-[130px] opacity-20" style={{background:'radial-gradient(circle, #6366f1 0%, transparent 70%)'}}/>
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize:'40px 40px'}}/>
      </div>

      <div className="relative w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur text-xs text-white/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/> System live • UIDAI-verified
          </div>
          <div className="mt-6 flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#080c1a] grid place-items-center font-black text-xl rotate-3">A</div>
          </div>
          <h1 className="mt-4 text-[28px] font-black tracking-tight text-white">AadhaarChat</h1>
          <p className="text-white/50 text-sm">Identity-first messaging for Bharat</p>
        </div>

        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-[28px] p-8 shadow-2xl">
          <h2 className="text-white font-semibold">Welcome back</h2>
          <p className="text-white/40 text-xs mt-1">Sign in with your 12-digit Aadhaar</p>
          {err && <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-2xl">{err}</div>}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] tracking-widest font-semibold text-white/60 uppercase">Aadhaar Number</label>
              <div className="relative group">
                <input value={aadhaar} onChange={e=>setAadhaar(e.target.value.replace(/\D/g,'').slice(0,12))} placeholder="••••  ••••  ••••" inputMode="numeric"
                  className="w-full bg-white/5 border border-white/10 focus:border-violet-400/50 focus:bg-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none transition font-mono tracking-[0.2em] text-sm"/>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs font-mono">{aadhaar.length}/12</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] tracking-widest font-semibold text-white/60 uppercase">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 focus:border-violet-400/50 focus:bg-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none transition text-sm"/>
            </div>
            <button disabled={loading} className="w-full py-3.5 rounded-2xl bg-white text-[#080c1a] font-bold hover:bg-white/90 transition disabled:opacity-60">
              {loading?'Verifying…':'Enter Chat →'}
            </button>
          </form>
          <p className="text-center text-sm text-white/40 mt-6">New? <Link to="/register" className="text-white font-semibold hover:underline">Create identity</Link></p>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] tracking-widest text-white/20 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933]"/><span className="w-1.5 h-1.5 rounded-full bg-white"/><span className="w-1.5 h-1.5 rounded-full bg-[#138808]"/> Not affiliated with UIDAI
          </div>
        </div>
        <p className="text-center text-[11px] text-white/20 mt-4">React 19 • Socket.IO • MongoDB • Docker</p>
      </div>
    </div>
  )
}
