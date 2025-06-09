// Debug utilities for troubleshooting loading issues

export const debugAuth = {
  // Log authentication state changes
  logAuthState: (state: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Auth State Debug');
      console.log('Timestamp:', new Date().toISOString());
      console.log('User:', state.user ? '✅ Present' : '❌ None');
      console.log('Profile:', state.profile ? '✅ Present' : '❌ None');
      console.log('Loading:', state.loading ? '🔄 True' : '✅ False');
      console.log('Error:', state.error || 'None');
      console.groupEnd();
    }
  },

  // Check Supabase connection
  checkSupabaseConnection: async () => {
    if (process.env.NODE_ENV === 'development') {
      try {
        const { supabase } = await import('./supabase');
        
        console.group('🔍 Supabase Connection Check');
        
        // Test basic connection
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          console.error('❌ Database connection failed:', error);
        } else {
          console.log('✅ Database connection successful');
        }
        
        // Test auth status
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Auth session:', session ? '✅ Active' : '❌ None');
        
        console.groupEnd();
      } catch (err) {
        console.error('❌ Supabase check failed:', err);
      }
    }
  },

  // Monitor network requests
  monitorNetworkRequests: () => {
    if (process.env.NODE_ENV === 'development') {
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        const [url, options] = args;
        const startTime = Date.now();
        
        console.log('🌐 Network Request:', url);
        
        try {
          const response = await originalFetch(...args);
          const duration = Date.now() - startTime;
          
          console.log(`✅ Request completed in ${duration}ms:`, {
            url,
            status: response.status,
            ok: response.ok
          });
          
          return response;
        } catch (error) {
          const duration = Date.now() - startTime;
          
          console.error(`❌ Request failed after ${duration}ms:`, {
            url,
            error: error.message
          });
          
          throw error;
        }
      };
    }
  },

  // Performance monitoring
  measurePerformance: (label: string, fn: () => Promise<any>) => {
    return async (...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        const startTime = performance.now();
        
        try {
          const result = await fn(...args);
          const duration = performance.now() - startTime;
          
          console.log(`⏱️ ${label} completed in ${duration.toFixed(2)}ms`);
          
          return result;
        } catch (error) {
          const duration = performance.now() - startTime;
          
          console.error(`❌ ${label} failed after ${duration.toFixed(2)}ms:`, error);
          
          throw error;
        }
      } else {
        return fn(...args);
      }
    };
  }
};

// Initialize debug tools in development
if (process.env.NODE_ENV === 'development') {
  // Add debug tools to window for manual testing
  (window as any).debugAuth = debugAuth;
  
  // Monitor network requests
  debugAuth.monitorNetworkRequests();
  
  console.log('🔧 Debug tools loaded. Use window.debugAuth for manual testing.');
}