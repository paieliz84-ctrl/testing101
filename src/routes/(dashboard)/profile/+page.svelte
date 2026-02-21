<script lang="ts">
  import type { PageProps } from './$types';
  import { enhance } from '$app/forms';
  import { 
    Mail, MapPin, Link as LinkIcon, FileText, Camera, Loader2, 
    Check, Upload, X, User, Shield, Globe, AlertCircle
  } from 'lucide-svelte';
  
  let { data, form }: PageProps = $props();
  
  // Data from server load
  let user = $state(data.user);
  
  // Form state
  let saving = $state(false);
  let uploadingAvatar = $state(false);
  
  // Avatar upload state
  let avatarFile = $state<File | null>(null);
  let avatarPreview = $state<string | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);
  
  // Form fields (initialized from server data)
  let name = $state(user.name || '');
  let bio = $state(user.bio || '');
  let location = $state(user.location || '');
  let website = $state(user.website || '');
  
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      
      avatarFile = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  function clearAvatarSelection() {
    avatarFile = null;
    avatarPreview = null;
    if (fileInput) fileInput.value = '';
  }
  
  async function uploadAvatar() {
    if (!avatarFile) return;
    
    uploadingAvatar = true;
    
    try {
      const formData = new FormData();
      formData.append('file', avatarFile);
      formData.append('type', 'avatar');
      
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json() as { success: boolean; url?: string; message?: string };
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload avatar');
      }
      
      // Update profile with new avatar via API
      const updateRes = await fetch('/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: data.url }),
      });
      
      if (!updateRes.ok) {
        throw new Error('Failed to update profile');
      }
      
      const result = await updateRes.json();
      user = result.user;
      
      clearAvatarSelection();
      
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
    } finally {
      uploadingAvatar = false;
    }
  }
</script>

<svelte:head>
  <title>Profile | Studio</title>
</svelte:head>

