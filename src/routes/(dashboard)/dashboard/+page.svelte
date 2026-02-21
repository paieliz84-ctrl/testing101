<script lang="ts">
  import type { PageProps } from './$types';
  import type { User } from '$lib/db';
  import { 
    Users, 
    TrendingUp, 
    Shield, 
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    MoreHorizontal
  } from 'lucide-svelte';
  
  interface Stats {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: typeof Users;
  }
  
  let { data }: PageProps = $props();
  
  // Data dari server load (no loading needed!)
  let users = $state<User[]>(data.users);
  
  let recentActivity = $state([
    { id: 1, action: 'New user registered', user: 'john@example.com', time: '2 min ago', type: 'user' },
    { id: 2, action: 'Profile updated', user: 'sarah@example.com', time: '1 hour ago', type: 'profile' },
    { id: 3, action: 'Password changed', user: 'mike@example.com', time: '3 hours ago', type: 'security' },
    { id: 4, action: 'New user registered', user: 'emma@example.com', time: '5 hours ago', type: 'user' },
  ]);
  
  // Mock stats data (update dengan real count)
  let stats: Stats[] = [
    { 
      label: 'Total Users', 
      value: users.length.toString(), 
      change: '+12%', 
      trend: 'up',
      icon: Users 
    },
    { 
      label: 'Active Sessions', 
      value: '24', 
      change: '+5%', 
      trend: 'up',
      icon: Activity 
    },
    { 
      label: 'Security Score', 
      value: '98%', 
      change: '+2%', 
      trend: 'up',
      icon: Shield 
    },
    { 
      label: 'Growth Rate', 
      value: '23%', 
      change: '-3%', 
      trend: 'down',
      icon: TrendingUp 
    },
  ];
  
  function getActivityIcon(type: string) {
    switch (type) {
      case 'user': return '👤';
      case 'profile': return '✏️';
      case 'security': return '🔒';
      default: return '📋';
    }
  }
</script>

<svelte:head>
  <title>Dashboard | Studio</title>
</svelte:head>

