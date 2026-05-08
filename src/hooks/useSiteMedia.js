import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Hook para carregar imagens com suporte a overrides do banco de dados.
 * Resolve o problema de regressão: se houver no banco, usa a do banco.
 * Se não, usa o fallback padrão do código.
 */
export function useSiteMedia(pageId, slotId, defaultUrl) {
  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverride() {
      try {
        const { data, error } = await supabase
          .from('site_media_overrides')
          .select('image_url')
          .eq('page_id', pageId)
          .eq('slot_id', slotId)
          .maybeSingle();

        if (data?.image_url) {
          setUrl(data.image_url);
        }
      } catch (err) {
        console.warn(`[useSiteMedia] Erro ao carregar override para ${pageId}:${slotId}`, err);
      } finally {
        setLoading(false);
      }
    }

    if (pageId && slotId) {
      loadOverride();
    } else {
      setLoading(false);
    }
  }, [pageId, slotId, defaultUrl]);

  return { url, loading };
}
