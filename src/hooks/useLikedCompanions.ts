import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useLikedCompanions = (currentUserId: string | null) => {
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchLikes = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("liked_companions")
        .select("liked_user_id")
        .eq("user_id", currentUserId);

      if (error) throw error;

      setLikedUserIds(new Set(data?.map(l => l.liked_user_id) || []));
    } catch (err) {
      console.error("Error fetching likes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const toggleLike = async (likedUserId: string) => {
    if (!currentUserId) throw new Error("Not authenticated");

    const isLiked = likedUserIds.has(likedUserId);

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from("liked_companions")
        .delete()
        .eq("user_id", currentUserId)
        .eq("liked_user_id", likedUserId);

      if (error) throw error;
      
      setLikedUserIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(likedUserId);
        return newSet;
      });
    } else {
      // Like
      const { error } = await supabase
        .from("liked_companions")
        .insert({
          user_id: currentUserId,
          liked_user_id: likedUserId
        });

      if (error) throw error;
      
      setLikedUserIds(prev => new Set(prev).add(likedUserId));
    }
  };

  const isLiked = (userId: string): boolean => {
    return likedUserIds.has(userId);
  };

  useEffect(() => {
    if (currentUserId) {
      fetchLikes();
    }
  }, [currentUserId, fetchLikes]);

  return {
    likedUserIds,
    isLoading,
    toggleLike,
    isLiked,
    refetch: fetchLikes
  };
};
