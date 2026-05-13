import { supabase } from '@/lib/customSupabaseClient';

const generateShareId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const getVisitorFingerprint = () => {
  let id = localStorage.getItem('wg-visitor-id');
  if (!id) {
    id = crypto.randomUUID?.() ?? generateShareId();
    localStorage.setItem('wg-visitor-id', id);
  }
  return id;
};

export async function saveMoodboardShare({ projectName, clientName, colors, styles, images }) {
  const shareId = generateShareId();
  const { data, error } = await supabase
    .from('moodboard_shares')
    .insert({
      share_id: shareId,
      project_name: projectName || 'Meu Projeto',
      client_name: clientName || 'Visitante',
      colors: colors || [],
      styles: styles || [],
      images: (images || []).slice(0, 12).map(img => ({
        u: img.url || img.thumb || '',
        t: img.name || img.title || '',
        p: img.price || null,
        s: img.source || null,
      })),
    })
    .select('share_id')
    .single();

  if (error) throw error;
  return {
    shareId: data.share_id,
    shareUrl: `${window.location.origin}/moodboard/s/${data.share_id}`,
  };
}

export async function getMoodboardShare(shareId) {
  const { data, error } = await supabase
    .from('moodboard_shares')
    .select('*')
    .eq('share_id', shareId)
    .single();

  if (error) throw error;
  return data;
}

export async function incrementViews(shareId) {
  await supabase.rpc('increment_moodboard_views', { p_share_id: shareId }).catch(() => {
    // Fallback: update direto
    supabase
      .from('moodboard_shares')
      .update({ views: supabase.raw('views + 1') })
      .eq('share_id', shareId)
      .catch(() => {});
  });
}

export async function toggleLike(shareId) {
  const fingerprint = getVisitorFingerprint();
  const likedKey = `wg-liked-${shareId}`;
  const alreadyLiked = localStorage.getItem(likedKey) === '1';

  const delta = alreadyLiked ? -1 : 1;

  const { data } = await supabase
    .from('moodboard_shares')
    .select('likes')
    .eq('share_id', shareId)
    .single();

  const currentLikes = data?.likes ?? 0;
  const newLikes = Math.max(0, currentLikes + delta);

  await supabase
    .from('moodboard_shares')
    .update({ likes: newLikes })
    .eq('share_id', shareId);

  if (alreadyLiked) {
    localStorage.removeItem(likedKey);
  } else {
    localStorage.setItem(likedKey, '1');
  }

  return { likes: newLikes, liked: !alreadyLiked };
}

export function isLikedByUser(shareId) {
  return localStorage.getItem(`wg-liked-${shareId}`) === '1';
}

export async function addComment(shareId, author, content) {
  const { data, error } = await supabase
    .from('moodboard_comments')
    .insert({ share_id: shareId, author: author.trim(), content: content.trim() })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function getComments(shareId) {
  const { data, error } = await supabase
    .from('moodboard_comments')
    .select('*')
    .eq('share_id', shareId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export function subscribeToComments(shareId, callback) {
  return supabase
    .channel(`moodboard-comments-${shareId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'moodboard_comments',
      filter: `share_id=eq.${shareId}`,
    }, payload => callback(payload.new))
    .subscribe();
}
