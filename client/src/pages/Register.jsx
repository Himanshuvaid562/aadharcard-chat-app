import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register(){
  const { register } = useAuth()
  const nav=useNavigate()
  const [name,setName]=useState('')
  const [aadhaar,setAadhaar]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState('')
  const [ok,setOk]=useState('')
  const [loading,setLoading]=useState(false)
  const submit=async(e)=>{
    e.preventDefault(); setErr(''); setOk('')
    if(!/^[0-9]{12}$/.test(aadhaar)) return setErr('Aadhaar must be 12 digits')
    if(password.length<6) return setErr('Password 6+ chars')
    setLoading(true)
    try{ await register(name,aadhaar,password); setOk('Identity created. Redirecting…'); setTimeout(()=>nav('/login'),1100)}catch(e){ setErr(e.response?.data?.message||'Failed')}finally{setLoading(false)}
  }
  return (
    <div className="min-h-screen bg-[#080c1a] relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0">
        <div className="absolute -top-[25%] -right-[15%] w-[65%] h-[65%] rounded-full blur-[120px] opacity-25" style={{background:'radial-gradient(circle, #6366f1 0%, transparent 70%)'}}/>
        <div className="absolute -bottom-[25%] -left-[15%] w-[65%] h-[65%] rounded-full blur-[120px] opacity-25" style={{background:'radial-gradient(circle, #FF9933 0%, transparent 70%)'}}/>
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize:'40px 40px'}}/>
      </div>
      <div className="relative w-full max-w-[440px]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#080c1a] grid place-items-center font-black text-xl mx-auto -rotate-3">A</div>
          <h1 className="mt-4 text-[26px] font-black text-white tracking-tight">Create your identity</h1>
          <p className="text-white/50 text-sm">One Aadhaar = one verified account</p>
        </div>
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-[28px] p-8">
          {err && <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-2xl mb-4">{err}</div>}
          {ok && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm px-4 py-3 rounded-2xl mb-4">{ok}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-[11px] tracking-widest font-semibold text-white/60 uppercase">Full Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Aarav Sharma" className="mt-1.5 w-full bg-white/5 border border-white/10 focus:border-violet-400/50 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none text-sm"/>
            </div>
            <div>
              <label className="text-[11px] tracking-widest font-semibold text-white/60 uppercase">Aadhaar</label>
              <input value={aadhaar} onChange={e=>setAadhaar(e.target.value.replace(/\D/g,'').slice(0,12))} placeholder="12-digit number" inputMode="numeric" className="mt-1.5 w-full bg-white/5 border border-white/10 focus:border-violet-400/50 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none font-mono tracking-widest text-sm"/>
            </div>
            <div>
              <label className="text-[11px] tracking-widest font-semibold text-white/60 uppercase">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5 w-full bg-white/5 border border-white/10 focus:border-violet-400/50 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none text-sm"/>
            </div>
            <button disabled={loading} className="w-full py-3.5 rounded-2xl bg-white text-[#080c1a] font-bold hover:bg-white/90 transition disabled:opacity-60">
              {loading?'Creating…':'Create identity →'}
            </button>
          </form>
          <p className="text-center text-sm text-white/40 mt-6">Have an account? <Link to="/login" className="text-white font-semibold hover:underline">Login</Link></p>
        </div>
      </div>
    </div>
  )
}
