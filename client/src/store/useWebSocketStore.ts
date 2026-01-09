import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';

interface JobUpdate {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  outputUrl?: string;
  error?: string;
  timestamp: string;
}

interface WebSocketStore {
  socket: Socket | null;
  isConnected: boolean;
  jobUpdates: Map<string, JobUpdate>;

  connect: (token?: string) => void;
  disconnect: () => void;
  subscribeToJob: (jobId: string) => void;
  unsubscribeFromJob: (jobId: string) => void;
  getJobUpdate: (jobId: string) => JobUpdate | undefined;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';

export const useWebSocketStore = create<WebSocketStore>()(
  devtools(
    (set, get) => ({
      socket: null,
      isConnected: false,
      jobUpdates: new Map(),

      connect: (token?) => {
        const socket = io(WS_URL, {
          auth: token ? { token } : undefined,
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
          console.log('✅ WebSocket connected');
          set({ isConnected: true });
        });

        socket.on('disconnect', () => {
          console.log('❌ WebSocket disconnected');
          set({ isConnected: false });
        });

        socket.on('job:created', (data: { jobId: string }) => {
          console.log('🎬 Job created:', data.jobId);
          set((state) => {
            const newUpdates = new Map(state.jobUpdates);
            newUpdates.set(data.jobId, {
              jobId: data.jobId,
              status: 'PENDING',
              timestamp: new Date().toISOString(),
            });
            return { jobUpdates: newUpdates };
          });
        });

        socket.on('job:processing', (data: { jobId: string; progress?: number }) => {
          console.log('⚙️ Job processing:', data.jobId, data.progress);
          set((state) => {
            const newUpdates = new Map(state.jobUpdates);
            newUpdates.set(data.jobId, {
              jobId: data.jobId,
              status: 'PROCESSING',
              progress: data.progress,
              timestamp: new Date().toISOString(),
            });
            return { jobUpdates: newUpdates };
          });
        });

        socket.on('job:completed', (data: { jobId: string; outputUrl: string }) => {
          console.log('✅ Job completed:', data.jobId);
          set((state) => {
            const newUpdates = new Map(state.jobUpdates);
            newUpdates.set(data.jobId, {
              jobId: data.jobId,
              status: 'COMPLETED',
              outputUrl: data.outputUrl,
              progress: 100,
              timestamp: new Date().toISOString(),
            });
            return { jobUpdates: newUpdates };
          });

          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Video Ready! 🎉', {
              body: 'Your video generation is complete',
              icon: '/icon.png',
            });
          }
        });

        socket.on('job:failed', (data: { jobId: string; error: string }) => {
          console.error('❌ Job failed:', data.jobId, data.error);
          set((state) => {
            const newUpdates = new Map(state.jobUpdates);
            newUpdates.set(data.jobId, {
              jobId: data.jobId,
              status: 'FAILED',
              error: data.error,
              timestamp: new Date().toISOString(),
            });
            return { jobUpdates: newUpdates };
          });
        });

        socket.on('error', (error: any) => {
          console.error('WebSocket error:', error);
        });

        set({ socket });
      },

      disconnect: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null, isConnected: false });
        }
      },

      subscribeToJob: (jobId: string) => {
        const { socket } = get();
        if (socket) {
          socket.emit('subscribe:job', { jobId });
        }
      },

      unsubscribeFromJob: (jobId: string) => {
        const { socket } = get();
        if (socket) {
          socket.emit('unsubscribe:job', { jobId });
        }
      },

      getJobUpdate: (jobId: string) => {
        return get().jobUpdates.get(jobId);
      },
    }),
    { name: 'WebSocketStore' }
  )
);
