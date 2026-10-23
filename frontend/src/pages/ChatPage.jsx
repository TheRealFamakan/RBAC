import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendMessage } from '../services/api';
import { ROLE_CONFIG, SUGGESTED_QUESTIONS } from '../constants/roles';
import {
  ShieldIcon,
  FileTextIcon,
  SendIcon,
  TrashIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  ShareIcon,
  ChevronDownIcon,
  CopyIcon,
  VolumeIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RotateCcwIcon,
  CheckIcon,
} from '../components/Icons';

function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t border-white/5 space-y-2.5">
      <div className="flex items-center justify-between font-sans text-neutral-400">
        <span className="flex items-center gap-2 font-medium uppercase tracking-wider text-xs text-neutral-300">
          <FileTextIcon className="w-4 h-4 text-blue-400" />
          Verified Sources ({sources.length})
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2.5 font-sans">
        {sources.map((src, i) => {
          const relevancePct = Math.round((src.relevance || 0) * 100);
          return (
            <div
              key={i}
              style={{ animationDelay: `${i * 35}ms` }}
              className="flex flex-col justify-between p-3.5 rounded-xl bg-[#232322] border border-white/5 hover:border-white/15 transition-all text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-neutral-100 truncate" title={src.file}>
                  {src.file}
                </span>
                <span className="text-xs uppercase font-semibold px-2.5 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/5">
                  {src.department}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                <span>Relevance</span>
                <span className="font-semibold text-neutral-200">{relevancePct}%</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(relevancePct, 10), 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessageContent({ text }) {
  const paragraphs = text.split('\n\n');

  return (
    <div className="font-editorial space-y-4 text-[21px] leading-[1.82] text-[#edece9]">
      {paragraphs.map((p, idx) => {
        if (p.trim().startsWith('- ') || p.trim().startsWith('* ')) {
          const items = p.split('\n').filter(line => line.trim().length > 0);
          return (
            <ul key={idx} className="list-disc pl-7 space-y-2 my-3 text-[20px] leading-[1.8]">
              {items.map((item, i) => {
                const cleanItem = item.replace(/^[-*]\s+/, '');
                return <li key={i}>{formatInline(cleanItem)}</li>;
              })}
            </ul>
          );
        }

        if (p.trim().startsWith('### ')) {
          return (
            <h4 key={idx} className="font-sans font-bold text-neutral-100 text-xl tracking-tight mt-5 mb-2">
              {p.replace('### ', '')}
            </h4>
          );
        }
        if (p.trim().startsWith('## ')) {
          return (
            <h3 key={idx} className="font-sans font-bold text-neutral-100 text-2xl tracking-tight mt-6 mb-2.5">
              {p.replace('## ', '')}
            </h3>
          );
        }

        return <p key={idx}>{formatInline(p)}</p>;
      })}
    </div>
  );
}

function formatInline(str) {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function AssistantMessage({ msg, onCopy, copiedId }) {
  return (
    <div className="w-full max-w-4xl mx-auto py-4 group animate-fade-in">
      {msg.guardrail_triggered && (
        <div className="mb-4 p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-sm flex items-start gap-3 font-sans">
          <ShieldIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-200">Security Guardrail Notice</p>
            <p className="text-amber-300/80 leading-relaxed">
              This request was inspected by safety and access isolation filters. Response is constrained to your role scope.
            </p>
          </div>
        </div>
      )}

      <MessageContent text={msg.content} />

      {msg.sources && msg.sources.length > 0 && <SourceList sources={msg.sources} />}

      <div className="flex items-center gap-2 mt-3.5 text-neutral-400 font-sans">
        <button
          onClick={() => onCopy(msg.id, msg.content)}
          title="Copy response"
          className="p-2 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 transition pressable"
        >
          {copiedId === msg.id ? (
            <CheckIcon className="w-4 h-4 text-emerald-400" />
          ) : (
            <CopyIcon className="w-4 h-4" />
          )}
        </button>

        <button
          title="Read aloud"
          className="p-2 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 transition pressable"
        >
          <VolumeIcon className="w-4 h-4" />
        </button>

        <button
          title="Helpful"
          className="p-2 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 transition pressable"
        >
          <ThumbsUpIcon className="w-4 h-4" />
        </button>

        <button
          title="Not helpful"
          className="p-2 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 transition pressable"
        >
          <ThumbsDownIcon className="w-4 h-4" />
        </button>

        <button
          title="Retry"
          className="p-2 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 transition pressable"
        >
          <RotateCcwIcon className="w-4 h-4" />
        </button>

        {msg.responseTime && (
          <span className="text-xs text-neutral-400 ml-2 font-mono">
            {msg.responseTime}s
          </span>
        )}

        {msg.chunksRetrieved > 0 && (
          <span className="text-xs text-neutral-300 bg-neutral-800 px-2.5 py-1 rounded-md border border-white/5 ml-1">
            {msg.chunksRetrieved} chunks
          </span>
        )}
      </div>
    </div>
  );
}

function UserMessage({ msg }) {
  return (
    <div className="w-full max-w-4xl mx-auto py-2.5 flex justify-end animate-fade-in">
      <div className="bg-[#2c2c2b] text-[#f4f3ef] px-5 py-3 rounded-2xl max-w-[82%] font-sans text-[18px] leading-relaxed shadow-sm">
        <p className="whitespace-pre-wrap">{msg.content}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="w-full max-w-4xl mx-auto py-4 flex items-center gap-2.5 text-neutral-400 font-sans text-base animate-fade-in">
      <div className="w-2.5 h-2.5 rounded-full bg-neutral-400 animate-pulse" />
      <span>FinSolve is reasoning and retrieving facts...</span>
    </div>
  );
}

export default function ChatPage() {
  const { user, token, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.employee;
  const suggestions = SUGGESTED_QUESTIONS[user?.role] || [];

  useEffect(() => {
    if (messages.length === 0 && user) {
      setMessages([
        {
          id: 1,
          role: 'assistant',
          content: `Hello ${user.name}! How can I assist you with FinSolve data today?\n\nYou are logged in with the **${roleConfig.label}** profile. All queries are verified against your departmental permissions (${roleConfig.accessibleDepartments.join(', ')}).`,
          sources: [],
          guardrail_triggered: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: `New conversation started. What would you like to review, ${user?.name}?`,
        sources: [],
        guardrail_triggered: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSend = async (query = input) => {
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);
    const startTime = Date.now();

    try {
      const data = await sendMessage(query, token);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        guardrail_triggered: data.guardrail_triggered || false,
        context_found: data.context_found,
        responseTime: elapsed,
        chunksRetrieved: data.chunks_retrieved || 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Error: Unable to complete your request. ${err.message || 'Please check your connection.'}`,
          sources: [],
          guardrail_triggered: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputResize = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const filteredSuggestions = searchQuery.trim()
    ? suggestions.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : suggestions;

  return (
    <div className="flex h-screen bg-[#191918] text-[#edece9] font-sans overflow-hidden">
      <aside
        className={`${
          sidebarOpen ? 'w-88 sm:w-[410px] xl:w-[440px]' : 'w-0'
        } transition-all duration-300 ease-in-out bg-[#141413] border-r border-white/5 flex flex-col overflow-hidden relative z-20 flex-shrink-0`}
      >
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="font-serif font-semibold text-2xl text-white tracking-tight">FinSolve</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            title="Collapse sidebar"
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition pressable"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5">
          <div className="relative">
            <SearchIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full bg-[#1e1e1d] text-[15px] text-neutral-200 placeholder-neutral-500 rounded-xl pl-10 pr-3.5 py-2.5 border border-white/5 focus:outline-none focus:border-white/20 transition"
            />
          </div>
        </div>

        <div className="px-3.5 pb-2">
          <button
            onClick={handleClear}
            className="w-full flex items-center gap-2.5 bg-[#212120] hover:bg-[#282827] text-neutral-200 text-[15px] font-medium px-3.5 py-2.5 rounded-xl border border-white/5 transition pressable"
          >
            <PlusIcon className="w-4 h-4 text-neutral-400" />
            <span>New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-5">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-2 block mb-2">
              Recommended Topics
            </span>
            <div className="space-y-1">
              {filteredSuggestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="w-full text-left text-[15px] leading-snug text-neutral-300 hover:text-white hover:bg-[#20201f] px-3 py-2.5 rounded-xl transition-colors truncate block group"
                  title={q}
                >
                  <span className="truncate block">{q}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-2 block mb-2">
              Authorized Partitions
            </span>
            <div className="flex flex-wrap gap-2 px-1">
              {roleConfig.accessibleDepartments.map((dept, i) => (
                <span
                  key={i}
                  className="text-sm px-3 py-1.5 rounded-lg bg-[#1e1e1d] text-neutral-200 border border-white/5 font-medium"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1e1e1d] border border-white/5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${roleConfig.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {user?.name?.slice(0, 2).toUpperCase() || 'CF'}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-white truncate">{user?.name}</p>
                <p className="text-sm text-neutral-400 truncate">{roleConfig.label}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition pressable flex-shrink-0"
            >
              <LogOutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#191918] relative">
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Open sidebar"
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition pressable"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            )}

            <button className="flex items-center gap-2 text-base font-medium text-neutral-200 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-neutral-800/60 transition pressable">
              <span>FinSolve Enterprise Assistant</span>
              <ChevronDownIcon className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              title="Clear discussion"
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition pressable"
            >
              <TrashIcon className="w-5 h-5" />
            </button>

            <button
              title="Share"
              className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white bg-[#242423] hover:bg-[#2c2c2b] border border-white/5 px-4 py-2 rounded-lg transition pressable font-medium"
            >
              <ShareIcon className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-7">
          {messages.map(msg =>
            msg.role === 'user' ? (
              <UserMessage key={msg.id} msg={msg} />
            ) : (
              <AssistantMessage
                key={msg.id}
                msg={msg}
                onCopy={handleCopy}
                copiedId={copiedId}
              />
            )
          )}

          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 sm:p-5 flex-shrink-0">
          <div className="max-w-4xl mx-auto space-y-2.5">
            <div className="bg-[#242423] border border-white/10 rounded-2xl p-3.5 focus-within:border-white/20 transition-all shadow-xl">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputResize}
                onKeyDown={handleKeyDown}
                placeholder="Reply to FinSolve..."
                rows={1}
                disabled={loading}
                className="w-full bg-transparent border-0 resize-none px-2 text-[17px] text-[#f4f3ee] placeholder-neutral-500 focus:outline-none max-h-52 leading-relaxed"
                style={{ minHeight: '42px' }}
              />

              <div className="flex items-center justify-between pt-2.5 border-t border-white/5 mt-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-neutral-400 font-medium px-2.5 py-1 rounded-md bg-[#1d1d1c] border border-white/5">
                    Model: Llama 3.3 70B
                  </span>
                  <span className="text-xs text-neutral-400">
                    {roleConfig.label}
                  </span>
                </div>

                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all pressable ${
                    input.trim()
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <SendIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-neutral-500 font-sans">
              FinSolve is AI and answers are filtered according to your verified role.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