<div class="p-6 lg:p-8 max-w-7xl mx-auto">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center gap-2 text-sm mb-2" style="color: var(--text-tertiary);">
      <span>Overview</span>
      <span>/</span>
      <span style="color: var(--text-secondary);">Dashboard</span>
    </div>
    <h1 class="text-2xl font-display font-bold" style="color: var(--text-primary);">Dashboard Overview</h1>
    <p style="color: var(--text-secondary);" class="mt-1">Welcome back! Here's what's happening with your account.</p>
  </div>
  
  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {#each stats as stat}
      {@const Icon = stat.icon}
      <div class="rounded-2xl p-5 transition-all duration-300 group" style="background-color: var(--bg-card); border: 1px solid var(--border-primary);" class:hover:border-hover={true}>
        <div class="flex items-start justify-between mb-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style="background-color: var(--bg-tertiary);">
            <Icon class="w-5 h-5" style="color: var(--text-secondary);" />
          </div>
          <div class="flex items-center gap-1 text-xs font-medium">
            {#if stat.trend === 'up'}
              <ArrowUpRight class="w-3 h-3" style="color: var(--success);" />
              <span style="color: var(--success);">{stat.change}</span>
            {:else if stat.trend === 'down'}
              <ArrowDownRight class="w-3 h-3" style="color: var(--error);" />
              <span style="color: var(--error);">{stat.change}</span>
            {:else}
              <span style="color: var(--text-tertiary);">{stat.change}</span>
            {/if}
          </div>
        </div>
        <p class="text-2xl font-bold" style="color: var(--text-primary);">{stat.value}</p>
        <p class="text-sm mt-1" style="color: var(--text-secondary);">{stat.label}</p>
      </div>
    {/each}
  </div>
  
  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Users Table -->
    <div class="lg:col-span-2 rounded-2xl overflow-hidden" style="background-color: var(--bg-card); border: 1px solid var(--border-primary);">
      <div class="px-6 py-4 flex items-center justify-between" style="border-bottom: 1px solid var(--border-primary);">
        <div>
          <h3 class="font-semibold" style="color: var(--text-primary);">Recent Users</h3>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary);">Latest registered users in your system</p>
        </div>
        <a 
          href="/dashboard/users" 
          class="text-sm font-medium transition-colors flex items-center gap-1"
          style="color: var(--accent-primary);"
        >
          View all
          <ArrowUpRight class="w-4 h-4" />
        </a>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-primary);">
              <th class="text-left text-xs font-medium uppercase tracking-wider px-6 py-3" style="color: var(--text-tertiary);">User</th>
              <th class="text-left text-xs font-medium uppercase tracking-wider px-6 py-3" style="color: var(--text-tertiary);">Provider</th>
              <th class="text-left text-xs font-medium uppercase tracking-wider px-6 py-3" style="color: var(--text-tertiary);">Status</th>
              <th class="text-right text-xs font-medium uppercase tracking-wider px-6 py-3" style="color: var(--text-tertiary);">Joined</th>
            </tr>
          </thead>
          <tbody class="divide-y" style="border-color: var(--border-primary);">
            {#each users as user}
              <tr class="transition-colors" style="hover:background-color: var(--bg-hover);">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    {#if user.avatar}
                      <img src={user.avatar} alt={user.name} class="w-9 h-9 rounded-xl object-cover" style="border: 2px solid var(--border-primary);" />
                    {:else}
                      <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold" style="background: linear-gradient(135deg, var(--accent-primary), #d97706); color: #0a0a0a;">
                        {user.name.charAt(0).toUpperCase()}
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
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style="background-color: var(--success-bg); color: var(--success);">
                    <span class="w-1.5 h-1.5 rounded-full" style="background-color: var(--success);"></span>
                    Active
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm" style="color: var(--text-tertiary);">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="4" class="px-6 py-12 text-center" style="color: var(--text-secondary);">
                  No users found
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Activity & Quick Actions -->
    <div class="space-y-6">
      <!-- Recent Activity -->
      <div class="rounded-2xl overflow-hidden" style="background-color: var(--bg-card); border: 1px solid var(--border-primary);">
        <div class="px-6 py-4" style="border-bottom: 1px solid var(--border-primary);">
          <h3 class="font-semibold" style="color: var(--text-primary);">Recent Activity</h3>
          <p class="text-sm mt-0.5" style="color: var(--text-secondary);">Latest actions in your system</p>
        </div>
        <div class="p-4 space-y-1">
          {#each recentActivity as activity}
            <div class="flex items-start gap-3 p-3 rounded-xl transition-colors group" style="hover:background-color: var(--bg-hover);">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style="background-color: var(--bg-tertiary);">
                {getActivityIcon(activity.type)}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium" style="color: var(--text-primary);">{activity.action}</p>
                <p class="text-sm truncate" style="color: var(--text-tertiary);">{activity.user}</p>
                <div class="flex items-center gap-1 mt-1 text-xs" style="color: var(--text-muted);">
                  <Clock class="w-3 h-3" />
                  {activity.time}
                </div>
              </div>
            </div>
          {/each}
        </div>
        <div class="px-6 py-3" style="border-top: 1px solid var(--border-primary);">
          <button class="text-sm transition-colors flex items-center justify-center gap-1 w-full" style="color: var(--text-tertiary);">
            <MoreHorizontal class="w-4 h-4" />
            View all activity
          </button>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="rounded-2xl p-6" style="background: linear-gradient(135deg, var(--accent-bg), transparent); border: 1px solid var(--accent-bg);">
        <h3 class="font-semibold mb-2" style="color: var(--accent-primary);">Pro Tip</h3>
        <p class="text-sm mb-4" style="color: var(--text-secondary);">
          Manage your users efficiently by using the bulk actions feature in the Users section.
        </p>
        <a 
          href="/dashboard/users" 
          class="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style="color: var(--accent-primary);"
        >
          Manage Users
          <ArrowUpRight class="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
</div>
