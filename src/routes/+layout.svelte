<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { Hexagon, Sun, Moon } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme.svelte';
  
  let { children } = $props();
  
  // Routes that use full-width layout without header
  let isDashboardRoute = $derived(
    page.url.pathname.startsWith('/dashboard') || 
    page.url.pathname === '/profile'
  );
  
  // Auth pages - completely clean layout
  let isAuthPage = $derived(
    ['/login', '/register', '/forgot-password', '/reset-password'].some(
      path => page.url.pathname.startsWith(path)
    )
  );
  
  // Home page - special layout with footer
  let isHomePage = $derived(page.url.pathname === '/');
  
  onMount(() => {
    theme.init();
  });
</script>

{#if isAuthPage}
  <!-- Auth pages: Clean layout, no header/footer -->
  {@render children()}
{:else if isDashboardRoute}
  <!-- Dashboard routes: Managed by (dashboard) group layout -->
  {@render children()}
{:else}
  <!-- Public pages: Standard layout with header -->
  <div class="min-h-screen flex flex-col grain" style="background-color: var(--bg-primary);">
    <header class="sticky top-0 z-50 backdrop-blur-xl" style="background-color: color-mix(in srgb, var(--bg-primary), transparent 20%); border-bottom: 1px solid var(--border-primary);">
      <div class="container-wide">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a href="/" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105" style="background-color: var(--accent-primary);">
              <Hexagon class="w-5 h-5" style="color: #0a0a0a;" strokeWidth={2.5} />
            </div>
            <span class="font-display font-bold text-lg" style="color: var(--text-primary);">Studio</span>
          </a>
          
          <!-- Navigation -->
          <div class="flex items-center gap-4">
            <!-- Theme Toggle -->
            <button
              type="button"
              onclick={() => theme.toggle()}
              class="p-2 rounded-lg transition-colors cursor-pointer"
              style="color: var(--text-secondary); hover:color: var(--text-primary);"
              aria-label="Toggle theme"
            >
              {#if theme.current === 'dark'}
                <Sun class="w-5 h-5" />
              {:else}
                <Moon class="w-5 h-5" />
              {/if}
            </button>
            
            <nav class="flex items-center gap-1">
              <a 
                href="/login" 
                class="px-4 py-2 text-sm font-medium transition-colors"
                style="color: var(--text-secondary);"
              >
                Sign In
              </a>
              <a 
                href="/register" 
                class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style="background-color: var(--accent-primary); color: #0a0a0a;"
              >
                Get Started
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
    
    <main class="flex-1">
      {@render children()}
    </main>
    
    {#if isHomePage}
      <footer class="py-12" style="border-top: 1px solid var(--border-primary);">
        <div class="container-wide">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: var(--accent-primary);">
                <Hexagon class="w-4 h-4" style="color: #0a0a0a;" strokeWidth={2.5} />
              </div>
              <span class="font-display font-semibold" style="color: var(--text-primary);">Studio</span>
            </div>
            <p style="color: var(--text-muted);">
              Crafted with precision
            </p>
          </div>
        </div>
      </footer>
    {/if}
  </div>
{/if}
