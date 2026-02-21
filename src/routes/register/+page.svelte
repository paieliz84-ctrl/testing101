<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Chrome, Mail, Lock, User, Eye, EyeOff, Loader2, Check, X, Hexagon, ArrowRight } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme.svelte';
  
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let loading = $state(false);
  let errorMsg = $state('');
  let errors: Record<string, string[]> = $state({});
  
  let passwordValid = $derived({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password)
  });
  
  onMount(() => {
    theme.init();
  });
  
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    errorMsg = '';
    errors = {};
    
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json() as { message?: string; errors?: Record<string, string[]> };
      
      if (!res.ok) {
        if (data.errors) {
          errors = data.errors;
        }
        throw new Error(data.message || 'Registration failed');
      }
      
      goto(`/verify-email-sent?email=${encodeURIComponent(email)}`);
      
    } catch (err: any) {
      errorMsg = err.message;
    } finally {
      loading = false;
    }
  }
  
  function registerWithGoogle() {
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
        <h1 class="font-display text-display-xs mb-2" style="color: var(--text-primary);">Create Account</h1>
        <p style="color: var(--text-secondary);">Get started with your free account</p>
      </div>
      
      {#if errorMsg}
        <div class="mb-6 p-4 rounded-xl text-sm" style="background-color: var(--error-bg); color: var(--error); border: 1px solid var(--error-bg);">
          {errorMsg}
        </div>
      {/if}
      
      <button
        onclick={registerWithGoogle}
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
          <span class="px-4" style="background-color: var(--bg-secondary); color: var(--text-muted);">or register with email</span>
        </div>
      </div>
      
      <form onsubmit={handleSubmit} class="space-y-5">
        <div>
          <label for="name" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
            Full Name
          </label>
          <div class="relative">
            <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style="color: var(--text-muted);" />
            <input
              id="name"
              type="text"
              bind:value={name}
              required
              class="input pl-12"
              placeholder="John Doe"
            />
          </div>
          {#if errors.name}
            <p class="mt-2 text-sm" style="color: var(--error);">{errors.name[0]}</p>
          {/if}
        </div>
        
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
          {#if errors.email}
            <p class="mt-2 text-sm" style="color: var(--error);">{errors.email[0]}</p>
          {/if}
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
            Password
          </label>
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
          
          <div class="mt-4 space-y-2">
            <p class="text-xs uppercase tracking-wider font-medium" style="color: var(--text-muted);">Password requirements</p>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm transition-colors" style="color: {passwordValid.length ? 'var(--success)' : 'var(--text-muted)'};">
                {#if passwordValid.length}
                  <Check class="w-4 h-4" />
                {:else}
                  <X class="w-4 h-4" />
                {/if}
                At least 8 characters
              </div>
              <div class="flex items-center gap-2 text-sm transition-colors" style="color: {passwordValid.uppercase ? 'var(--success)' : 'var(--text-muted)'};">
                {#if passwordValid.uppercase}
                  <Check class="w-4 h-4" />
                {:else}
                  <X class="w-4 h-4" />
                {/if}
                One uppercase letter
              </div>
              <div class="flex items-center gap-2 text-sm transition-colors" style="color: {passwordValid.number ? 'var(--success)' : 'var(--text-muted)'};">
                {#if passwordValid.number}
                  <Check class="w-4 h-4" />
                {:else}
                  <X class="w-4 h-4" />
                {/if}
                One number
              </div>
            </div>
          </div>
          {#if errors.password}
            <p class="mt-2 text-sm" style="color: var(--error);">{errors.password[0]}</p>
          {/if}
        </div>
        
        <button
          type="submit"
          disabled={loading || !passwordValid.length || !passwordValid.uppercase || !passwordValid.number}
          class="btn-primary w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if loading}
            <Loader2 class="w-5 h-5 animate-spin" />
            Creating account...
          {:else}
            Create Account
            <ArrowRight class="w-4 h-4" />
          {/if}
        </button>
      </form>
    </div>
    
    <p class="text-center mt-6" style="color: var(--text-secondary);">
      Already have an account?
      <a href="/login" class="font-medium transition-colors" style="color: var(--accent-primary);">
        Sign in
      </a>
    </p>
  </div>
</div>
