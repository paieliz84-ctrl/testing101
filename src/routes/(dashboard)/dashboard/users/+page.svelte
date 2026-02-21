<script lang="ts">
  import type { User } from '$lib/db';
  import type { PageProps } from './$types';
  import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    Loader2, 
    Mail,
    Shield,
    UserX,
    UserCheck,
    Download,
    Plus,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight
  } from 'lucide-svelte';
  
  let { data }: PageProps = $props();
  
  // Data from server load (no loading needed!)
  let users = $state<User[]>(data.users);
  let searchQuery = $state('');
  let selectedFilter = $state('all');
  let currentPage = $state(1);
  const itemsPerPage = 10;
  
  let filteredUsers = $derived(() => {
    let result = users;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }
    
    if (selectedFilter !== 'all') {
      result = result.filter(u => u.provider === selectedFilter);
    }
    
    return result;
  });
  
  let paginatedUsers = $derived(() => {
    const filtered = filteredUsers();
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  });
  
  let totalPages = $derived(() => Math.ceil(filteredUsers().length / itemsPerPage));
  
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  function formatDate(timestamp: number | null): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages()) {
      currentPage = page;
    }
  }
</script>

<svelte:head>
  <title>Users | Studio</title>
</svelte:head>

<div class="p-6 lg:p-8 max-w-7xl mx-auto">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center gap-2 text-sm mb-2" style="color: var(--text-tertiary);">
      <span>Management</span>
      <span>/</span>
      <span style="color: var(--text-secondary);">Users</span>
    </div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold" style="color: var(--text-primary);">User Management</h1>
        <p class="mt-1" style="color: var(--text-secondary);">Manage and monitor user accounts in your system.</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn-primary cursor-pointer">
          <Download class="w-4 h-4" />
          Export
        </button>
        <button class="btn-primary cursor-pointer">
          <Plus class="w-4 h-4" />
          Add User
        </button>
      </div>
    </div>
  </div>
  
  <!-- Stats Row -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <div class="card-elevated p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background-color: var(--success-bg);">
          <UserCheck class="w-5 h-5" style="color: var(--success);" />
        </div>
        <div>
          <p class="text-2xl font-bold" style="color: var(--text-primary);">{users.length}</p>
          <p class="text-sm" style="color: var(--text-secondary);">Total Users</p>
        </div>
      </div>
    </div>
    <div class="card-elevated p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background-color: var(--accent-bg);">
          <Shield class="w-5 h-5" style="color: var(--accent-primary);" />
        </div>
        <div>
          <p class="text-2xl font-bold" style="color: var(--text-primary);">
            {users.filter(u => u.email_verified).length}
          </p>
          <p class="text-sm" style="color: var(--text-secondary);">Verified</p>
        </div>
      </div>
    </div>
    <div class="card-elevated p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background-color: rgba(59, 130, 246, 0.1);">
          <Mail class="w-5 h-5" style="color: #3b82f6;" />
        </div>
        <div>
          <p class="text-2xl font-bold" style="color: var(--text-primary);">
            {users.filter(u => u.provider === 'email').length}
          </p>
          <p class="text-sm" style="color: var(--text-secondary);">Email Users</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Filters & Search -->
  <div class="card-elevated mb-6">
    <div class="p-4 flex flex-col sm:flex-row gap-4" style="border-bottom: 1px solid var(--border-primary);">
      <!-- Search -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style="color: var(--text-tertiary);" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search users by name or email..."
          class="input pl-10"
        />
      </div>
      
      <!-- Filter -->
      <div class="flex items-center gap-2">
        <div class="relative">
          <Filter class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style="color: var(--text-tertiary);" />
          <select
            bind:value={selectedFilter}
            class="input pl-10 appearance-none cursor-pointer"
          >
            <option value="all">All Providers</option>
            <option value="email">Email</option>
            <option value="google">Google</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr style="background-color: rgba(var(--bg-secondary-rgb, 23, 23, 23), 0.3);">
            <th class="text-left text-xs font-medium uppercase tracking-wider px-6 py-3 cursor-pointer transition-colors" style="color: var(--text-tertiary);">
              <div class="flex items-center gap-1">
                User
                <ArrowUpDown class="w-3 h-3" />
              </div>
            </th>
            <th class="text-left text-xs font-medium uppercase tracking-wider px-6 py-3" style="color: var(--text-tertiary);">
              Provider
            </th>
            <th class="text-left text-xs font-medium uppercase tracking-wider px-6 py-3" style="color: var(--text-tertiary);">
              Status
            </th>
            <th class="text-left text-xs font-medium uppercase tracking-wider px-6 py-3 cursor-pointer transition-colors" style="color: var(--text-tertiary);">
              <div class="flex items-center gap-1">
                Joined
                <ArrowUpDown class="w-3 h-3" />
              </div>
            </th>
            <th class="text-right text-xs font-medium uppercase tracking-wider px-6 py-3" style="color: var(--text-tertiary);">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {#each paginatedUsers() as user}
            <tr class="transition-colors" style="border-top: 1px solid var(--border-primary); hover:background-color: var(--bg-hover);">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  {#if user.avatar}
                    <img src={user.avatar} alt={user.name} class="w-10 h-10 rounded-xl object-cover" style="border: 2px solid var(--border-primary);" />
                  {:else}
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style="background: linear-gradient(135deg, var(--accent-primary), #d97706); color: #0a0a0a;">
                      {getInitials(user.name)}
                    </div>
                  {/if}
                  <div>
                    <p class="font-medium" style="color: var(--text-primary);">{user.name}</p>
                    <p class="text-sm" style="color: var(--text-tertiary);">{user.email}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">
                  {user.provider}
                </span>
              </td>
              <td class="px-6 py-4">
                {#if user.email_verified}
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style="background-color: var(--success-bg); color: var(--success);">
                    <span class="w-1.5 h-1.5 rounded-full" style="background-color: var(--success);"></span>
                    Active
                  </span>
                {:else}
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style="background-color: var(--warning-bg); color: var(--warning);">
                    <span class="w-1.5 h-1.5 rounded-full" style="background-color: var(--warning);"></span>
                    Pending
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4 text-sm" style="color: var(--text-tertiary);">
                {formatDate(user.created_at)}
              </td>
              <td class="px-6 py-4 text-right">
                <button class="p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100" style="color: var(--text-tertiary); hover:color: var(--text-secondary);" aria-label="More actions">
                  <MoreHorizontal class="w-4 h-4" />
                </button>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background-color: var(--bg-tertiary);">
                    <UserX class="w-6 h-6" style="color: var(--text-tertiary);" />
                  </div>
                  <p style="color: var(--text-secondary);">No users found</p>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    {#if totalPages() > 1}
      <div class="px-6 py-4 flex items-center justify-between" style="border-top: 1px solid var(--border-primary);">
        <p class="text-sm" style="color: var(--text-secondary);">
          Showing <span style="color: var(--text-primary);">{(currentPage - 1) * itemsPerPage + 1}</span> to <span style="color: var(--text-primary);">{Math.min(currentPage * itemsPerPage, filteredUsers().length)}</span> of <span style="color: var(--text-primary);">{filteredUsers().length}</span> users
        </p>
        <div class="flex items-center gap-2">
          <button
            onclick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            class="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style="color: var(--text-tertiary);"
            aria-label="Previous page"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          
          {#each Array(totalPages()) as _, i}
            {@const page = i + 1}
            {#if page === 1 || page === totalPages() || (page >= currentPage - 1 && page <= currentPage + 1)}
              <button
                onclick={() => handlePageChange(page)}
                class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                style={currentPage === page ? 'background-color: var(--accent-primary); color: #0a0a0a;' : 'color: var(--text-secondary);'}
              >
                {page}
              </button>
            {:else if page === currentPage - 2 || page === currentPage + 2}
              <span style="color: var(--text-muted);">...</span>
            {/if}
          {/each}
          
          <button
            onclick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages()}
            class="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style="color: var(--text-tertiary);"
            aria-label="Next page"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