<div class="p-6 lg:p-8 max-w-4xl mx-auto">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center gap-2 text-sm mb-2" style="color: var(--text-tertiary);">
      <span>Account</span>
      <span>/</span>
      <span style="color: var(--text-secondary);">Profile</span>
    </div>
    <h1 class="text-2xl font-display font-bold" style="color: var(--text-primary);">Profile Settings</h1>
    <p style="color: var(--text-secondary);" class="mt-1">Manage your account information and preferences.</p>
  </div>
  
  <div class="space-y-6">
    <!-- Profile Card -->
    <div class="card-elevated p-6">
      <div class="flex flex-col sm:flex-row items-start gap-6">
        <div class="relative">
          {#if avatarPreview}
            <img src={avatarPreview} alt="Preview" class="w-24 h-24 rounded-2xl object-cover" style="box-shadow: 0 0 0 4px var(--accent-bg);" />
            <button
              onclick={clearAvatarSelection}
              class="absolute -top-2 -right-2 p-1.5 bg-rose-500 rounded-lg hover:bg-rose-600 transition cursor-pointer"
            >
              <X class="w-4 h-4 text-white" />
            </button>
          {:else if user.avatar}
            <img src={user.avatar} alt={user.name} class="w-24 h-24 rounded-2xl object-cover" style="border: 2px solid var(--border-primary);" />
          {:else}
            <div class="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold" style="background: linear-gradient(135deg, var(--accent-primary), #d97706); color: #0a0a0a;">
              {user.name.charAt(0).toUpperCase()}
            </div>
          {/if}
          
          <button
            onclick={() => fileInput?.click()}
            class="absolute -bottom-2 -right-2 p-2 rounded-lg transition cursor-pointer"
            style="background-color: var(--bg-tertiary); border: 2px solid var(--bg-primary);"
          >
            <Camera class="w-4 h-4" style="color: var(--text-secondary);" />
          </button>
          
          <input
            type="file"
            bind:this={fileInput}
            onchange={handleFileSelect}
            accept="image/jpeg,image/png,image/gif,image/webp"
            class="hidden"
          />
        </div>
        
        <div class="flex-1">
          <h2 class="text-xl font-semibold" style="color: var(--text-primary);">{user.name}</h2>
          <div class="flex items-center gap-2 mt-1" style="color: var(--text-secondary);">
            <Mail class="w-4 h-4" />
            {user.email}
          </div>
          <div class="flex items-center gap-2 mt-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">
              <Globe class="w-3 h-3" />
              {user.provider === 'google' ? 'Google' : 'Email'}
            </span>
            {#if user.email_verified}
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium" style="background-color: var(--success-bg); color: var(--success);">
                <Check class="w-3 h-3" />
                Verified
              </span>
            {:else}
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium" style="background-color: var(--warning-bg); color: var(--warning);">
                <AlertCircle class="w-3 h-3" />
                Unverified
              </span>
            {/if}
          </div>
          
          {#if avatarFile}
            <div class="mt-4 flex items-center gap-3">
              <button
                onclick={uploadAvatar}
                disabled={uploadingAvatar}
                class="inline-flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                style="background-color: var(--accent-primary); color: #0a0a0a;"
              >
                {#if uploadingAvatar}
                  <Loader2 class="w-4 h-4 animate-spin" />
                  Uploading...
                {:else}
                  <Upload class="w-4 h-4" />
                  Upload
                {/if}
              </button>
              <button
                onclick={clearAvatarSelection}
                class="transition-colors cursor-pointer"
                style="color: var(--text-secondary);"
              >
                Cancel
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Messages -->
    {#if form?.error}
      <div class="p-4 rounded-xl text-sm flex items-center gap-2" style="background-color: var(--error-bg); color: var(--error); border: 1px solid var(--error-bg);">
        <AlertCircle class="w-4 h-4" />
        {form.error}
      </div>
    {/if}
    
    {#if form?.success}
      <div class="p-4 rounded-xl text-sm flex items-center gap-2" style="background-color: var(--success-bg); color: var(--success); border: 1px solid var(--success-bg);">
        <Check class="w-4 h-4" />
        Profile updated successfully!
      </div>
    {/if}
    
    <!-- Edit Form -->
    <div class="card-elevated p-6">
      <h3 class="font-semibold mb-6" style="color: var(--text-primary);">Edit Profile</h3>
      
      <form 
        method="POST" 
        action="?/update"
        use:enhance={() => {
          saving = true;
          return async ({ update }) => {
            await update();
            saving = false;
          };
        }}
        class="space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="name" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
              <User class="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              bind:value={name}
              required
              class="input"
            />
          </div>
          
          <div>
            <label for="location" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
              <MapPin class="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              bind:value={location}
              maxlength="100"
              class="input"
              placeholder="City, Country"
            />
          </div>
        </div>
        
        <div>
          <label for="bio" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
            <FileText class="w-4 h-4 inline mr-1" />
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            bind:value={bio}
            rows="3"
            maxlength="160"
            class="input resize-none"
            placeholder="Tell us about yourself..."
          ></textarea>
          <p class="text-xs mt-2 text-right" style="color: var(--text-muted);">{bio?.length || 0}/160</p>
        </div>
        
        <div>
          <label for="website" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
            <LinkIcon class="w-4 h-4 inline mr-1" />
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            bind:value={website}
            class="input"
            placeholder="https://yourwebsite.com"
          />
        </div>
        
        <div class="pt-4" style="border-top: 1px solid var(--border-primary);">
          <button
            type="submit"
            disabled={saving}
            class="btn-primary cursor-pointer"
          >
            {#if saving}
              <Loader2 class="w-5 h-5 animate-spin" />
              Saving...
            {:else}
              Save Changes
            {/if}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Security -->
    <div class="card-elevated p-6">
      <h3 class="font-semibold mb-4" style="color: var(--text-primary);">Security</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between py-3" style="border-bottom: 1px solid var(--border-primary);">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background-color: var(--bg-tertiary);">
              <Shield class="w-5 h-5" style="color: var(--text-secondary);" />
            </div>
            <div>
              <p class="font-medium" style="color: var(--text-primary);">Password</p>
              <p class="text-sm" style="color: var(--text-secondary);">Change your account password</p>
            </div>
          </div>
          <a 
            href="/forgot-password" 
            class="font-medium text-sm transition-colors"
            style="color: var(--accent-primary);"
          >
            Change
          </a>
        </div>
        
        {#if !user.email_verified}
          <div class="flex items-center justify-between py-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background-color: var(--bg-tertiary);">
                <Mail class="w-5 h-5" style="color: var(--text-secondary);" />
              </div>
              <div>
                <p class="font-medium" style="color: var(--text-primary);">Email Verification</p>
                <p class="text-sm" style="color: var(--text-secondary);">Verify your email address</p>
              </div>
            </div>
            <form method="POST" action="/auth/resend-verification">
              <input type="hidden" name="email" value={user.email} />
              <button 
                type="submit"
                class="font-medium text-sm transition-colors cursor-pointer"
                style="color: var(--accent-primary);"
              >
                Resend
              </button>
            </form>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
