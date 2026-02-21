<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Chrome, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Hexagon } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme.svelte';
  
  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let loading = $state(false);
  let errorMsg = $state('');
  
  onMount(() => {
    theme.init();
  });
  
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    errorMsg = '';
    
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json() as { message?: string };
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      goto('/dashboard');
      
    } catch (err: any) {
      errorMsg = err.message;
    } finally {
      loading = false;
    }
  }
  
  function loginWithGoogle() {
    window.location.href = '/auth/google';
  }
</script>

<div class="min-h-screen flex items-center justify-center py-12 px-4 grain" style="background-color: var(--bg-primary);">
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl" style="background-color: var(--accent-bg); opacity: 0.5;"></div>
  </div>
  
  <div class="w-full max-w-md relative z-10">
    <div class="text-center mb-8">
      <a href="/" class="inline-flex items-center gap-3 group">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105" style="background-color: var(--accent-primary);">
          <Hexagon class="w-6 h-6" style="color: #0a0a0a;" strokeWidth={2.5} />
        </div>
      </a>
    </div>
    
    <div class="card-elevated p-8">
      <div class="text-center mb-8">
        <h1 class="font-display text-display-xs mb-2" style="color: var(--text-primary);">Welcome back</h1>
        <p style="color: var(--text-secondary);">Sign in to your account</p>
      </div>
      
      {#if errorMsg}
        <div class="mb-6 p-4 rounded-xl text-sm" style="background-color: var(--error-bg); color: var(--error); border: 1px solid var(--error-bg);">
          {errorMsg}
        </div>
      {/if}
      
      <button
        onclick={loginWithGoogle}
        disabled={loading}
        class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold transition disabled:opacity-50 mb-6 cursor-pointer"
        style="background-color: var(--text-primary); color: var(--bg-primary);"
      >
        <Chrome class="w-5 h-5" />
        Continue with Google
      </button>
      
      <div class="relative mb-6">
        <div class="absolute inset-0 flex items-center">
          <div class="divider w-full"></div>
        </div>
        <div class="relative flex justify-center text-xs">
          <span class="px-4" style="background-color: var(--bg-secondary); color: var(--text-muted);">or continue with email</span>
        </div>
      </div>
      
      <form onsubmit={handleSubmit} class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
            Email Address
          </label>
          <div class="relative">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style="color: var(--text-muted);" />
            <input
              id="email"
              type="email"
              bind:value={email}
              required
              class="input pl-12"
              placeholder="you@example.com"
            />
          </div>
        </div>
        
        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="password" class="text-sm font-medium" style="color: var(--text-secondary);">
              Password
            </label>
            <a href="/forgot-password" class="text-sm transition-colors" style="color: var(--accent-primary);">
              Forgot?
            </a>
          </div>
          <div class="relative">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style="color: var(--text-muted);" />
            {#if showPassword}
              <input
                id="password"
                type="text"
                bind:value={password}
                required
                class="input pl-12 pr-12"
                placeholder="••••••••"
              />
            {:else}
              <input
                id="password"
                type="password"
                bind:value={password}
                required
                class="input pl-12 pr-12"
                placeholder="••••••••"
              />
            {/if}
            <button
              type="button"
              onclick={() => showPassword = !showPassword}
              class="absolute right-4 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
              style="color: var(--text-muted);"
            >
              {#if showPassword}
                <EyeOff class="w-5 h-5" />
              {:else}
                <Eye class="w-5 h-5" />
              {/if}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          class="btn-primary w-full cursor-pointer"
        >
          {#if loading}
            <Loader2 class="w-5 h-5 animate-spin" />
            Signing in...
          {:else}
            Sign In
            <ArrowRight class="w-4 h-4" />
          {/if}
        </button>
      </form>
    </div>
    
    <p class="text-center mt-6" style="color: var(--text-secondary);">
      Don't have an account?
      <a href="/register" class="font-medium transition-colors" style="color: var(--accent-primary);">
        Create one
      </a>
    </p>
  </div>
</div>
