<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { Mail, ArrowLeft, RefreshCw, Hexagon } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme.svelte';
  
  let email = $state('');
  let resending = $state(false);
  let resendMessage = $state('');
  let isSuccess = $state(false);
  
  onMount(() => {
    theme.init();
    email = page.url.searchParams.get('email') || '';
  });
  
  async function resendEmail() {
    if (!email) return;
    
    resending = true;
    resendMessage = '';
    
    try {
      const res = await fetch('/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json() as { message?: string };
      
      if (res.ok) {
        resendMessage = 'Verification email sent! Please check your inbox.';
        isSuccess = true;
      } else {
        resendMessage = data.message || 'Failed to resend email. Please try again.';
        isSuccess = false;
      }
    } catch (err) {
      resendMessage = 'An error occurred. Please try again later.';
      isSuccess = false;
    } finally {
      resending = false;
    }
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
    
    <div class="card-elevated p-8 text-center">
      <!-- Icon -->
      <div class="mb-6">
        <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style="background-color: var(--accent-bg);">
          <Mail class="w-10 h-10" style="color: var(--accent-primary);" />
        </div>
      </div>
      
      <!-- Title -->
      <h1 class="font-display text-display-xs mb-3" style="color: var(--text-primary);">
        Verify Your Email
      </h1>
      
      <!-- Message -->
      <p class="mb-6" style="color: var(--text-secondary);">
        We've sent a verification email to
        <span class="font-medium" style="color: var(--text-primary);">{email || 'your email address'}</span>.
        Please check your inbox and click the link to verify your account.
      </p>
      
      <!-- Info box -->
      <div class="rounded-xl p-4 mb-6" style="background-color: var(--bg-hover); border: 1px solid var(--border-primary);">
        <p class="text-sm" style="color: var(--text-secondary);">
          <span class="font-medium" style="color: var(--accent-primary);">Tip:</span> 
          If you don't see the email, check your spam or junk folder. 
          The link will expire in 24 hours.
        </p>
      </div>
      
      <!-- Resend message -->
      {#if resendMessage}
        <div class="mb-4 p-3 rounded-lg text-sm" style="background-color: {isSuccess ? 'var(--success-bg)' : 'var(--error-bg)'}; color: {isSuccess ? 'var(--success)' : 'var(--error)'};">
          {resendMessage}
        </div>
      {/if}
      
      <!-- Actions -->
      <div class="space-y-3">
        <button
          onclick={resendEmail}
          disabled={resending || !email}
          class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition disabled:opacity-50 cursor-pointer"
          style="background-color: transparent; border: 1px solid var(--border-primary); color: var(--text-secondary);"
        >
          {#if resending}
            <RefreshCw class="w-4 h-4 animate-spin" />
            Sending...
          {:else}
            <RefreshCw class="w-4 h-4" />
            Resend Verification Email
          {/if}
        </button>
        
        <a 
          href="/login" 
          class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition btn-primary"
        >
          Go to Login
        </a>
      </div>
      
      <!-- Back link -->
      <div class="mt-6">
        <a 
          href="/register" 
          class="inline-flex items-center gap-2 text-sm transition cursor-pointer"
          style="color: var(--text-secondary);"
        >
          <ArrowLeft class="w-4 h-4" />
          Back to Register
        </a>
      </div>
    </div>
  </div>
</div>
