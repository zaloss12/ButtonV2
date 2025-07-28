import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showNotification } from "@/components/GameNotifications";

export function useGameState(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: gameState, isLoading: loading, refetch } = useQuery({
    queryKey: ['/api/game/state', userId],
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const clickMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user ID');
      
      const response = await fetch(`/api/game/click/${userId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.resetOccurred) {
        showNotification('warning', 'Number reset to 0!');
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/game/state', userId] });
    },
    onError: (error: Error) => {
      if (error.message.includes('cooldown')) {
        showNotification('warning', 'Button is on cooldown!');
      } else {
        showNotification('error', 'Click failed!');
      }
    }
  });

  const clickButton = useCallback(() => {
    clickMutation.mutate();
  }, [clickMutation]);

  const refetchGameState = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    gameState,
    loading,
    clickButton,
    refetchGameState,
    isClicking: clickMutation.isPending
  };
}
