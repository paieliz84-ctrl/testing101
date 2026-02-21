<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { 
    LayoutDashboard, 
    User, 
    Settings, 
    Users, 
    Hexagon,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon
  } from 'lucide-svelte';
  import type { User as UserType } from '$lib/db';
  import { theme } from '$lib/stores/theme.svelte';

  interface Props {
    user: UserType | null;
    onLogout: () => void;
  }

  let { user, onLogout }: Props = $props();

  let collapsed = $state(false);
  let mobileOpen = $state(false);

  interface NavItem {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: string;
  }

  const mainNav: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const adminNav: NavItem[] = [
    { href: '/dashboard/users', label: 'Users', icon: Users, badge: 'Admin' },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  function toggleSidebar() {
    collapsed = !collapsed;
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onMount(() => {
    theme.init();
  });
</script>

<!-- Mobile Overlay -->
{#if mobileOpen}
  <button
    type="button"
    class="fixed inset-0 z-40 lg:hidden"
    style="background-color: rgba(0,0,0,0.6); backdrop-filter: blur(4px);"
    onclick={() => mobileOpen = false}
    aria-label="Close sidebar"
  ></button>
{/if}

<!-- Mobile Toggle Button -->
<button
  type="button"
  class="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-xl transition-colors"
  style="background-color: var(--bg-secondary); border: 1px solid var(--border-primary); color: var(--text-secondary);"
  onclick={() => mobileOpen = !mobileOpen}
  aria-label="Toggle menu"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
</button>

<!-- Sidebar -->
<aside
  class="fixed lg:static inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-out {mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} {collapsed ? 'w-20' : 'w-64'}"
  style="background-color: var(--bg-secondary); border-right: 1px solid var(--border-primary);"
>
  <!-- Logo -->
  <div class="h-16 flex items-center px-4" style="border-bottom: 1px solid var(--border-primary);">
    <a href="/dashboard" class="flex items-center gap-3 group overflow-hidden">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105" style="background-color: var(--accent-primary);">
        <Hexagon class="w-5 h-5" style="color: #0a0a0a;" strokeWidth={2.5} />
      </div>
      {#if !collapsed}
        <div class="overflow-hidden">
          <span class="font-display font-bold text-lg whitespace-nowrap" style="color: var(--text-primary);">Studio</span>
          <span class="block text-[10px] -mt-1 whitespace-nowrap" style="color: var(--text-tertiary);">Admin Panel</span>
        </div>
      {/if}
    </a>
    
    <!-- Collapse Toggle (Desktop) -->
    <button
      type="button"
      class="hidden lg:flex ml-auto p-1.5 rounded-lg transition-colors"
      style="color: var(--text-tertiary);"
      onclick={toggleSidebar}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {#if collapsed}
        <ChevronRight class="w-4 h-4" />
      {:else}
        <ChevronLeft class="w-4 h-4" />
      {/if}
    </button>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto py-4 px-3 scrollbar-smooth">
    <!-- Main Navigation -->
    <div class="space-y-1">
      <div class="px-3 mb-2">
        {#if !collapsed}
          <span class="text-xs font-medium uppercase tracking-wider" style="color: var(--text-tertiary);">Main</span>
        {:else}
          <div class="mx-auto w-8" style="height: 1px; background-color: var(--border-primary);"></div>
        {/if}
      </div>
      
      {#each mainNav as item}
        {@const isActive = page.url.pathname === item.href}
        <a
          href={item.href}
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
          class:sidebar-link-active={isActive}
          class:sidebar-link-inactive={!isActive}
          title={collapsed ? item.label : ''}
        >
          <item.icon class="w-5 h-5 shrink-0" style={isActive ? 'color: var(--accent-primary);' : 'color: var(--text-tertiary);'} />
          {#if !collapsed}
            <span class="truncate">{item.label}</span>
          {/if}
        </a>
      {/each}
    </div>

    <!-- Admin Navigation -->
    <div class="mt-6 space-y-1">
      <div class="px-3 mb-2">
        {#if !collapsed}
          <span class="text-xs font-medium uppercase tracking-wider" style="color: var(--text-tertiary);">Management</span>
        {:else}
          <div class="mx-auto w-8" style="height: 1px; background-color: var(--border-primary);"></div>
        {/if}
      </div>
      
      {#each adminNav as item}
        {@const isActive = page.url.pathname === item.href || page.url.pathname.startsWith(item.href + '/')}
        <a
          href={item.href}
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
          class:sidebar-link-active={isActive}
          class:sidebar-link-inactive={!isActive}
          title={collapsed ? item.label : ''}
        >
          <item.icon class="w-5 h-5 shrink-0" style={isActive ? 'color: var(--accent-primary);' : 'color: var(--text-tertiary);'} />
          {#if !collapsed}
            <span class="flex-1 truncate">{item.label}</span>
            {#if item.badge}
              <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">{item.badge}</span>
            {/if}
          {/if}
        </a>
      {/each}
    </div>
  </nav>

  <!-- Theme Toggle -->
  <div class="px-3 pb-3">
    {#if collapsed}
      <button
        type="button"
        onclick={() => theme.toggle()}
        class="w-full flex items-center justify-center p-2 rounded-xl transition-colors cursor-pointer"
        style="color: var(--text-tertiary);"
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        {#if theme.current === 'dark'}
          <Sun class="w-4 h-4" />
        {:else}
          <Moon class="w-4 h-4" />
        {/if}
      </button>
    {:else}
      <button
        type="button"
        onclick={() => theme.toggle()}
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
        style="color: var(--text-tertiary);"
        aria-label="Toggle theme"
      >
        {#if theme.current === 'dark'}
          <Sun class="w-5 h-5" />
          <span>Light Mode</span>
        {:else}
          <Moon class="w-5 h-5" />
          <span>Dark Mode</span>
        {/if}
      </button>
    {/if}
  </div>

  <!-- User Section -->
  <div class="p-3" style="border-top: 1px solid var(--border-primary);">
    {#if user}
      <div class="relative group">
        <!-- User Card -->
        <div class="flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer" style="hover:background-color: var(--bg-hover);">
          <!-- Avatar -->
          {#if user.avatar}
            <img 
              src={user.avatar} 
              alt={user.name}
              class="w-9 h-9 rounded-xl object-cover shrink-0"
              style="border: 2px solid var(--border-primary);"
            />
          {:else}
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style="background: linear-gradient(135deg, var(--accent-primary), #d97706); color: #0a0a0a;">
              {getInitials(user.name)}
            </div>
          {/if}
          
          {#if !collapsed}
            <div class="flex-1 min-w-0 overflow-hidden">
              <p class="text-sm font-medium truncate" style="color: var(--text-primary);">{user.name}</p>
              <p class="text-xs truncate" style="color: var(--text-tertiary);">{user.email}</p>
            </div>
          {/if}
        </div>

        <!-- Dropdown (Desktop) / Always visible actions (Collapsed) -->
        {#if collapsed}
          <div class="mt-2 space-y-1">
            <a
              href="/profile"
              class="flex items-center justify-center p-2 rounded-xl transition-colors"
              style="color: var(--text-tertiary);"
              title="Profile"
            >
              <User class="w-4 h-4" />
            </a>
            <button
              type="button"
              onclick={onLogout}
              class="w-full flex items-center justify-center p-2 rounded-xl transition-colors"
              style="color: var(--error);"
              title="Logout"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        {:else}
          <div class="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl" style="background-color: var(--bg-secondary); border: 1px solid var(--border-primary);">
            <div class="space-y-1">
              <a
                href="/profile"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                style="color: var(--text-secondary);"
              >
                <User class="w-4 h-4" />
                Profile
              </a>
              <button
                type="button"
                onclick={onLogout}
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                style="color: var(--error);"
              >
                <LogOut class="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="flex items-center justify-center py-2">
        <div class="w-8 h-9 rounded-xl animate-pulse" style="background-color: var(--bg-tertiary);"></div>
      </div>
    {/if}
  </div>
</aside>
