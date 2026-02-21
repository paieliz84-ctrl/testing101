<script lang="ts">
  import { goto } from '$app/navigation';
  import type { LayoutProps } from './$types';
  import AppSidebar from '$lib/components/AppSidebar.svelte';
  import { theme } from '$lib/stores/theme.svelte';
  
  let { data, children }: LayoutProps = $props();
  
  // User dari server load (dari hooks.server.ts)
  let user = $derived(data.user);
  
  // Initialize theme
  theme.init();
  
  async function handleLogout() {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      goto('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }
</script>

<div class="min-h-screen flex grain" style="background-color: var(--bg-primary);">
  <AppSidebar {user} onLogout={handleLogout} />
  
  <main class="flex-1 min-w-0 lg:ml-0 ml-0">
    {#if user}
      <div class="h-full">
        {@render children()}
      </div>
    {:else}
      <div class="flex items-center justify-center h-screen">
        <div class="text-center">
          <p style="color: var(--text-secondary);" class="mb-4">Please log in to access this page</p>
          <a href="/login" class="btn-primary">Go to Login</a>
        </div>
      </div>
    {/if}
  </main>
</div>
