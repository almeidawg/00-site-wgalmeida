import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { Heart, MessageCircle, Share2, Copy, Check, Loader2, Send } from 'lucide-react';
import {
  toggleLike,
  isLikedByUser,
  addComment,
  getComments,
  subscribeToComments,
} from '@/services/moodboardShareService';

const formatRelTime = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

const MoodboardSocialPanel = ({ shareId, initialLikes = 0, shareUrl }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    setLiked(isLikedByUser(shareId));
  }, [shareId]);

  useEffect(() => {
    getComments(shareId).then(data => {
      setComments(data);
      setCommentsLoading(false);
    }).catch(() => setCommentsLoading(false));

    const channel = subscribeToComments(shareId, (newComment) => {
      setComments(prev => {
        if (prev.find(c => c.id === newComment.id)) return prev;
        return [...prev, newComment];
      });
    });

    return () => { channel?.unsubscribe?.(); };
  }, [shareId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const result = await toggleLike(shareId);
      setLikes(result.likes);
      setLiked(result.liked);
    } catch {
      // silently fail
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!author.trim() || !content.trim() || sending) return;
    setSending(true);
    try {
      const newComment = await addComment(shareId, author, content);
      setComments(prev => [...prev, newComment]);
      setContent('');
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const handleShare = (platform) => {
    const url = shareUrl || window.location.href;
    const text = encodeURIComponent(`Veja meu projeto de design de interiores: ${url}`);
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${text}`, '_blank');
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <section className="max-w-3xl mx-auto w-full space-y-10 py-8">
      {/* Likes e Share */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Like */}
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl border font-bold text-sm transition-all ${
                liked
                  ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-red-500/30 hover:text-red-400'
              }`}
            >
              {likeLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} />
              }
              {liked ? 'Curtido' : 'Curtir'}
            </motion.button>
            <AnimatePresence mode="wait">
              <motion.span
                key={likes}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="text-slate-400 text-sm"
              >
                {likes} {likes === 1 ? 'curtida' : 'curtidas'}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Share buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-bold transition-all"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-wg-orange" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>

        {likes > 0 && (
          <p className="text-slate-500 text-xs text-center">
            ❤️ {likes} {likes === 1 ? 'pessoa adorou' : 'pessoas adoraram'} este projeto
          </p>
        )}
      </div>

      {/* Comentários */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-4 h-4 text-wg-orange" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Comentários {comments.length > 0 && `(${comments.length})`}
          </h3>
        </div>

        {/* Lista de comentários */}
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-slate-700 text-xs py-8">Seja o primeiro a comentar!</p>
          ) : (
            comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <div className="w-8 h-8 rounded-full bg-wg-orange/20 border border-wg-orange/30 flex items-center justify-center text-wg-orange font-bold text-xs flex-shrink-0">
                  {c.author?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-white">{c.author}</span>
                    <span className="text-[9px] text-slate-600 flex-shrink-0">{formatRelTime(c.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{c.content}</p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Form novo comentário */}
        <form onSubmit={handleComment} className="space-y-3">
          <input
            type="text"
            placeholder="Seu nome"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            maxLength={60}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-wg-orange transition-all"
          />
          <div className="flex gap-2">
            <textarea
              placeholder="Deixe um comentário sobre este projeto..."
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={500}
              rows={2}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-wg-orange transition-all resize-none"
            />
            <button
              type="submit"
              disabled={!author.trim() || !content.trim() || sending}
              className="px-5 bg-wg-orange hover:bg-wg-orange/90 text-white rounded-2xl font-bold disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          {content.length > 400 && (
            <p className="text-[9px] text-slate-600 text-right">{500 - content.length} caracteres restantes</p>
          )}
        </form>
      </div>
    </section>
  );
};

export default MoodboardSocialPanel;
