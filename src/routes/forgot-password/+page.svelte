<script lang="ts">
  import { onMount } from 'svelte';
  import { Mail, ArrowLeft, Loader2, CheckCircle, Hexagon } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme.svelte';
  
  let email = $state('');
  let loading = $state(false);
  let errorMsg = $state('');
  let success = $state(false);
  
  onMount(() => {
    theme.init();
  });
  
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    errorMsg = '';
    
    try {
      const res = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json() as { message?: string };
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }
      
      success = true;
      
    } catch (err: any) {
      errorMsg = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center py-12 px-4 grain" style="background-color: var(--bg-primary);">
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl" style="background-color: var(--accent-bg); opacity: 0.5;"></div>
  </div>
  
  <div class="w-full max-w-md relative z-10">
    <div class="mb-6">
      <a href="/login" class="inline-flex items-center gap-2 transition text-sm cursor-pointer" style="color: var(--text-secondary);">
        <ArrowLeft class="w-4 h-4" />
        Back to login
      </a>
    </div>
    
    {#if success}
      <div class="card-elevated p-8 text-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: var(--success-bg);">
          <CheckCircle class="w-8 h-8" style="color: var(--success);" />
        </div>
        <h2 class="font-display text-display-xs mb-2" style="color: var(--text-primary);">Check your email</h2>
        <p class="mb-6" style="color: var(--text-secondary);">
          If an account exists for <span style="color: var(--text-primary);">{email}</span>, we've sent password reset instructions.
        </p>
        <a 
          href="/login" 
          class="btn-primary w-full"
        >
          Return to login
        </a>
      </div>
    {:else}
      <div class="card-elevated p-8">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style="background-color: var(--accent-primary);">
            <Hexagon class="w-6 h-6" style="color: #0a0a0a;" strokeWidth={2.5} />
          </div>
          <h1 class="font-display text-display-xs mb-2" style="color: var(--text-primary);">Forgot Password?</h1>
          <p class="text-sm" style="color: var(--text-secondary);">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {#if errorMsg}
          <div class="mb-6 p-4 rounded-xl text-sm" style="background-color: var(--error-bg); color: var(--error); border: 1px solid var(--error-bg);">
            {errorMsg}
          </div>
        {/if}
        
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
          
          <button
            type="submit"
            disabled={loading}
            class="btn-primary w-full cursor-pointer"
          >
            {#if loading}
              <Loader2 class="w-5 h-5 animate-spin" />
              Sending...
            {:else}
              Send Reset Link
            {/if}
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>
