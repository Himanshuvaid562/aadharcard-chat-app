import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { io } from 'socket.io-client'

function initials(n){ return n?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?' }
function fmtTime(d){ return new Date(d).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }
function fmtAadhaar(a){ return a?.replace(/(\d{4})(\d{4})(\d{4})/,'$1 $2 $3')||'' }

export default function Chat(){
  const { user, logout, token } = useAuth()
  const [users,setUsers]=useState([])
  const [search,setSearch]=useState('')
  const [selected,setSelected]=useState(null)
  const [messages,setMessages]=useState([])
  const [text,setText]=useState('')
  const [online,setOnline]=useState([])
  const [typing,setTyping]=useState(false)
  const socketRef=useRef(null)
  const listRef=useRef(null)

  useEffect(()=>{
    let t=setTimeout(async()=>{
      try{ const {data}=await api.get('/users',{params:{search:search||undefined}}); setUsers(data)}catch{}
    },250)
    return()=>clearTimeout(t)
  },[search])

  useEffect(()=>{
    if(!token) return
    const s=io({auth:{token}})
    socketRef.current=s
    s.on('onlineUsers', setOnline)
    s.on('receiveMessage', m=>{
      if(!selected) return
      const sid=String(m.sender), rid=String(m.receiver), sel=String(selected._id), me=String(user._id)
      if((sid===sel && rid===me) || (sid===me && rid===sel)) setMessages(v=> v.find(x=>String(x._id)===String(m._id))?v:[...v,m])
    })
    s.on('typing', ({senderId,isTyping})=>{ if(String(senderId)===String(selected?._id)) setTyping(!!isTyping) })
    return()=>s.disconnect()
  },[token, selected?._id, user?._id])

  useEffect(()=>{
    if(!selected) return
    setMessages([])
    api.get(`/messages/${selected._id}`).then(r=>setMessages(r.data)).catch(()=>{})
    api.post(`/messages/mark-read/${selected._id}`).catch(()=>{})
  },[selected?._id])

  useEffect(()=>{ listRef.current?.scrollTo(0,listRef.current.scrollHeight) },[messages,typing])

  const send=()=>{
    if(!text.trim()||!selected) return
    socketRef.current?.emit('sendMessage',{receiverId:selected._id, text:text.trim()})
    setText('')
    socketRef.current?.emit('typing',{receiverId:selected._id, isTyping:false})
  }

  return (
    <div className="h-[100dvh] bg-[#080c1a] text-white flex flex-col overflow-hidden">
      {/* aurora bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[30%] left-[20%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-[0.12]" style={{background:'radial-gradient(circle, #6366f1 0%, transparent 70%)'}}/>
        <div className="absolute -bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-[0.10]" style={{background:'radial-gradient(circle, #FF9933 0%, transparent 70%)'}}/>
      </div>

      {/* header */}
      <div className="relative z-10 h-[64px] flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#0f1221]/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-[#080c1a] grid place-items-center font-black">A</div>
          <div>
            <div className="font-bold leading-none tracking-tight">AadhaarChat</div>
            <div className="text-[11px] tracking-widest text-white/40 uppercase">Neo-Bharat • Encrypted</div>
          </div>
          <span className="hidden md:inline-flex ml-3 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/60">Realtime</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-white/5 border border-white/10">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 grid place-items-center text-xs font-bold">{initials(user?.name)}</div>
            <div className="text-xs pr-2"><div className="font-semibold leading-none">{user?.name}</div><div className="text-white/40 font-mono text-[10px]">{fmtAadhaar(user?.aadhaar)}</div></div>
          </div>
          <button onClick={logout} className="px-4 py-2 rounded-full bg-white text-[#080c1a] text-xs font-bold hover:bg-white/90">Logout</button>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 min-h-0 p-3 md:p-4 gap-3 md:gap-4">
        {/* sidebar - bento */}
        <div className="w-full md:w-[360px] bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[24px] flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-tight">Conversations</h2>
              <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">{users.length} users</span>
            </div>
            <div className="mt-3 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm">⌕</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search identity…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400/30 focus:outline-none text-sm placeholder:text-white/30"/>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {users.length===0 && <div className="p-8 text-center text-white/30 text-sm">No identities yet.<br/><span className="text-white/20 text-xs">Register another Aadhaar to start</span></div>}
            {users.map(u=>{
              const isOnline=online.includes(String(u._id))
              const active=String(selected?._id)===String(u._id)
              return (
                <button key={u._id} onClick={()=>setSelected(u)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition ${active?'bg-white text-[#080c1a] border-white shadow-lg':'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'}`}>
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center font-bold text-sm ${active?'bg-[#080c1a] text-white':'bg-gradient-to-br from-violet-500 to-indigo-500 text-white'}`}>{initials(u.name)}</div>
                    {isOnline && <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#080c1a] rounded-full"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${active?'text-[#080c1a]':'text-white'}`}>{u.name} {isOnline && <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${active?'bg-emerald-100 text-emerald-700':'bg-emerald-500/20 text-emerald-300'}`}>online</span>}</div>
                    <div className={`text-xs font-mono truncate ${active?'text-[#080c1a]/50':'text-white/40'}`}>{fmtAadhaar(u.aadhaar)}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isOnline?'bg-emerald-400':'bg-white/10'}`}/>
                </button>
              )
            })}
          </div>
          <div className="p-3 border-t border-white/5">
            <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-3">
              <div className="text-xs font-semibold">Tip</div>
              <div className="text-xs text-white/50 mt-1">Open incognito with 2nd Aadhaar to test realtime on one PC.</div>
            </div>
          </div>
        </div>

        {/* main chat - bento */}
        <div className="hidden md:flex flex-1 bg-white rounded-[24px] text-[#080c1a] flex-col overflow-hidden shadow-2xl">
          {!selected ? (
            <div className="flex-1 grid place-items-center p-12 text-center">
              <div className="max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#080c1a] text-white grid place-items-center text-2xl mx-auto">◈</div>
                <h3 className="mt-4 text-xl font-black tracking-tight">Select an identity</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">Choose a verified Aadhaar identity from the left. Messages are end-to-end routed via Socket.IO and persisted in MongoDB.</p>
                <div className="mt-6 flex justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium">No WhatsApp clone</span>
                  <span className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium">Neo-Bharat design</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="h-[68px] flex items-center px-6 gap-3 border-b border-slate-100 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-[#080c1a] text-white grid place-items-center font-bold">{initials(selected.name)}</div>
                <div>
                  <div className="font-bold leading-none">{selected.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{fmtAadhaar(selected.aadhaar)} • {online.includes(String(selected._id))?'online':'offline'} {typing && '• typing…'}</div>
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-full bg-slate-100">🔒 Verified</span>
                </div>
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#fcfcfd]">
                {messages.map(m=>{
                  const isMe=String(m.sender)===String(user._id) || String(m.sender?._id)===String(user._id)
                  return (
                    <div key={m._id} className={`flex ${isMe?'justify-end':'justify-start'}`}>
                      <div className={`group max-w-[68%] ${isMe?'items-end':''}`}>
                        <div className={`px-4 py-3 rounded-[18px] text-sm leading-relaxed shadow-sm border ${isMe?'bg-[#080c1a] text-white border-[#080c1a] rounded-br-[6px]':'bg-white text-slate-800 border-slate-200 rounded-bl-[6px]'}`}>
                          {m.text}
                        </div>
                        <div className={`mt-1.5 flex items-center gap-1.5 text-[11px] ${isMe?'justify-end text-slate-400':'text-slate-400'}`}>
                          <span>{fmtTime(m.createdAt)}</span> {isMe && <span className="text-emerald-500">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {typing && <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-500">typing…</div></div>}
              </div>

              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full p-1.5 focus-within:border-violet-300 focus-within:bg-white transition">
                  <input value={text} onChange={e=>{ setText(e.target.value); if(selected){ const v=e.target.value; socketRef.current?.emit('typing',{receiverId:selected._id, isTyping: v.length>0}); }}} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`Message ${selected.name}…`} className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-sm placeholder:text-slate-400"/>
                  <button onClick={send} className="w-10 h-10 rounded-full bg-[#080c1a] text-white grid place-items-center hover:bg-black transition shrink-0">↑</button>
                </div>
                <div className="text-center text-[11px] text-slate-400 mt-2">Press Enter to send • Socket.IO realtime</div>
              </div>
            </>
          )}
        </div>

        {/* mobile overlay when selected */}
        {selected && (
          <div className="md:hidden fixed inset-0 bg-white flex flex-col z-20">
            <div className="h-[60px] flex items-center px-3 gap-3 border-b shrink-0">
              <button onClick={()=>setSelected(null)} className="w-9 h-9 rounded-full bg-slate-100 grid place-items-center">‹</button>
              <div className="w-9 h-9 rounded-xl bg-[#080c1a] text-white grid place-items-center font-bold text-sm">{initials(selected.name)}</div>
              <div className="font-bold text-sm">{selected.name}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfcfd]">
              {messages.map(m=>{
                const isMe=String(m.sender)===String(user._id)
                return <div key={m._id} className={`flex ${isMe?'justify-end':'justify-start'}`}><div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${isMe?'bg-[#080c1a] text-white rounded-br-md':'bg-white border shadow-sm rounded-bl-md'}`}>{m.text}<div className="text-[10px] opacity-60 text-right mt-1">{fmtTime(m.createdAt)}</div></div></div>
              })}
            </div>
            <div className="p-3 border-t flex gap-2 bg-white">
              <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Message…" className="flex-1 px-4 py-3 rounded-full bg-slate-100 focus:outline-none text-sm"/>
              <button onClick={send} className="w-12 h-12 rounded-full bg-[#080c1a] text-white grid place-items-center">↑</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
