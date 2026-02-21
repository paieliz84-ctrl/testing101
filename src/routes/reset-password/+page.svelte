<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft, Hexagon, Check, X } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme.svelte';
  
  let token = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let loading = $state(false);
  let errorMsg = $state('');
  let success = $state(false);
  
  onMount(() => {
    theme.init();
    
    const searchParams = page.url.searchParams;
    token = searchParams.get('token') || '';
    email = searchParams.get('email') || '';
    
    if (!token || !email) {
      errorMsg = 'Invalid or expired reset link. Please request a new one.';
    }
  });
  
  let passwordValid = $derived({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password)
  });
  
  let passwordsMatch = $derived(password === confirmPassword && password !== '');
  
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    
    if (!passwordsMatch) {
      errorMsg = 'Passwords do not match';
      return;
    }
    
    loading = true;
    errorMsg = '';
    
    try {
      const res = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password })
      });
      
      const data = await res.json() as { message?: string };
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      success = true;
      
      setTimeout(() => {
        goto('/login');
      }, 3000);
      
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
        <h2 class="font-display text-display-xs mb-2" style="color: var(--text-primary);">Password reset successful!</h2>
        <p style="color: var(--text-secondary);">
          Your password has been updated. Redirecting to login...
        </p>
      </div>
    {:else}
      <div class="card-elevated p-8">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style="background-color: var(--accent-primary);">
            <Hexagon class="w-6 h-6" style="color: #0a0a0a;" strokeWidth={2.5} />
          </div>
          <h1 class="font-display text-display-xs mb-2" style="color: var(--text-primary);">Reset Password</h1>
          <p class="text-sm" style="color: var(--text-secondary);">
            Enter your new password below.
          </p>
        </div>
        
        {#if errorMsg}
          <div class="mb-6 p-4 rounded-xl text-sm" style="background-color: var(--error-bg); color: var(--error); border: 1px solid var(--error-bg);">
            {errorMsg}
          </div>
        {/if}
        
        <form onsubmit={handleSubmit} class="space-y-5">
          <div>
            <label for="password" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
              New Password
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
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
              Confirm Password
            </label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style="color: var(--text-muted);" />
              <input
                id="confirmPassword"
                type="password"
                bind:value={confirmPassword}
                required
                class="input pl-12"
                placeholder="••••••••"
              />
            </div>
            {#if confirmPassword && !passwordsMatch}
              <p class="mt-2 text-sm" style="color: var(--error);">Passwords do not match</p>
            {/if}
          </div>
          
          <button
            type="submit"
            disabled={loading || !passwordValid.length || !passwordValid.uppercase || !passwordValid.number || !passwordsMatch}
            class="btn-primary w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if loading}
              <Loader2 class="w-5 h-5 animate-spin" />
              Resetting...
            {:else}
              Reset Password
            {/if}
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>
